'use client';

import { Book, Calendar, LucideIcon, Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn('w-[20%] max-w-[320px] border-r h-full pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Menu</h2>
          <div className="space-y-1">
            <NavItem label="Chamadas" pathname="/attendances" icon={Calendar} />
            <NavItem label="Turmas" pathname="/classes" icon={Book} />
            <NavItem label="Alunos" pathname="/students" icon={Users} />
          </div>
        </div>
      </div>
    </div>
  );
}

type NavItemProps = {
  label: string;
  pathname: string;
  icon: LucideIcon;
};

function NavItem(props: NavItemProps) {
  const router = useRouter();
  const currentPath = usePathname();

  return (
    <Button
      variant={currentPath === props.pathname ? 'secondary' : 'ghost'}
      className="w-full justify-start"
      onClick={() => router.push(props.pathname)}
    >
      <props.icon className="mr-2 h-4 w-4 mb-0.5" />
      {props.label}
    </Button>
  );
}
