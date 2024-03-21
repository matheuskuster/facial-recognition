import { Class as ClassType, ClassesTable } from '@/components/classes-table';
import { SectionHeader } from '@/components/section-header';
import { api } from '@/services/api';

async function fetchClasses(): Promise<ClassType[]> {
  try {
    const response = await api.get('/classes');
    return response.data.classes as ClassType[];
  } catch (error) {
    console.error('Failed to fetch classes', error);
    return [];
  }
}

export default async function Classes() {
  const classes = await fetchClasses();
  return (
    <div className="w-full h-full p-12">
      <SectionHeader title="Turmas" description="Aqui você pode visualizar as Turmas cadastradas" />
      <main>
        <ClassesTable classes={classes} />
      </main>
    </div>
  );
}
