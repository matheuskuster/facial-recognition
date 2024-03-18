import prisma from '@/lib/prisma';

interface CreateClass {
  name: string;
  abbreviation: string;
  teacher: string;
  totalHours: number;
  students: string[];
}

interface UpdateClass {
  name?: string;
  abbreviation?: string;
  teacher?: string;
  totalHours?: number;
  students?: string[];
}

export class ClassesController {
  static async create(params: CreateClass) {
    const response = await prisma.class.create({
      data: {
        ...params,
        students: {
          connect: params.students.map((id) => ({ id })),
        },
      },
    });

    return { class: response };
  }

  static async find(id: string) {
    const response = await prisma.class.findUnique({ where: { id } });

    return { class: response };
  }

  static async findAll() {
    const response = await prisma.class.findMany();

    return { classes: response };
  }

  static async update(id: string, params: UpdateClass) {
    const response = await prisma.class.update({
      where: { id },
      data: {
        ...params,
        students: {
          connect: params?.students?.map((id) => ({ id })),
        },
      },
    });

    return { class: response };
  }

  static async delete(id: string) {
    await prisma.class.delete({ where: { id } });
  }
}
