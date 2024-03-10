import prisma from "@/lib/prisma";

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
    const student = await prisma.student.create({data: params});

    return { student };
  }

  static async find(id: string) {
    const student = await prisma.student.findUnique({where: {id}});

    return { student };
  }

  static async findALl() {
    const students = await prisma.student.findMany();

    return { students };
  }

  static async update(id: string, params: UpdateStudent) {
    const student = await prisma.student.update({where: {id}, data: params});

    return { student };
  }

  static async delete(id: string) {
    await prisma.student.delete({where: {id}});
  }
}
