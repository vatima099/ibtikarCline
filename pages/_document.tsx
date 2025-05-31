import { Html, Head, Main, NextScript, DocumentProps } from "next/document";

export default function Document(props: DocumentProps) {
  const { locale } = props.__NEXT_DATA__;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <Html lang={locale} dir={dir}>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Ibtikaar Tech - Solutions numériques modernes pour la Mauritanie"
        />
        <meta name="theme-color" content="#2563eb" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
