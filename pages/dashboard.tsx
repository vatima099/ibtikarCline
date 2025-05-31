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
  BookOpen,
  Users,
  Building2,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Eye,
  Filter,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { format } from "date-fns";
import { fr, ar } from "date-fns/locale";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const locale = router.locale === "ar" ? ar : fr;

  const { data: stats, isLoading: statsLoading } =
    trpc.references.getStats.useQuery();
  const { data: recentReferences, isLoading: referencesLoading } =
    trpc.references.getAll.useQuery({
      page: 1,
      limit: 5,
      sortBy: "updatedAt",
      sortOrder: "desc",
    });
  const { data: filterOptions } = trpc.references.getFilterOptions.useQuery();

  const statCards = [
    {
      title: t("pages.references.title"),
      value: stats?.totalReferences || 0,
      description: t("pages.references.description"),
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      title: t("pages.dashboard.statistics") + " - " + t("common.success"),
      value: stats?.completedReferences || 0,
      description: t("pages.dashboard.successfullyDelivered"),
      icon: CheckCircle2,
      color: "bg-green-500",
    },
    {
      title: "Projets en cours",
      value: stats?.ongoingReferences || 0,
      description: "Currently in progress",
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Haute priorité",
      value: stats?.highPriorityReferences || 0,
      description: "Requires attention",
      icon: AlertCircle,
      color: "bg-red-500",
    },
  ];

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
              {t("pages.dashboard.title")}
            </h1>
            <p className="text-gray-600 mt-1">{t("pages.dashboard.welcome")}</p>
          </div>
          <div className="flex space-x-3">
            <Button asChild>
              <Link href="/references/new">
                <Plus className="w-4 h-4 mr-2" />
                {t("pages.references.addNewReference")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/references">
                <Eye className="w-4 h-4 mr-2" />
                {t("pages.references.view")}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : stat.value}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recent">
              {t("pages.dashboard.recentReferences")}
            </TabsTrigger>
            <TabsTrigger value="overview">
              {t("pages.dashboard.overview")}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              {t("pages.dashboard.statistics")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  {t("pages.dashboard.recentReferences")}
                </CardTitle>
                <CardDescription>
                  {t("pages.references.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {referencesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-16 bg-gray-100 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentReferences?.references.map((reference: any) => (
                      <div
                        key={reference.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900">
                              {reference.title}
                            </h3>
                            {getStatusBadge(reference.status)}
                            {getPriorityBadge(reference.priority)}
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Building2 className="w-4 h-4 mr-1" />
                              {reference.client}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {format(
                                new Date(reference.startDate),
                                "MMM yyyy",
                                { locale }
                              )}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {reference.employeesInvolved}{" "}
                              {t("pages.users.title").toLowerCase()}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/references/${reference.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                    {!recentReferences?.references.length && (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t("pages.references.noReferences")}</p>
                        <Button asChild className="mt-3">
                          <Link href="/references/new">
                            {t("pages.references.addNewReference")}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Clients Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    {t("navigation.clients")}
                  </CardTitle>
                  <CardDescription>
                    {filterOptions?.clients.length || 0}{" "}
                    {t("navigation.clients").toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filterOptions?.clients
                      .slice(0, 5)
                      .map((client: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{client}</span>
                          <Badge variant="outline">{index + 1}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Technologies Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    {t("navigation.technologies")}
                  </CardTitle>
                  <CardDescription>
                    {filterOptions?.technologies.length || 0}{" "}
                    {t("navigation.technologies").toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions?.technologies
                      .slice(0, 8)
                      .map((tech: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Taux de réalisation des projets</CardTitle>
                  <CardDescription>
                    Pourcentage de projets terminés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Terminé</span>
                      <span>
                        {stats?.completedReferences || 0}/
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
                      className="h-2"
                    />
                    <p className="text-xs text-gray-600">
                      {stats?.totalReferences
                        ? `${Math.round(
                            (stats.completedReferences /
                              stats.totalReferences) *
                              100
                          )}% taux de réalisation`
                        : "Aucune donnée disponible"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Répartition des priorités</CardTitle>
                  <CardDescription>
                    Ventilation des priorités de projet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Haute priorité</span>
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700"
                      >
                        {stats?.highPriorityReferences || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total des projets</span>
                      <Badge variant="outline">
                        {stats?.totalReferences || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
