import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { getRequestEvent } from "@tanstack/react-start/server";

export const Route = createAPIFileRoute("/api/analyze")({
  POST: async ({ request }) => {
    try {
      const event = getRequestEvent();
      const env = (event.context as any)?.cloudflare?.env || process.env;
      const apiUser = env.SIGHTENGINE_API_USER;
      const apiSecret = env.SIGHTENGINE_API_SECRET;

      if (!apiUser || !apiSecret) {
        return json({ error: "Missing API credentials" }, { status: 500 });
      }

      const formData = await request.formData();
      const file = formData.get("media") as File;

      if (!file) {
        return json({ error: "No media file provided" }, { status: 400 });
      }

      const isVideo = file.type.startsWith("video/");
      const endpoint = isVideo 
        ? "https://api.sightengine.com/1.0/video/check.json"
        : "https://api.sightengine.com/1.0/check.json";

      const apiFormData = new FormData();
      apiFormData.append("media", file);
      apiFormData.append("models", "deepfake");
      apiFormData.append("api_user", apiUser);
      apiFormData.append("api_secret", apiSecret);

      const response = await fetch(endpoint, {
        method: "POST",
        body: apiFormData,
      });

      const data = await response.json();

      if (data.status !== "success" && data.status !== "ongoing") {
        return json({ error: "Sightengine API Error", details: data }, { status: 500 });
      }

      if (isVideo) {
        // Handle Video Polling
        const mediaId = data.media?.id;
        if (!mediaId) {
          return json({ error: "Missing media ID for video" }, { status: 500 });
        }

        const maxAttempts = 40; // 2 minutes with 3 seconds interval = 40 attempts
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 3000));

          const pollResponse = await fetch(
            `https://api.sightengine.com/1.0/video/check.json?media_id=${mediaId}&api_user=${apiUser}&api_secret=${apiSecret}`
          );
          const pollData = await pollResponse.json();

          if (pollData.status === "failure") {
            return json({ error: "Video processing failed on Sightengine" }, { status: 500 });
          }

          if (pollData.status === "finished" || pollData.data?.frames) {
             const prob = extractDeepfakeScore(pollData);
             return json({ probability: prob, type: "video" });
          }
        }
        return json({ error: "Video processing timed out" }, { status: 504 });
      } else {
        // Image processing is immediate
        const prob = extractDeepfakeScore(data);
        return json({ probability: prob, type: "image", raw: data });
      }

    } catch (error: any) {
      console.error(error);
      return json({ error: error.message || "Internal server error" }, { status: 500 });
    }
  },
});

function extractDeepfakeScore(data: any): number {
  if (!data) return 0;
  let maxProb = 0;

  const findProb = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (key === 'deepfake' && typeof obj[key] === 'number') {
        maxProb = Math.max(maxProb, obj[key]);
      } else if (key === 'artificial_manipulation' && typeof obj[key] === 'number') {
        maxProb = Math.max(maxProb, obj[key]);
      } else if (typeof obj[key] === 'object') {
        findProb(obj[key]);
      }
    }
  };
  findProb(data);

  return maxProb;
}
