// src/components/layout/ThemeToggleButton.tsx
'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
   React.useEffect(() => {
       setMounted(true)
   }, [])

   if (!mounted) {
       // Render a placeholder button matching the size on the server/initial client render
       // to prevent layout shifts and hydration errors.
       return <Button variant="ghost" size="icon" disabled className="h-9 w-9 md:h-10 md:w-10"><div className="h-5 w-5"></div></Button>;
   }

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon" // Use icon size for consistency
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="h-9 w-9 md:h-10 md:w-10" // Match size used in placeholder
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggleButton;