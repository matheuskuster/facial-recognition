import prisma from '@/lib/prisma';

interface CreateStudentAttendance {
  studentId: string;
  attendanceId: string;
  present: boolean;
}

interface UpdateStudentAttendance {
  present?: boolean;
}

export class StudentAttendancesController {
  static async create(params: CreateStudentAttendance) {
    const studentAttendance = await prisma.studentAttendance.create({ data: params });

    return { studentAttendance };
  }

  static async find(id: string) {
    const studentAttendance = await prisma.studentAttendance.findUnique({ where: { id } });

    return { studentAttendance };
  }

  static async findAll() {
    const studentAttendances = await prisma.studentAttendance.findMany();

    return { studentAttendances };
  }

  static async update(id: string, params: UpdateStudentAttendance) {
    const studentAttendance = await prisma.studentAttendance.update({
      where: { id },
      data: params,
    });

    return { studentAttendance };
  }

  static async delete(id: string) {
    await prisma.studentAttendance.delete({ where: { id } });
  }

  static async processReport(attendanceId: string, report: Record<string, boolean>) {
    const promises: Promise<unknown>[] = [];

    for (const [studentId, present] of Object.entries(report)) {
      promises.push(StudentAttendancesController.create({ attendanceId, studentId, present }));
    }

    return Promise.all(promises);
  }
}
