"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { useEffect, useRef, useState } from "react";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  Logo,
  GeodeIcon,
} from "@/components/icons";
import { usePathname } from "next/navigation";
import { RiCodeSSlashLine, RiDiscordFill, RiGithubFill, RiSearchLine, RiTwitterFill } from "@remixicon/react";

export const Navbar = () => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const pathname = usePathname();
    const [isMac, setIsMac] = useState(false);

    useEffect(() => {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }, []);

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault();
          searchInputRef.current?.focus();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

  const searchInput = (
    <Input
      ref={searchInputRef}
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={[isMac ? "command" : "ctrl"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <RiSearchLine size={18} className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar maxWidth="full" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">SendDB</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <NavbarItem key={item.href} isActive={isActive}>
                <NextLink
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "data-[active=true]:font-medium",
                  )}
                  style={isActive ? { color: 'var(--color-primary)' } : undefined}
                  color="foreground"
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            );
          })}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <Link isExternal title="Twitter" aria-label="Twitter" href={siteConfig.links.twitter}>
            <RiTwitterFill size={24} className="text-default-500" />
          </Link>
          <Link isExternal title="Discord" aria-label="Discord" href={siteConfig.links.discord}>
            <RiDiscordFill size={24} className="text-default-500" />
          </Link>
          <Link isExternal title="Github" aria-label="Github" href={siteConfig.links.github}>
            <RiGithubFill size={24} className="text-default-500" />
          </Link>
          <Link isExternal title="Geode" aria-label="Geode" href={siteConfig.links.geode}>
            <GeodeIcon size={24} className="text-default-500" />
          </Link>
          <Link isExternal title="API Docs" aria-label="API Docs" href={siteConfig.links.api}>
            <RiCodeSSlashLine size={24} className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal title="Discord" aria-label="Discord" href={siteConfig.links.discord}>
          <RiDiscordFill size={24} className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navItems.map((item, index) => {
            const isActive = pathname === item.href;

            return (
              <NavbarMenuItem key={`${item}-${index}`} isActive={isActive}>
                <NextLink
                  href={item.href}
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "data-[active=true]:font-medium w-full",
                  )}
                  style={isActive ? { color: 'var(--color-primary)' } : undefined}
                >
                  {item.label}
                </NextLink>
              </NavbarMenuItem>
            );
          })}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
