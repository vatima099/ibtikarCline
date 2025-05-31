import { useState } from "react";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Users,
  Building2,
  Globe,
  Zap,
  Download,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { fr, ar } from "date-fns/locale";

export default function Reports() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const locale = router.locale === "ar" ? ar : fr;
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = trpc.references.getStats.useQuery();
  const { data: filterOptions } = trpc.references.getFilterOptions.useQuery();
  const { data: allReferences, isLoading: referencesLoading } =
    trpc.references.getAll.useQuery({
      page: 1,
      limit: 1000, // Get all for analytics
      sortBy: "startDate",
      sortOrder: "desc",
    });

  // Process data for charts and analytics
  const processAnalyticsData = () => {
    if (!allReferences?.references) return null;

    const references = allReferences.references;

    // Status distribution
    const statusDistribution = references.reduce((acc, ref) => {
      acc[ref.status] = (acc[ref.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority distribution
    const priorityDistribution = references.reduce((acc, ref) => {
      acc[ref.priority] = (acc[ref.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Country distribution
    const countryDistribution = references.reduce((acc, ref) => {
      acc[ref.country] = (acc[ref.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Technology usage
    const technologyUsage = references.reduce((acc, ref) => {
      ref.technologies?.forEach((tech: string) => {
        acc[tech] = (acc[tech] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Monthly trends
    const monthlyTrends = references.reduce((acc, ref) => {
      const month = format(new Date(ref.startDate), "yyyy-MM");
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Client distribution
    const clientDistribution = references.reduce((acc, ref) => {
      acc[ref.client] = (acc[ref.client] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      statusDistribution,
      priorityDistribution,
      countryDistribution: Object.entries(countryDistribution)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10),
      technologyUsage: Object.entries(technologyUsage)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 15),
      monthlyTrends: Object.entries(monthlyTrends)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12),
      topClients: Object.entries(clientDistribution)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10),
    };
  };

  const analyticsData = processAnalyticsData();

  const getStatusBadge = (status: string, count: number) => {
    return status === "Completed" ? (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
        <div className="flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
          <span className="text-green-700 font-medium">Terminé</span>
        </div>
        <Badge className="bg-green-100 text-green-800">{count}</Badge>
      </div>
    ) : (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 border-yellow-200">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-yellow-600" />
          <span className="text-yellow-700 font-medium">En cours</span>
        </div>
        <Badge className="bg-yellow-100 text-yellow-800">{count}</Badge>
      </div>
    );
  };

  const getPriorityBadge = (priority: string, count: number) => {
    const colors = {
      High: "bg-red-50 border-red-200 text-red-700",
      Medium: "bg-yellow-50 border-yellow-200 text-yellow-700",
      Low: "bg-gray-50 border-gray-200 text-gray-700",
    };
    return (
      <div
        className={`flex items-center justify-between p-3 border rounded-lg ${
          colors[priority as keyof typeof colors]
        }`}
      >
        <div className="flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span className="font-medium">{priority}</span>
        </div>
        <Badge variant="outline">{count}</Badge>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6" dir={router.locale === "ar" ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
              {t("navigation.reports")}
            </h1>
            <p className="text-gray-600 mt-1">
              Analyse détaillée des projets et performances
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                refetchStats();
                window.location.reload();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtres d'analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Période
                </label>
                <Select
                  value={selectedTimeRange}
                  onValueChange={setSelectedTimeRange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toute la période</SelectItem>
                    <SelectItem value="year">Cette année</SelectItem>
                    <SelectItem value="quarter">Ce trimestre</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Statut</label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="Completed">Terminé</SelectItem>
                    <SelectItem value="En cours">En cours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  Appliquer filtres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total des projets
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-500">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading ? "..." : stats?.totalReferences || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">Projets référencés</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Taux de réussite
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-500">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading
                  ? "..."
                  : stats?.totalReferences
                  ? `${Math.round(
                      (stats.completedReferences / stats.totalReferences) * 100
                    )}%`
                  : "0%"}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Projets terminés avec succès
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Projets actifs
              </CardTitle>
              <div className="p-2 rounded-lg bg-yellow-500">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading ? "..." : stats?.ongoingReferences || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                En cours de réalisation
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Haute priorité
              </CardTitle>
              <div className="p-2 rounded-lg bg-red-500">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {statsLoading ? "..." : stats?.highPriorityReferences || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">Projets prioritaires</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="status">Statuts</TabsTrigger>
            <TabsTrigger value="geography">Géographie</TabsTrigger>
            <TabsTrigger value="technology">Technologies</TabsTrigger>
            <TabsTrigger value="trends">Tendances</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Completion Rate */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Taux de réalisation des projets
                  </CardTitle>
                  <CardDescription>
                    Pourcentage de projets terminés avec succès
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Projets terminés</span>
                      <span>
                        {stats?.completedReferences || 0} /{" "}
                        {stats?.totalReferences || 0}
                      </span>
                    </div>
                    <Progress
                      value={
                        stats?.totalReferences
                          ? (stats.completedReferences /
                              stats.totalReferences) *
                            100
                          : 0
                      }
                      className="h-3"
                    />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-green-600">
                          {stats?.completedReferences || 0}
                        </div>
                        <div className="text-gray-600">Terminés</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-yellow-600">
                          {stats?.ongoingReferences || 0}
                        </div>
                        <div className="text-gray-600">En cours</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Clients */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Principaux clients
                  </CardTitle>
                  <CardDescription>
                    Clients avec le plus de projets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData?.topClients
                      .slice(0, 5)
                      .map(([client, count], index) => (
                        <div
                          key={client}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-blue-600">
                                {index + 1}
                              </span>
                            </div>
                            <span className="font-medium">
                              {client as string}
                            </span>
                          </div>
                          <Badge variant="outline">
                            {count as number} projets
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Répartition par statut
                  </CardTitle>
                  <CardDescription>
                    Distribution des projets par statut
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData &&
                      Object.entries(analyticsData.statusDistribution).map(
                        ([status, count]) =>
                          getStatusBadge(status, count as number)
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Répartition par priorité
                  </CardTitle>
                  <CardDescription>
                    Distribution des projets par niveau de priorité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData &&
                      Object.entries(analyticsData.priorityDistribution).map(
                        ([priority, count]) =>
                          getPriorityBadge(priority, count as number)
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Répartition géographique
                </CardTitle>
                <CardDescription>
                  Distribution des projets par pays
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analyticsData?.countryDistribution.map(
                    ([country, count], index) => (
                      <div
                        key={country}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium">
                            {country as string}
                          </span>
                        </div>
                        <Badge variant="outline">
                          {count as number} projets
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technology" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Technologies les plus utilisées
                </CardTitle>
                <CardDescription>
                  Analyse de l'utilisation des technologies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analyticsData?.technologyUsage.map(
                    ([tech, count], index) => (
                      <div
                        key={tech}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-2">
                            <span className="text-xs font-bold text-white">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium text-sm">
                            {tech as string}
                          </span>
                        </div>
                        <Badge variant="secondary">{count as number}</Badge>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Tendances mensuelles
                </CardTitle>
                <CardDescription>
                  Évolution du nombre de projets démarrés par mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.monthlyTrends.map(([month, count]) => (
                    <div key={month} className="flex items-center space-x-4">
                      <div className="w-20 text-sm font-medium text-gray-600">
                        {format(new Date(month + "-01"), "MMM yyyy", {
                          locale,
                        })}
                      </div>
                      <div className="flex-1">
                        <Progress
                          value={(count as number) * 10} // Scale for visibility
                          className="h-6"
                        />
                      </div>
                      <div className="w-12 text-right">
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
