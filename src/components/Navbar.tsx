"use client";

import Link from "next/link";
import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  LogOut,
  Settings,
  Moon,
  Sun,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import Spinner from "./ui/Spinner";
import { useRouter } from "next/navigation";
import UserMenu from "./UserMenu";
import UserInfo from "./UserInfo";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [hasPermissionAdmin] = useAuth("view", "adminPage")


  const menuItems = [
    { label: "Home", href: "/", show: true },
    {
      label: "Admin",
      href: "/admin",
      show: hasPermissionAdmin,
    },
  ].filter(item => item.show);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({
        redirect: true,
        callbackUrl: '/'
      });
      toast.success("Signed Out", {
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.log("Sign Out Failed", error)
      toast.error("Sign Out Failed", {
        description: "Unable to sign out. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserMenu = () => {
    return (
      <div className="flex flex-col space-y-2">
        <Button
          variant='ghost'
          className="w-full flex justify-start items-center p-4 dark:text-gray-200"
          onClick={() => setTheme(theme => theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'dark' ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          <span>
            {theme === 'dark' ? 'Light Mode' :
              theme === 'system' ? 'System Mode' :
                'Dark Mode'}
          </span>
        </Button>

        <Button
          variant="ghost"
          className="w-full flex justify-start items-center p-4 dark:text-gray-200"
          onClick={() => { router.push('/settings'); toggleMenu(); }}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>

        <Button
          variant="ghost"
          className="w-full flex justify-start items-center p-4 dark:text-gray-200"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="">
      <nav aria-label="Main Navigation" className="z-30 px-4 py-3 fixed top-0 w-full bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-700">
        <div className="flex justify-between items-center max-w-7xl m-auto">
          {/* Logo */}
          <Link href="/" className="flex gap-1 items-center" aria-label="Homepage">
            <Image
              src={'/icons/icon.png'}
              alt="icon"
              width={50}
              height={50}
              className="dark:bg-white dark:rounded-2xl dark:border-2"
            />
            <span className="ml-2 text-3xl text-gray-950 dark:text-white font-bold pt-1.5">
              AI Taalcoach
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <div className="md:hidden">
              <Button
                variant="ghost"
                onClick={toggleMenu}
                className="text-gray-900 dark:text-white"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex justify-end gap-4 text-gray-900 dark:text-white">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  className="pt-2 pb-1 px-4 cursor-pointer border-b-2 hover:border-b-2 border-transparent hover:border-gray-900 dark:hover:border-white transition"
                  href={item.href}
                  aria-label={`Go to ${item.label}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <UserMenu />
            {/* {renderUserMenu()} */}
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={toggleMenu}>
              <div
                className="absolute top-0 right-0 w-5/6 h-full bg-white dark:bg-gray-900 shadow-lg transform translate-x-0 transition-transform duration-300 ease-in-out"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <UserInfo />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMenu}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                <div className="flex flex-col p-4 space-y-2">
                  {menuItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={toggleMenu}
                      className="py-2 px-4 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {session && <div className="p-4 border-t">
                  {renderUserMenu()}
                </div>}
              </div>
            </div>
          )}
        </div>
      </nav>
      <div className="w-full h-[74px] bg-white dark:bg-gray-800"></div>
    </div>
  )
}

export default Navbar;