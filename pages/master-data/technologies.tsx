import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export default function TechnologiesPage() {
  const { t } = useTranslation("common");
  const { toast } = useToast();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTechnology, setEditingTechnology] = useState<any>(null);

  const isAdmin = session?.user?.role === "admin";

  const {
    data: technologies,
    isLoading,
    refetch,
  } = trpc.masterData.technologies.getAll.useQuery();

  const createTechnology = trpc.masterData.technologies.create.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Technology created successfully",
      });
      refetch();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTechnology = trpc.masterData.technologies.update.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Technology updated successfully",
      });
      refetch();
      setIsDialogOpen(false);
      setEditingTechnology(null);
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTechnology = trpc.masterData.technologies.delete.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Technology deleted successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredTechnologies = technologies?.filter((tech: any) =>
    tech.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      version: formData.get("version") as string,
    };

    if (editingTechnology) {
      updateTechnology.mutate({ id: editingTechnology.id, data });
    } else {
      createTechnology.mutate(data);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("pages.masterData.technologies.title")}
            </h1>
            <p className="text-muted-foreground">
              Manage technologies database
            </p>
            {!isAdmin && (
              <p className="text-sm text-yellow-600 mt-1">
                View only - Admin access required for modifications
              </p>
            )}
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingTechnology(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("pages.masterData.technologies.addTechnology")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTechnology ? t("common.edit") : t("common.add")}{" "}
                    {t("navigation.technologies")}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the technology information below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      {t("pages.masterData.technologies.name")}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingTechnology?.name || ""}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">
                      {t("pages.masterData.technologies.category")}
                    </Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={editingTechnology?.category || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">
                      {t("pages.references.description")}
                    </Label>
                    <Input
                      id="description"
                      name="description"
                      defaultValue={editingTechnology?.description || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">
                      {t("pages.masterData.technologies.version")}
                    </Label>
                    <Input
                      id="version"
                      name="version"
                      defaultValue={editingTechnology?.version || ""}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit">
                      {editingTechnology
                        ? t("common.update")
                        : t("common.create")}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder={`${t("common.search")} ${t(
                  "navigation.technologies"
                ).toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("pages.masterData.technologies.name")}
                  </TableHead>
                  <TableHead>
                    {t("pages.masterData.technologies.category")}
                  </TableHead>
                  <TableHead>{t("pages.references.description")}</TableHead>
                  <TableHead>
                    {t("pages.masterData.technologies.version")}
                  </TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  {isAdmin && (
                    <TableHead>{t("pages.references.actions")}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 6 : 5}
                      className="text-center"
                    >
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredTechnologies?.length ? (
                  filteredTechnologies.map((tech: any) => (
                    <TableRow key={tech.id}>
                      <TableCell className="font-medium">{tech.name}</TableCell>
                      <TableCell>
                        {tech.category && (
                          <Badge variant="outline">{tech.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {tech.description}
                      </TableCell>
                      <TableCell>{tech.version}</TableCell>
                      <TableCell>
                        <Badge variant={tech.active ? "default" : "secondary"}>
                          {tech.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingTechnology(tech);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                deleteTechnology.mutate({ id: tech.id })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 6 : 5}
                      className="text-center"
                    >
                      No technologies found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  // Allow all authenticated users to view master data
  return {
    props: {
      ...(await serverSideTranslations(context.locale!, ["common"])),
      session,
    },
  };
};
