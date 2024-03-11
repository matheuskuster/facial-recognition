import prisma from '@/lib/prisma';

interface Createclass {
  name: string;
  abbreviation: string;
  teacher: string;
  totalHours: number;
}

interface Updateclass {
  name?: string;
  abbreviation?: string;
  teacher?: string;
  totalHours?: number;
}

export class ClassesController {
  static async create(params: Createclass) {
    const response = await prisma.class.create({ data: params });

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

  static async update(id: string, params: Updateclass) {
    const response = await prisma.class.update({ where: { id }, data: params });

    return { class: response };
  }

  static async delete(id: string) {
    await prisma.class.delete({ where: { id } });
  }
}
