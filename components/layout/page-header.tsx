import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 py-4", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface PageHeaderBackProps {
  href: string;
  label?: string;
  className?: string;
}

export function PageHeaderBack({
  href,
  label = "Back",
  className,
}: PageHeaderBackProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("mb-4", className)}
      asChild
    >
      <Link href={href}>← {label}</Link>
    </Button>
  );
}