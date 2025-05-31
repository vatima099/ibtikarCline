import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { LanguageSwitcher } from "../../components/language-switcher";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { t } = useTranslation("common");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("auth.invalidCredentials"));
      } else {
        // Check if user is authenticated and redirect to dashboard
        const session = await getSession();
        if (session) {
          const callbackUrl =
            (router.query.callbackUrl as string) || "/dashboard";
          router.push(callbackUrl);
        }
      }
    } catch (error) {
      setError(t("auth.errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Language Switcher */}
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>

        {/* Logo and Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("auth.welcomeBack")}
          </h1>
          <p className="text-sm text-gray-600">{t("auth.signInToAccount")}</p>
        </div>

        {/* Sign In Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl text-center">
              {t("auth.signIn")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.getStarted")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in-50">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t("auth.email")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t("auth.emailPlaceholder")}
                    className="pl-10 h-12"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t("auth.password")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t("auth.passwordPlaceholder")}
                    className="pl-10 pr-10 h-12"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t("auth.signingIn")}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>{t("auth.signIn")}</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              {t("auth.dontHaveAccount")}{" "}
              <a
                href="/auth/signup"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                {t("auth.signUpHere")}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          © 2024 Ibtikaar Tech - {t("home.subtitle")}
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
