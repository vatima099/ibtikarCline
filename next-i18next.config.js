/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "fr",
    locales: ["fr", "ar"],
    localeDetection: false,
  },
  defaultNS: "common",
  fallbackLng: "fr",
  debug: false,
  reloadOnPrerender: process.env.NODE_ENV === "development",
  localePath: "./public/locales",
};
