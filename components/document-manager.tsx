import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  UploadCloud,
  File,
  X,
  Loader2,
  Download,
  Eye,
  Trash2,
  Image as ImageIcon,
  FileText,
  Archive,
  Camera,
  Award,
  Folder,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

// Document types as per specification
interface DocumentFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  category: "screenshots" | "completionCertificate" | "otherDocuments";
  uploadDate: Date;
  url: string;
  thumbnail?: string;
}

interface DocumentManagerProps {
  referenceId?: string;
  initialDocuments?: DocumentFile[];
  onDocumentsChange?: (documents: DocumentFile[]) => void;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
}

const DEFAULT_ALLOWED_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".xlsx",
  ".xls",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
];

const CATEGORY_CONFIG = {
  screenshots: {
    title: "Screenshots",
    description: "Project screenshots and visual materials",
    icon: Camera,
    maxFiles: 10,
    acceptedTypes: [".jpg", ".jpeg", ".png", ".gif"],
    color: "blue",
  },
  completionCertificate: {
    title: "Completion Certificate",
    description: "Project completion certificate or client testimonial",
    icon: Award,
    maxFiles: 1,
    acceptedTypes: [".pdf", ".doc", ".docx"],
    color: "green",
  },
  otherDocuments: {
    title: "Other Documents",
    description: "Case studies, SOW excerpts, and other relevant documents",
    icon: Folder,
    maxFiles: 5,
    acceptedTypes: DEFAULT_ALLOWED_TYPES,
    color: "purple",
  },
};

export function DocumentManager({
  referenceId,
  initialDocuments = [],
  onDocumentsChange,
  maxFileSize = 10,
  allowedFileTypes = DEFAULT_ALLOWED_TYPES,
}: DocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentFile[]>(initialDocuments);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentFile | null>(
    null
  );
  const { toast } = useToast();

  // Update parent component when documents change
  React.useEffect(() => {
    onDocumentsChange?.(documents);
  }, [documents, onDocumentsChange]);

  const handleDrag = useCallback(
    (e: React.DragEvent, category: string, active: boolean) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(active ? category : null);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, category: keyof typeof CATEGORY_CONFIG) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(null);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files, category);
      }
    },
    []
  );

  const validateFile = (
    file: File,
    category: keyof typeof CATEGORY_CONFIG
  ): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const categoryConfig = CATEGORY_CONFIG[category];

    if (!categoryConfig.acceptedTypes.includes(fileExtension)) {
      return `File type not allowed. Accepted types: ${categoryConfig.acceptedTypes.join(
        ", "
      )}`;
    }

    // Check max files for category
    const existingFiles = documents.filter((doc) => doc.category === category);
    if (existingFiles.length >= categoryConfig.maxFiles) {
      return `Maximum ${categoryConfig.maxFiles} files allowed for ${categoryConfig.title}`;
    }

    return null;
  };

  const handleFileUpload = async (
    fileList: FileList,
    category: keyof typeof CATEGORY_CONFIG
  ) => {
    const files = Array.from(fileList);

    for (const file of files) {
      const validationError = validateFile(file, category);
      if (validationError) {
        toast({
          title: "Upload Error",
          description: validationError,
          variant: "destructive",
        });
        continue;
      }

      try {
        setUploading(category);
        setUploadProgress(0);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        // Create FormData for file upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);
        if (referenceId) {
          formData.append("referenceId", referenceId);
        }

        // Upload file to API
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();

        // Create document object
        const newDocument: DocumentFile = {
          id: crypto.randomUUID(),
          name: result.filename || file.name,
          originalName: file.name,
          size: file.size,
          type: file.type,
          category,
          uploadDate: new Date(),
          url: result.filepath || "#",
          thumbnail: file.type.startsWith("image/")
            ? result.filepath
            : undefined,
        };

        setDocuments((prev) => [...prev, newDocument]);
        clearInterval(progressInterval);
        setUploadProgress(100);

        toast({
          title: "Upload Successful",
          description: `${file.name} has been uploaded successfully.`,
        });
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive",
        });
      } finally {
        setUploading(null);
        setUploadProgress(0);
      }
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: keyof typeof CATEGORY_CONFIG
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files, category);
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // API call to delete document
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      toast({
        title: "Document Deleted",
        description: "Document has been deleted successfully.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadDocument = (doc: DocumentFile) => {
    const link = document.createElement("a");
    link.href = doc.url;
    link.download = doc.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isImageFile = (type: string) => type.startsWith("image/");

  const renderDocumentGrid = (category: keyof typeof CATEGORY_CONFIG) => {
    const categoryDocs = documents.filter((doc) => doc.category === category);
    const config = CATEGORY_CONFIG[category];

    return (
      <div className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive === category
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragEnter={(e) => handleDrag(e, category, true)}
          onDragLeave={(e) => handleDrag(e, category, false)}
          onDragOver={(e) => handleDrag(e, category, true)}
          onDrop={(e) => handleDrop(e, category)}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <config.icon className="h-10 w-10 text-muted-foreground" />
            <h3 className="font-medium text-lg">{config.title}</h3>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
            <p className="text-xs text-muted-foreground">
              Max {config.maxFiles} files • {config.acceptedTypes.join(", ")} •
              Max {maxFileSize}MB each
            </p>

            <Input
              id={`file-upload-${category}`}
              type="file"
              multiple={config.maxFiles > 1}
              accept={config.acceptedTypes.join(",")}
              onChange={(e) => handleFileSelect(e, category)}
              className="hidden"
            />

            <Button
              variant="outline"
              onClick={() =>
                document.getElementById(`file-upload-${category}`)?.click()
              }
              disabled={
                uploading === category || categoryDocs.length >= config.maxFiles
              }
            >
              {uploading === category ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Select Files
                </>
              )}
            </Button>

            {uploading === category && (
              <div className="w-full max-w-xs">
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        </div>

        {/* Documents List */}
        {categoryDocs.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              Uploaded Files ({categoryDocs.length}/{config.maxFiles})
            </h4>
            <div className="grid gap-3">
              {categoryDocs.map((doc) => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {isImageFile(doc.type) ? (
                        <div className="flex-shrink-0">
                          {doc.thumbnail ? (
                            <Image
                              src={doc.thumbnail}
                              alt={doc.name}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                      ) : (
                        <FileText className="h-10 w-10 text-muted-foreground flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {doc.originalName}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Preview Button */}
                      {isImageFile(doc.type) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPreviewDocument(doc)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Download Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadDocument(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      {/* Delete Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Document</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "
                              {doc.originalName}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteDocument(doc.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Document Management</h2>
          <p className="text-muted-foreground">
            Upload and manage documents for this reference
          </p>
        </div>
        <Badge variant="outline">
          {documents.length} {documents.length === 1 ? "Document" : "Documents"}
        </Badge>
      </div>

      <Tabs defaultValue="screenshots" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="flex items-center space-x-2"
            >
              <config.icon className="h-4 w-4" />
              <span>{config.title}</span>
              <Badge variant="secondary" className="ml-2">
                {documents.filter((doc) => doc.category === key).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(CATEGORY_CONFIG).map((category) => (
          <TabsContent key={category} value={category}>
            {renderDocumentGrid(category as keyof typeof CATEGORY_CONFIG)}
          </TabsContent>
        ))}
      </Tabs>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!previewDocument}
        onOpenChange={() => setPreviewDocument(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewDocument?.originalName}</DialogTitle>
            <DialogDescription>
              {previewDocument && formatFileSize(previewDocument.size)} •
              Uploaded{" "}
              {previewDocument &&
                new Date(previewDocument.uploadDate).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          {previewDocument && isImageFile(previewDocument.type) && (
            <div className="flex justify-center">
              <Image
                src={previewDocument.url}
                alt={previewDocument.name}
                width={800}
                height={600}
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
