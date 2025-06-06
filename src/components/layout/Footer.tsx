// src/components/layout/Footer.tsx
import Link from 'next/link';
import { GitBranch } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-background/80 backdrop-blur">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-20 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <GitBranch className="h-5 w-5 text-muted-foreground" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} FamilyTree App. By{' '}
            <Link
              href="https://jousepalas.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              @JousePalas
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy Policy</Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
