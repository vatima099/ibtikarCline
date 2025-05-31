import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function ClientsPage() {
  const { t } = useTranslation("common");
  const { toast } = useToast();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const isAdmin = session?.user?.role === "admin";

  const {
    data: clients,
    isLoading,
    refetch,
  } = trpc.masterData.clients.getAll.useQuery();

  const createClient = trpc.masterData.clients.create.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Client created successfully",
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

  const updateClient = trpc.masterData.clients.update.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Client updated successfully",
      });
      refetch();
      setIsDialogOpen(false);
      setEditingClient(null);
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteClient = trpc.masterData.clients.delete.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Client deleted successfully",
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

  const filteredClients = clients?.filter((client: any) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      industry: formData.get("industry") as string,
      website: formData.get("website") as string,
      country: formData.get("country") as string,
    };

    if (editingClient) {
      updateClient.mutate({ id: editingClient.id, data });
    } else {
      createClient.mutate(data);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("pages.masterData.clients.title")}
            </h1>
            <p className="text-muted-foreground">Manage your client database</p>
            {!isAdmin && (
              <p className="text-sm text-yellow-600 mt-1">
                View only - Admin access required for modifications
              </p>
            )}
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingClient(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("pages.masterData.clients.addClient")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingClient ? t("common.edit") : t("common.add")}{" "}
                    {t("navigation.clients")}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the client information below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      {t("pages.masterData.clients.name")}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingClient?.name || ""}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">
                      {t("pages.masterData.clients.industry")}
                    </Label>
                    <Input
                      id="industry"
                      name="industry"
                      defaultValue={editingClient?.industry || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">
                      {t("pages.masterData.clients.website")}
                    </Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      defaultValue={editingClient?.website || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">
                      {t("pages.masterData.clients.country")}
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      defaultValue={editingClient?.country || ""}
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
                      {editingClient ? t("common.update") : t("common.create")}
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
                  "navigation.clients"
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
                  <TableHead>{t("pages.masterData.clients.name")}</TableHead>
                  <TableHead>
                    {t("pages.masterData.clients.industry")}
                  </TableHead>
                  <TableHead>{t("pages.masterData.clients.country")}</TableHead>
                  <TableHead>{t("pages.masterData.clients.website")}</TableHead>
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
                ) : filteredClients?.length ? (
                  filteredClients.map((client: any) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell>{client.industry}</TableCell>
                      <TableCell>{client.country}</TableCell>
                      <TableCell>
                        {client.website && (
                          <a
                            href={client.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {client.website}
                          </a>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={client.active ? "default" : "secondary"}
                        >
                          {client.active
                            ? t("pages.masterData.clients.active")
                            : "Inactive"}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingClient(client);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                deleteClient.mutate({ id: client.id })
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
                      No clients found
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
  // Only restrict create/edit/delete operations to admins in the API
  return {
    props: {
      ...(await serverSideTranslations(context.locale!, ["common"])),
      session,
    },
  };
};
