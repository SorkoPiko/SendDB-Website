"use client";

import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { DeveloperIcon, DiscordIcon, GeodeIcon, GithubIcon } from "@/components/icons";

export default function Home() {
  const screenshots = [
    "https://github.com/SorkoPiko/SendDB-Mod/blob/main/resources/previews/level-popup.png?raw=true",
    "https://github.com/SorkoPiko/SendDB-Mod/blob/main/resources/previews/level-leaderboard.png?raw=true",
    "https://github.com/SorkoPiko/SendDB-Mod/blob/main/resources/previews/creator-popup.png?raw=true",
  ];
  return (
    <>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-xl text-center justify-center">
          <span className={title({ color: "green" })}>Easily&nbsp;</span>
          <span className={title()}>track level sends</span>
          <div className={subtitle({ class: "mt-4" })}>
            The platform for level send statistics, leaderboards, and insights in Geometry Dash.
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

      <section className="w-full py-20 mt-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-10">
              <div>
                <h2 className="text-4xl font-bold tracking-tight mb-3">About SendDB</h2>
                <p className="text-lg text-default-500 leading-relaxed">
                  SendDB is the largest database of Geometry Dash level sends, providing players and creators
                  with comprehensive statistics and insights. Our mission is to bring light to potentially
                  neglected levels through detailed send tracking, leaderboards, and an open API.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-default-400 mb-5">
                  Features
                </h3>
                <ul className="space-y-4">
                  {[
                    "Automatic send tracking",
                    "Comprehensive statistics and leaderboards",
                    "Browse levels and view detailed send charts",
                    "Send notifications through our Discord bot",
                    "Free and open-source API for developers",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-success/15 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-success"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      </span>
                      <span className="text-default-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden border border-divider shadow-lg">
              <div className="relative aspect-video">
                <Swiper
                  modules={[Autoplay, Pagination]}
                  autoplay={{ delay: 4000, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  loop={true}
                  className="w-full h-full"
                >
                  {screenshots.map((screenshot, index) => (
                    <SwiperSlide key={index}>
                      <Image
                        src={screenshot}
                        alt={`SendDB Screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                        radius="none"
                        removeWrapper
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-20 mt-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="border border-divider rounded-lg px-10 py-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Questions?</h2>
            <p className="text-lg text-default-500 max-w-xl mx-auto mb-8 leading-relaxed">
              Join our Discord community to get support, talk to fellow creators, and stay updated with the latest features.
            </p>
            <Link
              isExternal
              className={`${buttonStyles({
                size: "lg",
                radius: "sm",
                variant: "solid",
              })} bg-discord text-white`}
              href={siteConfig.links.discord}
            >
              <DiscordIcon size={20} />
              Join the Discord
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
