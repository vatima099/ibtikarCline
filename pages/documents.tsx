import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "@/components/layout/Layout";
import { DocumentManager } from "@/components/document-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Upload, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  referenceId?: string;
  referenceTitle?: string;
}

export default function DocumentsPage() {
  const { t } = useTranslation("common");
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showUploadArea, setShowUploadArea] = useState(false);

  const handleDocumentsChange = (newDocuments: DocumentFile[]) => {
    setDocuments(newDocuments);
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.originalName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const documentStats = {
    total: documents.length,
    screenshots: documents.filter((d) => d.category === "screenshots").length,
    certificates: documents.filter(
      (d) => d.category === "completionCertificate"
    ).length,
    other: documents.filter((d) => d.category === "otherDocuments").length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {t("pages.documents.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("pages.documents.description")}
            </p>
          </div>
          <Button
            onClick={() => setShowUploadArea(!showUploadArea)}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>{showUploadArea ? "Hide Upload" : "Upload Documents"}</span>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Documents
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentStats.total}</div>
              <p className="text-xs text-muted-foreground">
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Screenshots</CardTitle>
              <Badge variant="outline" className="text-xs">
                IMG
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documentStats.screenshots}
              </div>
              <p className="text-xs text-muted-foreground">Project visuals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Certificates
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                DOC
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {documentStats.certificates}
              </div>
              <p className="text-xs text-muted-foreground">Completion docs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Other Documents
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                ALL
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentStats.other}</div>
              <p className="text-xs text-muted-foreground">Various files</p>
            </CardContent>
          </Card>
        </div>

        {/* Upload Area */}
        {showUploadArea && (
          <>
            <Separator />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload New Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentManager
                  onDocumentsChange={handleDocumentsChange}
                  maxFileSize={10}
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search documents by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="screenshots">Screenshots</SelectItem>
                    <SelectItem value="completionCertificate">
                      Certificates
                    </SelectItem>
                    <SelectItem value="otherDocuments">
                      Other Documents
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document List */}
        <Card>
          <CardHeader>
            <CardTitle>Document Library</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredDocuments.length} of {documents.length} documents
            </p>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents found</h3>
                <p className="text-muted-foreground mb-4">
                  {documents.length === 0
                    ? "Upload your first document to get started"
                    : "Try adjusting your search or filter criteria"}
                </p>
                {documents.length === 0 && (
                  <Button onClick={() => setShowUploadArea(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Document list would go here */}
                <p className="text-muted-foreground">
                  Document management functionality is available. Documents
                  uploaded through the upload area above will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Tips for Document Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">File Organization</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use descriptive filenames</li>
                  <li>• Choose the appropriate category</li>
                  <li>• Keep file sizes under 10MB</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Supported Formats</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Images: JPG, PNG, GIF</li>
                  <li>• Documents: PDF, DOC, DOCX</li>
                  <li>• Spreadsheets: XLS, XLSX</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale ?? "fr", ["common"])),
    },
  };
};
