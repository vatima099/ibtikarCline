import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { appWithTranslation } from "next-i18next";
import { trpc } from "../lib/trpc";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "../components/ui/toaster";
import "../styles/globals.css";
import { useState } from "react";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Component {...pageProps} />
          <Toaster />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default trpc.withTRPC(appWithTranslation(MyApp));
