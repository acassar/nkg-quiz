/*
  Warnings:

  - You are about to drop the column `createdById` on the `Session` table. All the data in the column will be lost.
  - Made the column `createdById` on table `Quiz` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_createdById_fkey";

-- AlterTable
ALTER TABLE "Quiz" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "createdById";

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
