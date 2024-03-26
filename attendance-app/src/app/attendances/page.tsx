import { Attendance as AttendanceType, AttendancesTable } from '@/components/attendances-tabe';
import { SectionHeader } from '@/components/section-header';
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

export default async function Attendances() {
  const attendances = await fetchAttendances();
  return (
    <div className="w-full h-full p-12">
      <SectionHeader
        title="Chamadas"
        description="Aqui você pode visualizar e criar chamadas"
      />
      <main>
        <AttendancesTable attendances={attendances} />
      </main>
    </div>
  );
}
