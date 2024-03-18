import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import Sidebar from '@/components/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Facial Recognition',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'w-screen h-screen')}>
        <div className="flex h-full items-start">
          <Sidebar />
          <div className="w-full h-full">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
