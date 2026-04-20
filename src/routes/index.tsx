import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileVideo, Image as ImageIcon, ShieldAlert, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: UploadDashboard,
});

type ScanResult = {
  id: string;
  filename: string;
  thumbnail: string;
  probability: number;
  type: string;
  timestamp: string;
};

function UploadDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("media", file);
      
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to analyze file");
      }

      return res.json();
    },
    onSuccess: (data, file) => {
      const isVideo = file.type.startsWith("video/");
      
      const newResult: ScanResult = {
        id: crypto.randomUUID(),
        filename: file.name,
        thumbnail: preview || "",
        probability: data.probability || 0,
        type: isVideo ? "video" : "image",
        timestamp: new Date().toISOString(),
      };

      setResult(newResult);

      const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
      localStorage.setItem("scanHistory", JSON.stringify([newResult, ...history]));
      toast.success("Analysis complete");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const validateAndSetFile = (selectedFile: File) => {
    const isVideo = selectedFile.type.startsWith("video/");
    const isImage = selectedFile.type.startsWith("image/");
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;

    if (!isVideo && !isImage) {
      toast.error("Unsupported file type. Please upload a JPG, PNG, WEBP, MP4, or MOV.");
      return;
    }

    if (selectedFile.size > maxSize) {
      toast.error(`File too large. Maximum size is ${isVideo ? "50MB" : "10MB"}.`);
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    setResult(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleScan = () => {
    if (file) {
      mutation.mutate(file);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    mutation.reset();
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-display font-bold md:text-4xl">Deepfake Scanner</h1>
      <p className="mt-2 text-muted-foreground pb-8 border-b border-border/40 mb-8">
        Upload an image or video to verify its authenticity using the Aegis Engine.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <Card 
            className={`border-dashed border-2 transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border/40'} ${file && !result ? 'border-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              <CardContent className="flex flex-col items-center justify-center p-12 text-center h-[400px]">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <UploadCloud className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Drag & drop your media</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse your files
                </p>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                  onChange={(e) => {
                    if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]);
                  }}
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                  Browse Files
                </Button>
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Max 10MB</span>
                  <span className="flex items-center gap-1.5"><FileVideo className="w-3.5 h-3.5" /> Max 50MB</span>
                </div>
              </CardContent>
            ) : (
              <div className="relative h-[400px] bg-background/50 overflow-hidden rounded-xl border border-border/40">
                {file.type.startsWith("video/") ? (
                  <video src={preview!} controls className="w-full h-full object-contain bg-black/5" />
                ) : (
                  <img src={preview!} alt="Upload preview" className="w-full h-full object-contain bg-black/5" />
                )}
                
                {mutation.isPending && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="font-medium animate-pulse">Running Aegis Scan...</p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-[200px] text-center">
                      {file.type.startsWith("video/") 
                        ? "Video analysis in progress. Please wait up to 2 minutes." 
                        : "Applying neural layers. This will take a moment."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
          
          <div className="flex gap-4">
            {!result ? (
              <Button 
                onClick={handleScan} 
                disabled={!file || mutation.isPending} 
                className="w-full h-12 text-md"
              >
                {mutation.isPending ? "Analyzing..." : "Run Analysis"}
              </Button>
            ) : (
              <Button onClick={reset} variant="outline" className="w-full h-12 text-md">
                Scan another file
              </Button>
            )}
            {file && !mutation.isPending && !result && (
              <Button onClick={reset} variant="ghost" className="h-12 px-8">Clear</Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Scan Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResultVisualizer probability={result.probability} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 border-b border-white/5">
                  <CardTitle className="text-sm">Technical Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Filename</span>
                    <span className="font-mono text-xs">{result.filename}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Media Type</span>
                    <span className="capitalize">{result.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confidence Score</span>
                    <span className="font-mono text-xs">{(result.probability * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Timestamp</span>
                    <span className="font-mono text-xs">{new Date(result.timestamp).toLocaleTimeString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResultVisualizer({ probability }: { probability: number }) {
  const isDeepfake = probability > 0.7;
  const isAuthentic = probability < 0.3;
  
  const status = isDeepfake ? "DEEPFAKE DETECTED" : isAuthentic ? "LIKELY AUTHENTIC" : "INCONCLUSIVE";
  const color = isDeepfake ? "text-destructive" : isAuthentic ? "text-success" : "text-amber-500";
  const bg = isDeepfake ? "bg-destructive/10 border-destructive/20" : isAuthentic ? "bg-success/10 border-success/20" : "bg-amber-500/10 border-amber-500/20";
  const Icon = isDeepfake ? ShieldAlert : isAuthentic ? ShieldCheck : HelpCircle;

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className={`p-4 rounded-full border mb-6 ${bg}`}>
        <Icon className={`w-12 h-12 ${color}`} />
      </div>
      
      <div className={`text-sm font-bold tracking-widest ${color} mb-2`}>
        {status}
      </div>
      
      <div className="text-6xl font-display font-light mb-6 tracking-tight">
        {(probability * 100).toFixed(1)}<span className="text-3xl text-muted-foreground ml-1">%</span>
      </div>

      <div className="w-full relative h-2 bg-secondary rounded-full overflow-hidden">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${probability * 100}%` }}
           transition={{ duration: 1, ease: "easeOut" }}
           className={`absolute left-0 top-0 bottom-0 ${isDeepfake ? "bg-destructive" : isAuthentic ? "bg-success" : "bg-amber-500"}`}
         />
      </div>
      <div className="w-full flex justify-between mt-2 text-[10px] uppercase text-muted-foreground font-mono">
        <span>Authentic</span>
        <span>Deepfake</span>
      </div>
    </div>
  );
}
