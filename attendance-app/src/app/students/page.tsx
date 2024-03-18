import { SectionHeader } from '@/components/section-header';
import { Student as StudentType, StudentsTable } from '@/components/students-table';
import { api } from '@/services/api';

async function fetchStudents(): Promise<StudentType[]> {
  try {
    const response = await api.get('/students');
    return response.data.students as StudentType[];
  } catch (error) {
    console.error('Failed to fetch students', error);
    return [];
  }
}

export default async function Students() {
  const students = await fetchStudents();

  return (
    <div className="w-full h-full p-12">
      <SectionHeader
        title="Alunos"
        description="Aqui você pode visualizar e gerenciar os alunos cadastrados."
      />

      <main>
        <StudentsTable students={students} />
      </main>
    </div>
  );
}
