// src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import ThemeToggleButton from './ThemeToggleButton';
import { LogIn, LogOut, User, Users, LayoutDashboard, GitBranch, PlusCircle, Settings, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Assuming Avatar component exists
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" // Assuming DropdownMenu component exists

const Header = () => {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  const getInitials = (name?: string | null) => {
      if (!name) return '?';
      const names = name.split(' ');
      if (names.length === 1) return names[0][0].toUpperCase();
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Logo/Brand */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
           <GitBranch className="h-6 w-6 text-primary"/>
           <span className="hidden font-bold sm:inline-block text-lg">FamilyTree</span>
        </Link>

        {/* Main Navigation (visible when logged in) */}
        {session?.user && (
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">
                <LayoutDashboard className="mr-1 h-4 w-4 inline-block align-middle"/> Dashboard
              </Link>
              <Link href="/tree" className="transition-colors hover:text-foreground/80 text-foreground/60">
                 <Users className="mr-1 h-4 w-4 inline-block align-middle"/> Family Tree
              </Link>
              <Link href="/add-member" className="transition-colors hover:text-foreground/80 text-foreground/60">
                 <PlusCircle className="mr-1 h-4 w-4 inline-block align-middle"/> Add Member
              </Link>
               <Link href="/search" className="transition-colors hover:text-foreground/80 text-foreground/60">
                 <Search className="mr-1 h-4 w-4 inline-block align-middle"/> Search
              </Link>
              {/* Add more main navigation links here */}
            </nav>
        )}

        {/* Right side actions */}
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <ThemeToggleButton />
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div> // Placeholder for loading avatar/button
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
                    <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Mobile Nav Links */}
                 <DropdownMenuItem asChild className="md:hidden">
                    <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild className="md:hidden">
                     <Link href="/tree"><Users className="mr-2 h-4 w-4" /> Family Tree</Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild className="md:hidden">
                     <Link href="/add-member"><PlusCircle className="mr-2 h-4 w-4" /> Add Member</Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild className="md:hidden">
                     <Link href="/search"><Search className="mr-2 h-4 w-4" /> Search</Link>
                 </DropdownMenuItem>
                 <DropdownMenuSeparator className="md:hidden"/>
                 {/* Common Links */}
                <DropdownMenuItem asChild>
                  <Link href="/profile"><User className="mr-2 h-4 w-4" /> Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link href="/invite"><PlusCircle className="mr-2 h-4 w-4" /> Invite Members</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <nav className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm"><LogIn className="mr-1 h-4 w-4"/>Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;