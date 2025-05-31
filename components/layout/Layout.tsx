import { ReactNode, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  BookOpen,
  Home,
  Plus,
  Search,
  Settings,
  LogOut,
  Menu,
  Users,
  Building2,
  Globe,
  Code,
  FileText,
  BarChart3,
  ChevronDown,
  Bell,
  Languages,
  Shield,
  UserCheck,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LayoutProps {
  children: ReactNode;
}

function LanguageSelector() {
  const router = useRouter();
  const { t } = useTranslation("common");

  const changeLanguage = (locale: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale });
  };

  const languages = [
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === router.locale);

  return (
    <Select value={router.locale} onValueChange={changeLanguage}>
      <SelectTrigger className="w-40 h-9">
        <div className="flex items-center space-x-2">
          <Languages className="h-4 w-4" />
          <span>{currentLanguage?.flag}</span>
          <span className="text-sm">{currentLanguage?.name}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center space-x-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Sidebar({ className }: { className?: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation("common");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigation = [
    {
      name: t("navigation.dashboard"),
      href: "/dashboard",
      icon: Home,
      description: t("pages.dashboard.description"),
    },
    {
      name: t("navigation.references"),
      href: "/references",
      icon: BookOpen,
      description: t("pages.references.description"),
      children: [
        { name: t("navigation.allReferences"), href: "/references" },
        { name: t("navigation.addNew"), href: "/references/new" },
        { name: t("navigation.search"), href: "/references/search" },
      ],
    },
    {
      name: t("navigation.documents"),
      href: "/documents",
      icon: FolderOpen,
      description: t("pages.documents.description"),
    },
    {
      name: t("navigation.masterData"),
      href: "/master-data",
      icon: Settings,
      description: t("pages.masterData.description"),
      children: [
        { name: t("navigation.clients"), href: "/master-data/clients" },
        { name: t("navigation.countries"), href: "/master-data/countries" },
        {
          name: t("navigation.technologies"),
          href: "/master-data/technologies",
        },
      ],
    },
    {
      name: t("navigation.users"),
      href: "/users",
      icon: Users,
      description: t("pages.users.description"),
      adminOnly: true,
    },
    {
      name: t("pages.roles.title"),
      href: "/roles",
      icon: Shield,
      description: t("pages.roles.description"),
      adminOnly: true,
    },
    {
      name: t("pages.accessRights.title"),
      href: "/access-rights",
      icon: UserCheck,
      description: t("pages.accessRights.description"),
      adminOnly: true,
    },
    {
      name: t("navigation.reports"),
      href: "/reports",
      icon: BarChart3,
      description: "Analytics and insights",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return router.pathname === "/dashboard";
    }
    return router.pathname.startsWith(href);
  };

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isAdmin = session?.user?.role === "admin";

  return (
    <div
      className={cn("flex h-full w-64 flex-col bg-white border-r", className)}
      dir={router.locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <Image
              src="/images/logo.png"
              alt="Ibtikaar Tech Logo"
              width={500}
              height={500}
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Ibtikaar Tech</span>
            <span className="text-xs text-muted-foreground">
              Solutions numériques
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isItemActive = isActive(item.href);
          const isExpanded = expandedItems.includes(item.name);

          if (item.adminOnly && !isAdmin) {
            return null;
          }

          return (
            <div key={item.name}>
              <div className="group relative">
                {item.children ? (
                  <button
                    onClick={() => toggleExpanded(item.name)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isItemActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isItemActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>

              {/* Submenu */}
              {item.children && isExpanded && (
                <div
                  className={cn(
                    "mt-1 space-y-1",
                    router.locale === "ar" ? "mr-6" : "ml-6"
                  )}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm transition-colors",
                        router.pathname === child.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation("common");

  const getPageTitle = () => {
    const path = router.pathname;
    if (path === "/dashboard") return t("pages.dashboard.title");
    if (path.startsWith("/references")) {
      if (path === "/references/new")
        return t("pages.references.addNewReference");
      if (path === "/references/search") return t("navigation.search");
      return t("pages.references.title");
    }
    if (path.startsWith("/master-data")) return t("pages.masterData.title");
    if (path.startsWith("/users")) return t("pages.users.title");
    if (path.startsWith("/roles")) return t("pages.roles.title");
    if (path.startsWith("/access-rights")) return t("pages.accessRights.title");
    if (path.startsWith("/documents")) return t("pages.documents.title");
    if (path.startsWith("/reports")) return t("navigation.reports");
    return "Reference Management System";
  };

  const getPageDescription = () => {
    const path = router.pathname;
    if (path === "/dashboard") return t("pages.dashboard.description");
    if (path.startsWith("/references"))
      return t("pages.references.description");
    if (path.startsWith("/master-data"))
      return t("pages.masterData.description");
    if (path.startsWith("/users")) return t("pages.users.description");
    if (path.startsWith("/roles")) return t("pages.roles.description");
    if (path.startsWith("/access-rights"))
      return t("pages.accessRights.description");
    if (path.startsWith("/documents")) return t("pages.documents.description");
    return "Manage your project references and showcase company capabilities";
  };

  return (
    <header
      className="h-16 border-b bg-white"
      dir={router.locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side={router.locale === "ar" ? "right" : "left"}
              className="p-0 w-64"
            >
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-muted-foreground">
              {getPageDescription()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {session?.user?.name && (
                    <p className="font-medium">{session.user.name}</p>
                  )}
                  {session?.user?.email && (
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {session.user.email}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.role || t("roles.user")}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("auth.profile")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600"
                onSelect={(event) => {
                  event.preventDefault();
                  signOut({ callbackUrl: "/" });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("auth.signOut")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return <div>{children}</div>;
  }

  return (
    <div
      className="flex h-screen bg-gray-50"
      dir={router.locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="h-full p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
