import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Edit, UserX, UserCheck, User, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("user");

  const {
    data: usersData,
    isLoading,
    refetch,
  } = trpc.users.getAll.useQuery({
    page: 1,
    limit: 50,
  });

  const { data: roles } = trpc.roles.roles.getAll.useQuery();

  const createUser = trpc.users.create.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "User created successfully",
      });
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUser = trpc.users.update.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "User updated successfully",
      });
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deactivateUser = trpc.users.deactivate.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "User deactivated successfully",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activateUser = trpc.users.activate.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "User activated successfully",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const users = usersData?.users || [];
  const filteredUsers = users.filter(
    (user: any) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setEditingUser(null);
    setSelectedRole("user");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (editingUser) {
      const data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        role: selectedRole,
      };
      updateUser.mutate({ id: editingUser.id, data });
    } else {
      const data = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        role: selectedRole,
      };
      createUser.mutate(data);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setSelectedRole(user.role || "user");
    setIsDialogOpen(true);
  };

  const getUserStatusBadge = (user: any) => {
    const isActive = user.active !== false;
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: "bg-red-50 text-red-700 border-red-200",
      manager: "bg-blue-50 text-blue-700 border-blue-200",
      user: "bg-green-50 text-green-700 border-green-200",
      viewer: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
      <Badge
        variant="outline"
        className={
          roleColors[role] || "bg-gray-50 text-gray-700 border-gray-200"
        }
      >
        {t(`roles.${role}`) || role}
      </Badge>
    );
  };

  const handleToggleUserStatus = (user: any) => {
    if (user.active !== false) {
      deactivateUser.mutate({ id: user.id });
    } else {
      activateUser.mutate({ id: user.id });
    }
  };

  return (
    <Layout>
      <div className="space-y-6" dir={router.locale === "ar" ? "rtl" : "ltr"}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("pages.users.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("pages.users.description")}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                {t("pages.users.addUser")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? t("common.edit") : t("common.add")}{" "}
                  {t("pages.users.title").slice(0, -1)}
                </DialogTitle>
                <DialogDescription>
                  Fill in the user information and assign a role.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("pages.users.name")}</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingUser?.name || ""}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t("pages.users.email")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingUser?.email || ""}
                    required
                  />
                </div>
                {!editingUser && (
                  <div>
                    <Label htmlFor="password">{t("auth.password")}</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="role">{t("pages.users.role")}</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value: "admin" | "user") =>
                      setSelectedRole(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{t("roles.user")}</SelectItem>
                      <SelectItem value="admin">{t("roles.admin")}</SelectItem>
                    </SelectContent>
                  </Select>
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
                    {editingUser ? t("common.update") : t("common.create")}
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
                placeholder={`${t("common.search")} users...`}
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
                  <TableHead>{t("pages.users.name")}</TableHead>
                  <TableHead>{t("pages.users.email")}</TableHead>
                  <TableHead>{t("pages.users.role")}</TableHead>
                  <TableHead>{t("pages.users.status")}</TableHead>
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
                ) : filteredUsers.length ? (
                  filteredUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.image || ""} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.username && `@${user.username}`}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role || "user")}</TableCell>
                      <TableCell>{getUserStatusBadge(user)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                {user.active !== false ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("common.confirm")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {user.active !== false
                                    ? "Are you sure you want to deactivate this user?"
                                    : "Are you sure you want to activate this user?"}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("common.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleToggleUserStatus(user)}
                                  className={
                                    user.active !== false
                                      ? "bg-red-600 hover:bg-red-700"
                                      : "bg-green-600 hover:bg-green-700"
                                  }
                                >
                                  {user.active !== false
                                    ? "Deactivate"
                                    : "Activate"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No users found
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
