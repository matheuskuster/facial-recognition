import { Class as ClassType, ClassesTable } from '@/components/classes-table';
import { SectionHeader } from '@/components/section-header';
import { Student as StudentType } from '@/components/students-table';
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

async function fetchStudents(): Promise<StudentType[]> {
  try {
    const response = await api.get('/students');
    return response.data.students as StudentType[];
  } catch (error) {
    console.error('Failed to fetch students', error);
    return [];
  }
}

export default async function Classes() {
  const classes = await fetchClasses();
  const students = await fetchStudents();

  return (
    <div className="w-full h-full p-12">
      <SectionHeader
        title="Matérias"
        description="Aqui você pode visualizar e cadastrar matérias."
      />

      <main>
        <ClassesTable classes={classes} students={students} />
      </main>
    </div>
  );
}
