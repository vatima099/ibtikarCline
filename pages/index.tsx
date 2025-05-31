import { useSession, signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  BookOpen,
  Users,
  Upload,
  Search,
  BarChart3,
  FileText,
  CheckCircle,
  Star,
  ArrowRight,
  Sparkles,
  Globe,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const { data: session, status } = useSession();
  const { t } = useTranslation("common");

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-border border-t-primary"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-muted rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="container mx-auto px-4 py-6">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  {t("home.title")}
                </span>
              </div>
              <Button
                onClick={() => signIn()}
                variant="outline"
                className="transition-all duration-300"
              >
                {t("auth.signIn")}
              </Button>
            </nav>
          </header>

          {/* Hero Section */}
          <section className="container mx-auto px-4 py-20 text-center">
            <div className="max-w-5xl mx-auto">
              <Badge
                variant="secondary"
                className="mb-6 bg-secondary text-secondary-foreground"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t("home.subtitle")}
              </Badge>

              <h1 className="text-5xl lg:text-7xl font-bold text-foreground mb-8 leading-tight">
                {t("home.title")}
              </h1>

              <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                {t("home.description")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button
                  onClick={() => signIn()}
                  size="lg"
                  className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {t("home.cta.primary")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 transition-all duration-300"
                >
                  {t("home.cta.secondary")}
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {[
                  {
                    number: "10,000+",
                    label: t("home.stats.references"),
                    icon: BookOpen,
                  },
                  { number: "500+", label: t("home.stats.users"), icon: Users },
                  {
                    number: "50+",
                    label: t("home.stats.projects"),
                    icon: CheckCircle,
                  },
                  {
                    number: "99%",
                    label: t("home.stats.satisfaction"),
                    icon: Star,
                  },
                ].map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-card rounded-full shadow-md mb-4 group-hover:shadow-lg transition-shadow duration-300">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="container mx-auto px-4 py-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {t("home.features.organize.title")} {t("navigation.references")}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("home.description")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: BookOpen,
                  title: t("home.features.organize.title"),
                  description: t("home.features.organize.description"),
                },
                {
                  icon: Upload,
                  title: t("home.features.import.title"),
                  description: t("home.features.import.description"),
                },
                {
                  icon: Search,
                  title: t("home.features.search.title"),
                  description: t("home.features.search.description"),
                },
                {
                  icon: Users,
                  title: t("home.features.collaboration.title"),
                  description: t("home.features.collaboration.description"),
                },
                {
                  icon: BarChart3,
                  title: t("home.features.analytics.title"),
                  description: t("home.features.analytics.description"),
                },
                {
                  icon: FileText,
                  title: t("home.features.export.title"),
                  description: t("home.features.export.description"),
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 border hover:scale-105"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-4 py-20">
            <Card className="max-w-4xl mx-auto bg-primary border-0 text-primary-foreground overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
              <CardContent className="relative z-10 text-center py-16 px-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-foreground/10 rounded-full mb-8 backdrop-blur-sm">
                  <Zap className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="text-4xl font-bold mb-6">
                  {t("home.cta.primary")} - {t("home.title")}
                </h3>
                <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                  {t("home.description")}
                </p>
                <Button
                  onClick={() => signIn()}
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {t("home.getStarted")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <footer className="container mx-auto px-4 py-12 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                {t("home.title")}
              </span>
            </div>
            <p className="text-muted-foreground">
              © 2025 Ibtikaar Tech. {t("home.subtitle")}.
            </p>
          </footer>
        </div>
      </div>
    );
  }

  // User is signed in
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-muted rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-8 shadow-lg">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            {t("home.welcomeBack")} {session.user?.name}!
          </h1>

          <p className="text-xl lg:text-2xl text-muted-foreground mb-12 leading-relaxed">
            {t("home.readyToManage")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {t("home.goToDashboard")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/references">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 transition-all duration-300"
              >
                {t("navigation.references")}
                <BookOpen className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: t("navigation.references"),
                value: "12",
              },
              {
                icon: TrendingUp,
                title: t("common.success"),
                value: "+3",
              },
              {
                icon: Star,
                title: t("home.stats.satisfaction"),
                value: "5",
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border hover:bg-accent/50"
              >
                <CardContent className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.title}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "fr", ["common"])),
    },
  };
};
