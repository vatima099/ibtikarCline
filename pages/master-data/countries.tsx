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

export default function CountriesPage() {
  const { t } = useTranslation("common");
  const { toast } = useToast();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<any>(null);

  const isAdmin = session?.user?.role === "admin";

  const {
    data: countries,
    isLoading,
    refetch,
  } = trpc.masterData.countries.getAll.useQuery();

  const createCountry = trpc.masterData.countries.create.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Country created successfully",
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

  const updateCountry = trpc.masterData.countries.update.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Country updated successfully",
      });
      refetch();
      setIsDialogOpen(false);
      setEditingCountry(null);
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCountry = trpc.masterData.countries.delete.useMutation({
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Country deleted successfully",
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

  const filteredCountries = countries?.filter((country: any) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      region: formData.get("region") as string,
    };

    if (editingCountry) {
      updateCountry.mutate({ id: editingCountry.id, data });
    } else {
      createCountry.mutate(data);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("pages.masterData.countries.title")}
            </h1>
            <p className="text-muted-foreground">Manage countries database</p>
            {!isAdmin && (
              <p className="text-sm text-yellow-600 mt-1">
                View only - Admin access required for modifications
              </p>
            )}
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingCountry(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("pages.masterData.countries.addCountry")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCountry ? t("common.edit") : t("common.add")}{" "}
                    {t("navigation.countries")}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the country information below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      {t("pages.masterData.countries.name")}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingCountry?.name || ""}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">
                      {t("pages.masterData.countries.code")}
                    </Label>
                    <Input
                      id="code"
                      name="code"
                      maxLength={3}
                      defaultValue={editingCountry?.code || ""}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">
                      {t("pages.masterData.countries.region")}
                    </Label>
                    <Input
                      id="region"
                      name="region"
                      defaultValue={editingCountry?.region || ""}
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
                      {editingCountry ? t("common.update") : t("common.create")}
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
                  "navigation.countries"
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
                  <TableHead>{t("pages.masterData.countries.name")}</TableHead>
                  <TableHead>{t("pages.masterData.countries.code")}</TableHead>
                  <TableHead>
                    {t("pages.masterData.countries.region")}
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
                      colSpan={isAdmin ? 5 : 4}
                      className="text-center"
                    >
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredCountries?.length ? (
                  filteredCountries.map((country: any) => (
                    <TableRow key={country.id}>
                      <TableCell className="font-medium">
                        {country.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{country.code}</Badge>
                      </TableCell>
                      <TableCell>{country.region}</TableCell>
                      <TableCell>
                        <Badge
                          variant={country.active ? "default" : "secondary"}
                        >
                          {country.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingCountry(country);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                deleteCountry.mutate({ id: country.id })
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
                      colSpan={isAdmin ? 5 : 4}
                      className="text-center"
                    >
                      No countries found
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
