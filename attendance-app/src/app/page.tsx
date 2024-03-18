'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Spinner } from '@/components/spinner';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      router.push('/attendances');
    }
  }, [pathname]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner className="h-12 w-12" />
    </div>
  );
}
