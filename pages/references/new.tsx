import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "@/components/layout/Layout";
import ReferenceForm from "@/components/reference-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewReference() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const createMutation = trpc.references.create.useMutation({
    onSuccess: (data: any) => {
      toast.success(t("common.success"));
      router.push(`/references/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const handleSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/references">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("navigation.references")}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("pages.references.addNewReference")}
            </h1>
            <p className="text-gray-600 mt-1">
              {t("pages.references.description")}
            </p>
          </div>
        </div>

        {/* Form */}
        <ReferenceForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isLoading}
        />
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
