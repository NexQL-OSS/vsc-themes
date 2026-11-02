// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://nexql-themes.astrx.dev",
  integrations: [sitemap({ filter: (page) => !page.endsWith("/themes/") })],
  // /themes/ holds the JSON data files; there is no index page for it.
  redirects: { "/themes": "/#gallery" },
  build: { assets: "_astro" },
});
