import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  X,
  MoreHorizontal,
  Eye,
  Edit,
  Building2,
  Calendar,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  User,
  BookOpen,
  Settings,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { format } from "date-fns";
import { fr, ar } from "date-fns/locale";

export default function ReferencesSearch() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const locale = router.locale === "ar" ? ar : fr;

  const [searchQuery, setSearchQuery] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState({
    client: "",
    country: "",
    status: "",
    priority: "",
    responsible: "",
    technologies: [] as string[],
    startDate: "",
    endDate: "",
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Get filter options
  const { data: filterOptions } = trpc.references.getFilterOptions.useQuery();

  // Search mutation
  const searchMutation = trpc.references.search.useMutation({
    onSuccess: (data) => {
      setSearchResults(data);
      setIsSearching(false);
      setHasSearched(true);
    },
    onError: (error) => {
      console.error("Search error:", error);
      setIsSearching(false);
    },
  });

  // Handle search
  const handleSearch = () => {
    if (
      !searchQuery.trim() &&
      !Object.values(advancedFilters).some((val) =>
        Array.isArray(val) ? val.length > 0 : Boolean(val)
      )
    ) {
      return;
    }

    setIsSearching(true);

    const searchParams: any = {
      query: searchQuery.trim() || undefined,
      client: advancedFilters.client || undefined,
      country: advancedFilters.country || undefined,
      status: advancedFilters.status || undefined,
      priority: advancedFilters.priority || undefined,
      responsible: advancedFilters.responsible || undefined,
      technologies:
        advancedFilters.technologies.length > 0
          ? advancedFilters.technologies
          : undefined,
      startDate: advancedFilters.startDate || undefined,
      endDate: advancedFilters.endDate || undefined,
    };

    searchMutation.mutate(searchParams);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setAdvancedFilters({
      client: "",
      country: "",
      status: "",
      priority: "",
      responsible: "",
      technologies: [],
      startDate: "",
      endDate: "",
    });
    setSearchResults([]);
    setHasSearched(false);
  };

  // Handle technology selection
  const handleTechnologyToggle = (tech: string) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      technologies: prev.technologies.includes(tech)
        ? prev.technologies.filter((t) => t !== tech)
        : [...prev.technologies, tech],
    }));
  };

  // Remove technology
  const removeTechnology = (tech: string) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  };

  // Status badge component
  const getStatusBadge = (status: string) => {
    return status === "Completed" ? (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-700 border-green-200"
      >
        <CheckCircle2 className="w-3 h-3 mr-1" />
        {t("common.completed")}
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

  // Priority badge component
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

  // Handle enter key for search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Layout>
      <div className="space-y-6" dir={router.locale === "ar" ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("pages.references.search")} {t("pages.references.title")}
            </h1>
            <p className="text-gray-600 mt-1">
              Recherchez des références par mots-clés, client, technologies, et
              plus encore
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/references">
              <BookOpen className="w-4 h-4 mr-2" />
              Voir toutes les références
            </Link>
          </Button>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Recherche avancée
            </CardTitle>
            <CardDescription>
              Utilisez les filtres ci-dessous pour affiner votre recherche
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Recherche générale
              </label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher par titre, description, client, mots-clés..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? "Recherche..." : "Rechercher"}
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced-filters">
                <AccordionTrigger className="flex items-center">
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Filtres avancés
                    {Object.values(advancedFilters).some((val) =>
                      Array.isArray(val) ? val.length > 0 : Boolean(val)
                    ) && (
                      <Badge variant="secondary" className="ml-2">
                        Actifs
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Client Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        Client
                      </label>
                      <Select
                        value={advancedFilters.client}
                        onValueChange={(value) =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            client: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tous les clients</SelectItem>
                          {filterOptions?.clients.map((client: string) => (
                            <SelectItem key={client} value={client}>
                              {client}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Country Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Pays
                      </label>
                      <Select
                        value={advancedFilters.country}
                        onValueChange={(value) =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            country: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tous les pays</SelectItem>
                          {filterOptions?.countries.map((country: string) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        <CheckCircle2 className="w-4 h-4 inline mr-1" />
                        Statut
                      </label>
                      <Select
                        value={advancedFilters.status}
                        onValueChange={(value) =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            status: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tous les statuts</SelectItem>
                          <SelectItem value="En cours">En cours</SelectItem>
                          <SelectItem value="Completed">Terminé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Priorité
                      </label>
                      <Select
                        value={advancedFilters.priority}
                        onValueChange={(value) =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            priority: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une priorité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Toutes les priorités</SelectItem>
                          <SelectItem value="High">Haute</SelectItem>
                          <SelectItem value="Medium">Moyenne</SelectItem>
                          <SelectItem value="Low">Basse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Responsible Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        <User className="w-4 h-4 inline mr-1" />
                        Responsable
                      </label>
                      <Select
                        value={advancedFilters.responsible}
                        onValueChange={(value) =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            responsible: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un responsable" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            Tous les responsables
                          </SelectItem>
                          {filterOptions?.responsiblePersons.map(
                            (person: string) => (
                              <SelectItem key={person} value={person}>
                                {person}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Date de début (min)
                      </label>
                      <Input
                        type="date"
                        value={advancedFilters.startDate}
                        onChange={(e) =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Technologies Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      <Layers className="w-4 h-4 inline mr-1" />
                      Technologies
                    </label>
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-3">
                        {filterOptions?.technologies
                          .slice(0, 12)
                          .map((tech: string) => (
                            <label
                              key={tech}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={advancedFilters.technologies.includes(
                                  tech
                                )}
                                onChange={() => handleTechnologyToggle(tech)}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-700">
                                {tech}
                              </span>
                            </label>
                          ))}
                      </div>
                      {advancedFilters.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          {advancedFilters.technologies.map((tech) => (
                            <Badge
                              key={tech}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {tech}
                              <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => removeTechnology(tech)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? "Recherche..." : "Appliquer les filtres"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearAllFilters}
                      disabled={
                        !searchQuery &&
                        !Object.values(advancedFilters).some((val) =>
                          Array.isArray(val) ? val.length > 0 : Boolean(val)
                        )
                      }
                    >
                      Effacer tout
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Résultats de recherche ({searchResults.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((reference: any) => (
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
                                {reference.employeesInvolved} employés
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
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/references/${reference.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Voir
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/references/${reference.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Essayez d'ajuster vos critères de recherche ou vos filtres
                  </p>
                  <Button variant="outline" onClick={clearAllFilters}>
                    Effacer la recherche
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Recherche de références
              </h3>
              <p className="text-gray-600 mb-4">
                Utilisez la barre de recherche ci-dessus pour trouver des
                références spécifiques
              </p>
              <p className="text-sm text-gray-500">
                Vous pouvez rechercher par titre, description, client,
                technologies, ou utiliser les filtres avancés
              </p>
            </CardContent>
          </Card>
        )}
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
