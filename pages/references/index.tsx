import { useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Building2,
  Calendar,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { format } from "date-fns";
import { fr, ar } from "date-fns/locale";
import { toast } from "sonner";

export default function References() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const locale = router.locale === "ar" ? ar : fr;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    client: "",
    country: "",
  });
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const {
    data: referencesData,
    isLoading,
    refetch,
  } = trpc.references.getAll.useQuery({
    page,
    limit: 10,
    filters: {
      query: search || undefined,
      status:
        filters.status === "all" || !filters.status
          ? undefined
          : (filters.status as any),
      priority:
        filters.priority === "all" || !filters.priority
          ? undefined
          : (filters.priority as any),
      client:
        filters.client === "all" || !filters.client
          ? undefined
          : filters.client,
      country:
        filters.country === "all" || !filters.country
          ? undefined
          : filters.country,
    },
    sortBy,
    sortOrder,
  });

  const { data: filterOptions } = trpc.references.getFilterOptions.useQuery();

  const deleteMutation = trpc.references.delete.useMutation({
    onSuccess: () => {
      toast.success(t("common.success"));
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  const clearFilters = () => {
    setFilters({ status: "", priority: "", client: "", country: "" });
    setSearch("");
  };

  const getStatusBadge = (status: string) => {
    return status === "Completed" ? (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200"
      >
        <CheckCircle2 className="w-3 h-3 mr-1" />
        {t("common.success")}
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-yellow-50 text-yellow-700 border-yellow-200"
      >
        <Clock className="w-3 h-3 mr-1" />
        En cours
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      High: "bg-red-50 text-red-700 border-red-200",
      Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
      Low: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return (
      <Badge
        variant="outline"
        className={colors[priority as keyof typeof colors]}
      >
        {priority === "High" && <AlertCircle className="w-3 h-3 mr-1" />}
        {priority}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6" dir={router.locale === "ar" ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("pages.references.title")}
            </h1>
            <p className="text-gray-600 mt-1">
              {t("pages.references.description")}
            </p>
          </div>
          <Button asChild>
            <Link href="/references/new">
              <Plus className="w-4 h-4 mr-2" />
              {t("pages.references.addNewReference")}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              {t("common.filter")} & {t("common.search")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={t("pages.references.searchReferences")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!search && !Object.values(filters).some(Boolean)}
              >
                {t("common.cancel")}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("pages.references.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="En cours">En cours</SelectItem>
                  <SelectItem value="Completed">Terminé</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority}
                onValueChange={(value) =>
                  setFilters({ ...filters, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="High">Haute</SelectItem>
                  <SelectItem value="Medium">Moyenne</SelectItem>
                  <SelectItem value="Low">Basse</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.client}
                onValueChange={(value) =>
                  setFilters({ ...filters, client: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("pages.references.client")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les clients</SelectItem>
                  {filterOptions?.clients.map((client: string) => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.country}
                onValueChange={(value) =>
                  setFilters({ ...filters, country: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("pages.references.country")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  {filterOptions?.countries.map((country: string) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* References List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                {t("pages.references.title")} (
                {referencesData?.pagination.total || 0})
              </CardTitle>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-");
                  setSortBy(field);
                  setSortOrder(order as "asc" | "desc");
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt-desc">
                    Récemment mis à jour
                  </SelectItem>
                  <SelectItem value="createdAt-desc">Récemment créé</SelectItem>
                  <SelectItem value="title-asc">Titre A-Z</SelectItem>
                  <SelectItem value="title-desc">Titre Z-A</SelectItem>
                  <SelectItem value="startDate-desc">
                    Date de début (Nouveau)
                  </SelectItem>
                  <SelectItem value="startDate-asc">
                    Date de début (Ancien)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : referencesData?.references.length ? (
              <div className="space-y-4">
                {referencesData.references.map((reference: any) => (
                  <div
                    key={reference.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reference.title}
                          </h3>
                          {getStatusBadge(reference.status)}
                          {getPriorityBadge(reference.priority)}
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {reference.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-2" />
                            <span>{reference.client}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{reference.country}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            <span>
                              {reference.employeesInvolved}{" "}
                              {t("pages.users.title").toLowerCase()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>
                              {format(
                                new Date(reference.startDate),
                                "MMM yyyy",
                                { locale }
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {reference.technologies
                            ?.slice(0, 3)
                            .map((tech: string) => (
                              <Badge
                                key={tech}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          {reference.technologies?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{reference.technologies.length - 3} plus
                            </Badge>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {t("pages.references.actions")}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/references/${reference.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              {t("pages.references.view")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/references/${reference.id}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              {t("pages.references.edit")}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t("pages.references.delete")}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("pages.references.delete")}{" "}
                                  {t("pages.references.title").slice(0, -1)}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer "
                                  {reference.title}" ? Cette action ne peut pas
                                  être annulée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("common.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(reference.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {t("common.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("pages.references.noReferences")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {search || Object.values(filters).some(Boolean)
                    ? "Essayez d'ajuster votre recherche ou vos filtres"
                    : "Commencez par ajouter votre première référence"}
                </p>
                <Button asChild>
                  <Link href="/references/new">
                    {t("pages.references.addNewReference")}
                  </Link>
                </Button>
              </div>
            )}

            {/* Pagination */}
            {referencesData && referencesData.pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  Affichage de {(page - 1) * 10 + 1} à{" "}
                  {Math.min(page * 10, referencesData.pagination.total)} sur{" "}
                  {referencesData.pagination.total} résultats
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} sur {referencesData.pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === referencesData.pagination.pages}
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
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

  return {
    props: {
      ...(await serverSideTranslations(context.locale!, ["common"])),
      session,
    },
  };
};
