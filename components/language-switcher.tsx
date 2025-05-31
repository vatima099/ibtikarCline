import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Globe } from "lucide-react";

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ar", name: "العربية", flag: "🇲🇷" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [isChanging, setIsChanging] = useState(false);

  const currentLanguage = languages.find((lang) => lang.code === router.locale);

  const changeLanguage = async (locale: string) => {
    setIsChanging(true);
    try {
      await router.push(router.pathname, router.asPath, { locale });
    } catch (error) {
      console.error("Failed to change language:", error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isChanging}
        >
          <Globe className="h-4 w-4" />
          <span>{currentLanguage?.flag}</span>
          <span className="hidden sm:inline">{currentLanguage?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="gap-2 cursor-pointer"
            disabled={language.code === router.locale}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
            {language.code === router.locale && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
