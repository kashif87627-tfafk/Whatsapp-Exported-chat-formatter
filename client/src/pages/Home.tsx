import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useCreateChat } from "@/hooks/use-chats";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { UploadCloud, FileText, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const { mutate: createChat, isPending } = useCreateChat();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      
      // Default title to filename without extension
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt']
    },
    maxFiles: 1,
  });

  const handleUpload = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        createChat(
          { title: title || 'Untitled Chat', rawText: text },
          {
            onSuccess: (data) => {
              toast({ title: "Chat parsed successfully!" });
              setLocation(`/chat/${data.id}`);
            },
            onError: (err) => {
              toast({ 
                title: "Failed to process file", 
                description: err.message,
                variant: "destructive"
              });
            }
          }
        );
      }
    };
    reader.onerror = () => {
      toast({ 
        title: "Error reading file", 
        variant: "destructive"
      });
    };
    reader.readAsText(file);
  };

  return (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center bg-background/50 p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-2xl mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-2">
              WhatsApp Chat Viewer
            </h1>
            <p className="text-muted-foreground text-lg">
              Export your chat to a .txt file and drop it below to view it in a beautiful interface.
            </p>
          </div>

          <Card className="p-1">
            <div className="bg-card rounded-xl p-6 md:p-8 border border-border/50 shadow-sm">
              {!file ? (
                <div 
                  {...getRootProps()} 
                  className={`
                    border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
                    flex flex-col items-center justify-center min-h-[240px]
                    ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-secondary/50'}
                  `}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className={`w-12 h-12 mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="text-lg font-medium mb-1">
                    {isDragActive ? "Drop the file here..." : "Drag & drop your chat export"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse (.txt files only)
                  </p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary border border-border">
                    <div className="p-2 bg-background rounded-md text-primary shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setFile(null)}
                      disabled={isPending}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Chat Title</Label>
                    <Input 
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Family Group"
                      className="h-12 bg-background"
                      disabled={isPending}
                    />
                  </div>

                  <Button 
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all" 
                    size="lg"
                    onClick={handleUpload}
                    disabled={isPending || !title.trim()}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Chat...
                      </>
                    ) : (
                      "Parse & View Chat"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
