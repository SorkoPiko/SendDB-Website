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
import { Spinner } from "@heroui/spinner";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  Logo,
  GeodeIcon,
} from "@/components/icons";
import { usePathname, useRouter } from "next/navigation";
import { RiCodeSSlashLine, RiDiscordFill, RiGithubFill, RiSearchLine, RiTwitterFill } from "@remixicon/react";
import { fetchSearch } from "@/api/integration";
import { LeaderboardCreator, LeaderboardLevel, SearchCreator, SearchLevel, SearchResult } from "@/api/models";
import LevelRow from "./level/levelRow";
import CreatorRow from "./creator/creatorRow";

function toLevel(result: SearchLevel, index: number): LeaderboardLevel {
  return { ...result, rank: index };
}

function toCreator(result: SearchCreator): LeaderboardCreator {
  return { ...result, trending_score: 0, trending_rank: 0 };
}

export const Navbar = () => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const [isMac, setIsMac] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

   useEffect(() => {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
    }, []);

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault();
          searchInputRef.current?.focus();
        }
        if (event.key === 'Escape') {
          setShowResults(false);
          searchInputRef.current?.blur();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
      const t = setTimeout(() => setDebouncedSearch(searchValue), 350);
      return () => clearTimeout(t);
    }, [searchValue]);

    useEffect(() => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      setIsSearching(true);
      fetchSearch({ limit: 50, search: debouncedSearch }).then((res) => {
        if (res.success && res.data) {
          setSearchResults(res.data.results);
        } else {
          setSearchResults([]);
        }
        setShowResults(true);
        setIsSearching(false);
        setSelectedIndex(-1);
      });
    }, [debouncedSearch]);

    useEffect(() => {
      if (selectedIndex < 0 || !searchContainerRef.current) return;
      const el = searchContainerRef.current.querySelector<HTMLElement>(`[data-search-index="${selectedIndex}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
          setShowResults(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (result: SearchResult) => {
      setShowResults(false);
      setSearchValue("");
      setDebouncedSearch("");
      if (result.type === "level") {
        if (window.location.pathname === "/level") {
          window.location.hash = `#${result.level_id}`;
        } else {
          router.push(`/level#${result.level_id}`);
        }
      } else {
        if (window.location.pathname === "/creator") {
          window.location.hash = `#${result.player_id}`;
        } else {
          router.push(`/creator#${result.player_id}`);
        }
      }
    };

  const searchInput = (
    <div ref={searchContainerRef} className="relative">
      <Input
        data-elementid="navbar-search-input"
        ref={searchInputRef}
        aria-label="Search"
        classNames={{
          inputWrapper: "bg-default-100",
          input: "text-sm",
        }}
        endContent={
          <div className="min-w-8">
            {isSearching
              ? <Spinner size="sm" className="mr-1" />
              : <Kbd className="hidden lg:inline-block" keys={[isMac ? "command" : "ctrl"]}>K</Kbd>
            }
          </div>
        }
        labelPlacement="outside"
        placeholder="Search..."
        onKeyDown={(e) => {
          if (!showResults || searchResults.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, searchResults.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            handleResultClick(searchResults[selectedIndex]);
          }
        }}
        onValueChange={(v) => {
          setSearchValue(v);
          if (!v.trim()) {
            setShowResults(false);
            setSearchResults([]);
          }
        }}
        value={searchValue}
        onFocus={() => {
          if (searchResults.length > 0) setShowResults(true);
        }}
        startContent={
          <RiSearchLine size={18} className="text-base text-default-400 pointer-events-none flex-shrink-0" />
        }
        type="search"
      />
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-content1 border border-divider rounded-lg shadow-lg overflow-y-auto max-h-[70vh] min-w-64">
          {searchResults.map((result, index) => (
            result.type === "level" ? (
              <div key={result.level_id} data-search-index={index}>
                <LevelRow
                  key={result.level_id}
                  level={toLevel(result, index)}
                  rank={index + 1}
                  isSelected={selectedIndex === index}
                  onClick={() => handleResultClick(result)}
                />
              </div>
            ) : (
              <div key={result.player_id} data-search-index={index}>
                <CreatorRow
                  key={result.player_id}
                  creator={toCreator(result)}
                  rank={index + 1}
                  isSelected={selectedIndex === index}
                  onClick={() => handleResultClick(result)}
                />
              </div>
            )
          ))}
        </div>
      )}
    </div>
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
