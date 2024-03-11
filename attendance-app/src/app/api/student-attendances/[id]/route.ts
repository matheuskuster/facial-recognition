import z from "zod";

import logger from "@/logger";
import { StudentAttendancesController } from "@/controllers/studentAttendances";

export async function GET(request: Request, { params } : { params : { id: string } }) {
  const { id } = params;

  logger.info(`Fetching student attendance with id [${id}]`);

  const { studentAttendance } = await StudentAttendancesController.find(id);

  if (!studentAttendance) {
    logger.error(`Student attendance with id [${id}] not found`);
    return Response.json({ message: "Student attendance not found" }, { status: 404 });
  }

  logger.info(`Fetched student attendance with id [${id}] successfully`);

  return Response.json({ studentAttendance }, { status: 200 });
}

export async function PUT(request: Request, { params } : { params : { id: string} }) {
  const { id } = params;
  const data = await request.json();

  logger.info(`Updating student attendance with id [${id}]`);

  const updateStudentSchema = z.object({
    present: z.boolean().optional()
  })

  const { present } = updateStudentSchema.parse(data);

  const { studentAttendance } = await StudentAttendancesController.update(id, { present });

  logger.info(`Updated student attendance with id [${id}] successfully`);

  return Response.json({ message: "Student attendance updated", studentAttendance }, { status: 200 });
}

export async function DELETE(request: Request, { params } : { params : { id: string} }) {
  const { id } = params;

  logger.info(`Deleting student attendance with id [${id}]`);
  
  await StudentAttendancesController.delete(id);

  logger.info(`Deleted student attendance with id [${id}] successfully`);
  return Response.json({ message: "Student attendance deleted" }, { status: 200 });
}
