import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { DocumentManager } from "@/components/document-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Calendar, User, Building } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

// Import DocumentFile type
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

interface Reference {
  id: string;
  title: string;
  description: string;
  client: string;
  country: string;
  status: "En cours" | "Completed";
  priority: "High" | "Medium" | "Low";
  responsible: string;
  startDate: string;
  endDate?: string;
  technologies: string[];
  createdAt: string;
  updatedAt: string;
}

interface DocumentsPageProps {
  referenceId: string;
  reference: Reference;
}

export default function DocumentsPage({
  referenceId,
  reference,
}: DocumentsPageProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  const handleDocumentsChange = (newDocuments: DocumentFile[]) => {
    setDocuments(newDocuments);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "destructive";
      case "Medium":
        return "default";
      case "Low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Completed" ? "default" : "secondary";
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/references/${referenceId}`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Document Management</h1>
              <p className="text-muted-foreground">
                Manage documents for "{reference.title}"
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor(reference.status)}>
              {reference.status}
            </Badge>
            <Badge variant={getPriorityColor(reference.priority)}>
              {reference.priority} Priority
            </Badge>
          </div>
        </div>

        {/* Reference Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Reference Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Title
                  </h3>
                  <p className="text-sm">{reference.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Description
                  </h3>
                  <p className="text-sm">{reference.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{reference.client}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm">{reference.country}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Responsible
                  </h3>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{reference.responsible}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Timeline
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(reference.startDate).toLocaleDateString()}
                      {reference.endDate && (
                        <>
                          {" "}
                          - {new Date(reference.endDate).toLocaleDateString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {reference.technologies.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Document Manager */}
        <DocumentManager
          referenceId={referenceId}
          onDocumentsChange={handleDocumentsChange}
          maxFileSize={10}
        />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Link href={`/references/${referenceId}`}>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Reference Details
                </Button>
              </Link>
              <Link href={`/references/${referenceId}/edit`}>
                <Button variant="outline">Edit Reference</Button>
              </Link>
              <Link href="/references">
                <Button variant="outline">Back to References</Button>
              </Link>
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

  const { id } = context.params!;

  // In a real application, you would fetch the reference from your database
  // For now, we'll use mock data
  const mockReference: Reference = {
    id: id as string,
    title: "E-Commerce Platform Development",
    description:
      "Development of a comprehensive e-commerce platform with advanced features including payment integration, inventory management, and customer analytics.",
    client: "Tech Innovations Mauritania",
    country: "Mauritania",
    status: "En cours",
    priority: "High",
    responsible: session.user?.email || "unknown@example.com",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    technologies: [
      "Next.js",
      "TypeScript",
      "MongoDB",
      "Stripe API",
      "Tailwind CSS",
    ],
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  };

  return {
    props: {
      referenceId: id as string,
      reference: mockReference,
    },
  };
};
