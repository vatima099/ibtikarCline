import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Globe, Code, Plus } from "lucide-react";
import Link from "next/link";

export default function MasterDataPage() {
  const { t } = useTranslation("common");

  const masterDataModules = [
    {
      title: t("navigation.clients"),
      description: t("pages.masterData.clients.title"),
      icon: Users,
      href: "/master-data/clients",
      count: "12", // This would come from API
    },
    {
      title: t("navigation.countries"),
      description: t("pages.masterData.countries.title"),
      icon: Globe,
      href: "/master-data/countries",
      count: "25", // This would come from API
    },
    {
      title: t("navigation.technologies"),
      description: t("pages.masterData.technologies.title"),
      icon: Code,
      href: "/master-data/technologies",
      count: "15", // This would come from API
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("pages.masterData.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("pages.masterData.description")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {masterDataModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.href}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {module.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{module.count}</div>
                  <p className="text-xs text-muted-foreground mb-4">
                    {module.description}
                  </p>
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={module.href}>{t("common.view")}</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`${module.href}/new`}>
                        <Plus className="h-4 w-4 mr-1" />
                        {t("common.add")}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
