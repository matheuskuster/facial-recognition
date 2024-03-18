'use client';

import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

type SpinnerProps = React.HTMLAttributes<SVGSVGElement>;

export function Spinner({ className, ...rest }: SpinnerProps) {
  return <Loader2 className={cn('animate-spin', className)} {...rest} />;
}
