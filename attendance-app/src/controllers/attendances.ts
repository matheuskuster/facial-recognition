import prisma from '@/lib/prisma';

interface CreateAttendance {
  classId: string;
  date: Date;
  photoUrl?: string;
  status: 'processed' | 'pending';
}

interface UpdateAttendance {
  photoUrl?: string;
  status?: 'processed' | 'pending';
}

export class AttendancesController {
  static async create(params: CreateAttendance) {
    const attendance = await prisma.attendance.create({ data: params });

    return { attendance };
  }

  static async find(id: string) {
    const attendance = await prisma.attendance.findUnique({ where: { id } });

    return { attendance };
  }

  static async findAll() {
    const attendances = await prisma.attendance.findMany({
      include: {
        class: true,
        studentAttendances: true,
      },
    });

    return { attendances };
  }

  static async update(id: string, params: UpdateAttendance) {
    const attendance = await prisma.attendance.update({ where: { id }, data: params });

    return { attendance };
  }

  static async delete(id: string) {
    await prisma.studentAttendance.deleteMany({ where: { attendanceId: id } });
    await prisma.attendance.delete({ where: { id } });
  }
}
