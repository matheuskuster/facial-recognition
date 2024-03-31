import { Attendance as AttendanceType, AttendancesTable } from '@/components/attendances-table';
import { Class } from '@/components/classes-table';
import { SectionHeader } from '@/components/section-header';
import { Student } from '@/components/students-table';
import { api } from '@/services/api';

async function fetchAttendances(): Promise<AttendanceType[]> {
  try {
    const response = await api.get('/attendances');
    return response.data.attendances as AttendanceType[];
  } catch (error) {
    console.error('Failed to fetch attendances', error);
    return [];
  }
}

async function fetchClasses(): Promise<Class[]> {
  try {
    const response = await api.get('/classes');
    return response.data.classes as Class[];
  } catch (error) {
    console.error('Failed to fetch classes', error);
    return [];
  }
}

async function fetchStudents(): Promise<Student[]> {
  try {
    const response = await api.get('/students');
    return response.data.students as Student[];
  } catch (error) {
    console.error('Failed to fetch students', error);
    return [];
  }
}

export default async function Attendances() {
  const attendances = await fetchAttendances();
  const classes = await fetchClasses();
  const students = await fetchStudents();

  return (
    <div className="w-full h-full p-12">
      <SectionHeader title="Chamadas" description="Aqui você pode visualizar e criar chamadas" />
      <main>
        <AttendancesTable attendances={attendances} classes={classes} students={students} />
      </main>
    </div>
  );
}
