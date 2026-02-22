import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { DeveloperIcon, DiscordIcon, GeodeIcon, GithubIcon } from "@/components/icons";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title({ color: "green" })}>Easily&nbsp;</span>
        <span className={title()}>track level sends</span>
        <div className={subtitle({ class: "mt-4" })}>
          Visualising Geometry Dash send data since 2025.
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          isExternal
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
          href={siteConfig.links.geode}
        >
          <GeodeIcon size={20} />
          Install on Geode
        </Link>
        <Link
          isExternal
          className={`${buttonStyles({ variant: "ghost", radius: "full" })} border-discord text-discord`}
          href={siteConfig.links.discord}
        >
          <DiscordIcon size={20} />
          Join the Discord
        </Link>
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={siteConfig.links.api}
        >
          <DeveloperIcon size={20} />
          API
        </Link>
      </div>
    </section>
  );
}
