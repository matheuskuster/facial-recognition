/*
  Warnings:

  - Added the required column `status` to the `attendances` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "status" TEXT NOT NULL;
