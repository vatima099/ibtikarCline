import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarked,
  FileText,
  Home,
  LayoutDashboard,
  Library,
  ListFilter,
  LogOut,
  Search,
  Settings,
  User,
  Users,
  Plus,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "References",
      icon: BookMarked,
      href: "/references",
      active: pathname === "/references" || pathname?.startsWith("/references/"),
    },
    {
      label: "Documents",
      icon: FileText,
      href: "/documents",
      active: pathname === "/documents" || pathname?.startsWith("/documents/"),
    },
    {
      label: "Search",
      icon: Search,
      href: "/search",
      active: pathname === "/search",
    },
    {
      label: "Categories",
      icon: ListFilter,
      href: "/categories",
      active: pathname === "/categories",
    },
    {
      label: "Profile",
      icon: User,
      href: "/profile",
      active: pathname === "/profile",
    },
    {
      label: "Users",
      icon: Users,
      href: "/users",
      active: pathname === "/users" || pathname?.startsWith("/users/"),
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ];

  return (
    <>
      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
          >
            <Library className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="space-y-4 py-4">
            <div className="px-4 py-2 flex items-center">
              <Library className="h-6 w-6 mr-2 text-[#3B75B4]" />
              <h2 className="text-lg font-bold">RefManager</h2>
            </div>
            <div className="px-4">
              <Button asChild className="w-full">
                <Link href="/references/new" onClick={() => setOpen(false)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Reference
                </Link>
              </Button>
            </div>
            <div className="px-3">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-[#3B75B4]",
                      route.active
                        ? "bg-[#3B75B4]/10 text-[#3B75B4]"
                        : "text-muted-foreground"
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="px-3 py-2 mt-auto">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex h-screen flex-col border-r", className)}>
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Library className="h-6 w-6 text-[#3B75B4]" />
            <span className="text-xl">RefManager</span>
          </Link>
        </div>
        <div className="px-4 mb-4">
          <Button asChild className="w-full">
            <Link href="/references/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Reference
            </Link>
          </Button>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1 py-2">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-[#3B75B4]",
                    route.active
                      ? "bg-[#3B75B4]/10 text-[#3B75B4]"
                      : "text-muted-foreground"
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-auto p-4 border-t">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </>
  );
}