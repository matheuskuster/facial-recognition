'use client';

type SectionHeaderProps = {
  title: string;
  description: string;
};

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="border-b pb-6">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="text-muted-foreground pt-1">{description}</p>
    </div>
  );
}
