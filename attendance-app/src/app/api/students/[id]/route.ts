import z from "zod";

import { StudentsController } from "@/controllers/students";
import logger from "@/logger";

export async function GET(request: Request, { params } : { params : { id: string } }) {
  const { id } = params;

  logger.info(`Fetching student with id [${id}]`);

  const { student } = await StudentsController.find(id);

  if (!student) {
    logger.error(`Student with id [${id}] not found`);
    return Response.json({ message: "Student not found" }, { status: 404 });
  }

  logger.info(`Fetched student with id [${id}] successfully`);

  return Response.json({ student }, { status: 200 });
}

export async function PUT(request: Request, { params } : { params : { id: string} }) {
  const { id } = params;
  const data = await request.json();

  logger.info(`Updating student with id [${id}]`);

  const updateStudentSchema = z.object({
    name: z.string().optional(), 
    photoUrl: z.string().optional(),
  })

  const { name, photoUrl } = updateStudentSchema.parse(data);

  const { student } = await StudentsController.update(id, { name, photoUrl });

  logger.info(`Updated student with id [${id}] successfully`);

  return Response.json({ message: "Student updated", student }, { status: 200 });
}

export async function DELETE(request: Request, { params } : { params : { id: string} }) {
  const { id } = params;

  logger.info(`Deleting student with id [${id}]`);
  
  await StudentsController.delete(id);

  logger.info(`Deleted student with id [${id}] successfully`);
  
  return Response.json({ message: "Student deleted" }, { status: 200 });
}
