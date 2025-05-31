import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, File, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

interface DocumentUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  acceptedFileTypes?: string;
}

export function DocumentUpload({
  onUpload,
  maxFiles = 5,
  acceptedFileTypes = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
}: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    if (files.length + fileList.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    const newFiles = Array.from(fileList);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    try {
      await onUpload(files);
      setFiles([]);
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        setUploading(false);
      }, 500);
    } catch (error) {
      console.error("Upload failed:", error);
      clearInterval(interval);
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <h3 className="font-medium text-lg">Drag & Drop Files</h3>
          <p className="text-sm text-muted-foreground">
            or click to browse files
          </p>
          <Input
            id="file-upload"
            type="file"
            multiple
            accept={acceptedFileTypes}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={uploading}
          >
            Select Files
          </Button>
          <p className="text-xs text-muted-foreground">
            Maximum {maxFiles} files. Accepted formats: {acceptedFileTypes}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>

          {uploading && <Progress value={progress} className="h-2" />}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear All
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Files"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}