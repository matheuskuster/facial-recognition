import z from 'zod';

import { ClassesController } from '@/controllers/classes';
import logger from '@/logger';

export async function GET() {
  logger.info('Fetching all classes');

  const { classes } = await ClassesController.findAll();

  logger.info(`Fetched [${classes.length}] classes successfully`);
  return Response.json({ classes }, { status: 200 });
}

export async function POST(request: Request) {
  const data = await request.json();

  logger.info(`Creating a new class [${data.name}]`);

  const createStudentSchema = z.object({
    name: z.string(),
    abbreviation: z.string(),
    teacher: z.string(),
    totalHours: z.number().min(1),
  });

  const { name, abbreviation, teacher, totalHours } = createStudentSchema.parse(data);

  const { class: response } = await ClassesController.create({
    name,
    abbreviation,
    teacher,
    totalHours,
  });

  logger.info(`Created class [${response.name}] successfully`);

  return Response.json({ class: response }, { status: 200 });
}
