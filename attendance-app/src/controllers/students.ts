import prisma from '@/lib/prisma';

interface CreateStudent {
  name: string;
  registration: string;
  photoUrl: string;
}

interface UpdateStudent {
  name?: string;
  photoUrl?: string;
}

export class StudentsController {
  static async create(params: CreateStudent) {
    const student = await prisma.student.create({ data: params });

    return { student };
  }

  static async find(id: string) {
    const student = await prisma.student.findUnique({ where: { id } });

    return { student };
  }

  static async findByRegistration(registration: string) {
    const student = await prisma.student.findUnique({ where: { registration } });

    return student;
  }

  static async findByClassId(classId: string) {
    const students = await prisma.student.findMany({
      where: { classes: { some: { id: classId } } },
    });

    return students;
  }

  static async findAll() {
    const students = await prisma.student.findMany({
      include: { classes: true },
    });

    return {
      students: students.map((student) => ({
        ...student,
        classes: student.classes.map((c) => c.abbreviation),
      })),
    };
  }

  static async update(id: string, params: UpdateStudent) {
    const student = await prisma.student.update({ where: { id }, data: params });

    return { student };
  }

  static async delete(id: string) {
    await prisma.student.delete({ where: { id } });
  }
}
