import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

const availablePermissions = [
  "read",
  "write",
  "create",
  "update",
  "delete",
  "admin",
];

export default function RolesPage() {
  const { t } = useTranslation("common");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const {
    data: roles,
    isLoading,
    refetch,
  } = trpc.roles.roles.getAll.useQuery();

  const createRole = trpc.roles.roles.create.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Role created successfully",
      });
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRole = trpc.roles.roles.update.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Role updated successfully",
      });
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRole = trpc.roles.roles.delete.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Role deleted successfully",
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

  const filteredRoles = roles?.filter((role: any) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setEditingRole(null);
    setSelectedPermissions([]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      permissions: selectedPermissions,
    };

    if (editingRole) {
      updateRole.mutate({ id: editingRole.id, data });
    } else {
      createRole.mutate(data);
    }
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions || []);
    setIsDialogOpen(true);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permission]);
    } else {
      setSelectedPermissions(
        selectedPermissions.filter((p) => p !== permission)
      );
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("pages.roles.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("pages.roles.description")}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                {t("pages.roles.addRole")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? t("common.edit") : t("common.add")}{" "}
                  {t("pages.roles.title")}
                </DialogTitle>
                <DialogDescription>
                  Fill in the role information and select permissions.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("pages.roles.roleName")}</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingRole?.name || ""}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">
                    {t("pages.roles.description")}
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    defaultValue={editingRole?.description || ""}
                  />
                </div>
                <div>
                  <Label>{t("pages.roles.permissions")}</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {availablePermissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={permission}
                          checked={selectedPermissions.includes(permission)}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(permission, !!checked)
                          }
                        />
                        <Label htmlFor={permission}>
                          {t(`permissions.${permission}`)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit">
                    {editingRole ? t("common.update") : t("common.create")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder={`${t("common.search")} roles...`}
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
                  <TableHead>{t("pages.roles.roleName")}</TableHead>
                  <TableHead>{t("pages.roles.description")}</TableHead>
                  <TableHead>{t("pages.roles.permissions")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("pages.references.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredRoles?.length ? (
                  filteredRoles.map((role: any) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions?.map((permission: string) => (
                            <Badge key={permission} variant="outline">
                              {t(`permissions.${permission}`)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.active ? "default" : "secondary"}>
                          {role.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRole(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteRole.mutate({ id: role.id })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No roles found
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "fr", ["common"])),
    },
  };
};
