-- AddForeignKey
ALTER TABLE "student_attendances" ADD CONSTRAINT "student_attendances_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
