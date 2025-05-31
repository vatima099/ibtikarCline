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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const availableResources = [
  "references",
  "masterData",
  "users",
  "roles",
  "reports",
];

const availablePermissions = [
  "read",
  "write",
  "create",
  "update",
  "delete",
  "admin",
];

export default function AccessRightsPage() {
  const { t } = useTranslation("common");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccessRight, setEditingAccessRight] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedResource, setSelectedResource] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const {
    data: accessRights,
    isLoading,
    refetch,
  } = trpc.roles.accessRights.getAll.useQuery();

  const { data: usersData } = trpc.users.getAll.useQuery({});
  const users = usersData?.users;

  const createAccessRight = trpc.roles.accessRights.create.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Access right created successfully",
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

  const updateAccessRight = trpc.roles.accessRights.update.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Access right updated successfully",
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

  const deleteAccessRight = trpc.roles.accessRights.delete.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Access right deleted successfully",
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

  const filteredAccessRights = accessRights?.filter((right: any) =>
    right.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setEditingAccessRight(null);
    setSelectedUserId("");
    setSelectedResource("");
    setSelectedPermissions([]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      userId: selectedUserId,
      resource: selectedResource,
      permissions: selectedPermissions,
    };

    if (editingAccessRight) {
      updateAccessRight.mutate({ id: editingAccessRight.id, data });
    } else {
      createAccessRight.mutate(data);
    }
  };

  const handleEditAccessRight = (accessRight: any) => {
    setEditingAccessRight(accessRight);
    setSelectedUserId(accessRight.userId);
    setSelectedResource(accessRight.resource);
    setSelectedPermissions(accessRight.permissions || []);
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

  const getUserName = (userId: string) => {
    const user = users?.find((u: any) => u.id === userId);
    return user ? user.name || user.email : userId;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("pages.accessRights.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("pages.accessRights.description")}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Access Right
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAccessRight ? t("common.edit") : t("common.add")}{" "}
                  Access Right
                </DialogTitle>
                <DialogDescription>
                  Grant or revoke user access to specific resources.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="userId">{t("pages.accessRights.user")}</Label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="resource">
                    {t("pages.accessRights.resource")}
                  </Label>
                  <Select
                    value={selectedResource}
                    onValueChange={setSelectedResource}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableResources.map((resource) => (
                        <SelectItem key={resource} value={resource}>
                          {resource}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("pages.accessRights.permission")}</Label>
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
                    {editingAccessRight
                      ? t("common.update")
                      : t("common.create")}
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
                placeholder={`${t("common.search")} access rights...`}
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
                  <TableHead>{t("pages.accessRights.user")}</TableHead>
                  <TableHead>{t("pages.accessRights.resource")}</TableHead>
                  <TableHead>{t("pages.accessRights.permission")}</TableHead>
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
                ) : filteredAccessRights?.length ? (
                  filteredAccessRights.map((right: any) => (
                    <TableRow key={right.id}>
                      <TableCell className="font-medium">
                        {getUserName(right.userId)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{right.resource}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {right.permissions?.map((permission: string) => (
                            <Badge key={permission} variant="secondary">
                              {t(`permissions.${permission}`)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={right.active ? "default" : "secondary"}>
                          {right.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAccessRight(right)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              deleteAccessRight.mutate({ id: right.id })
                            }
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
                      No access rights found
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
