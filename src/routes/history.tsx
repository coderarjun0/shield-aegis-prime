import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";
import { FileVideo, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

type ScanResult = {
  id: string;
  filename: string;
  thumbnail: string;
  probability: number;
  type: string;
  timestamp: string;
};

function HistoryPage() {
  const [history, setHistory] = useState<ScanResult[]>([]);

  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem("scanHistory") || "[]");
    setHistory(loaded);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("scanHistory");
    setHistory([]);
  };

  const authenticCount = history.filter((h) => h.probability < 0.3).length;
  const deepfakeCount = history.filter((h) => h.probability > 0.7).length;
  const inconclusiveCount = history.length - authenticCount - deepfakeCount;

  const chartData = [
    { name: "Authentic", value: authenticCount, color: "hsl(var(--success, 142.1 76.2% 36.3%))" },
    { name: "Deepfake", value: deepfakeCount, color: "hsl(var(--destructive, 0 84.2% 60.2%))" },
    { name: "Inconclusive", value: inconclusiveCount, color: "hsl(var(--warning, 38 92% 50%))" },
  ].filter((d) => d.value > 0);

  return (
    <div className="container max-w-6xl py-10">
      <div className="flex justify-between items-end mb-8 border-b border-border/40 pb-8">
        <div>
          <h1 className="text-3xl font-display font-bold md:text-4xl">Scan History</h1>
          <p className="mt-2 text-muted-foreground">
            Review past analysis results and system statistics.
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="destructive" onClick={clearHistory}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No scans found. Upload a file on the home page to see it here.</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Verdict Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Verdict</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((scan) => {
                      const isDeepfake = scan.probability > 0.7;
                      const isAuthentic = scan.probability < 0.3;
                      
                      return (
                        <TableRow key={scan.id}>
                          <TableCell className="font-medium flex items-center gap-3">
                            <div className="w-8 h-8 rounded shrink-0 bg-secondary overflow-hidden border">
                               {scan.thumbnail ? (
                                  <img src={scan.thumbnail} className="w-full h-full object-cover" />
                               ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    {scan.type === "video" ? <FileVideo className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                                  </div>
                               )}
                            </div>
                            <span className="truncate max-w-[150px]">{scan.filename}</span>
                          </TableCell>
                          <TableCell className="capitalize">{scan.type}</TableCell>
                          <TableCell className="font-mono">{(scan.probability * 100).toFixed(1)}%</TableCell>
                          <TableCell>
                            {isDeepfake ? (
                              <Badge variant="destructive" className="bg-destructive/20 text-destructive border-transparent">Deepfake</Badge>
                            ) : isAuthentic ? (
                              <Badge className="bg-success/20 text-success border-transparent hover:bg-success/30">Authentic</Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-500 border-amber-500/50">Inconclusive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(scan.timestamp).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
