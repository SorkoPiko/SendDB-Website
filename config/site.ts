export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "SendDB",
  description: "Easily track level sends.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Levels",
      href: "/levels",
    },
    // {
    //   label: "Creators",
    //   href: "/creators",
    // }
  ],
  links: {
    github: "https://github.com/SorkoPiko/SendDB-Website",
    sorkopiko_github: "https://github.com/SorkoPiko",
    twitter: "https://x.com/senddb_gd",
    sorkopiko_twitter: "https://x.com/SorkoPiko",
    discord: "https://discord.senddb.dev",
    bot: "https://discord.com/oauth2/authorize?client_id=1236144030912610304",
    geode: "https://geode-sdk.org/mods/sorkopiko.senddb",
    api: "https://api.senddb.dev/swagger-ui/",
  },
};
