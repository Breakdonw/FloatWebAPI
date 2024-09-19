/*
  Warnings:

  - The `type` column on the `UserAccount` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "accountType" AS ENUM ('checkings', 'savings', 'credit');

-- AlterTable
ALTER TABLE "UserAccount" DROP COLUMN "type",
ADD COLUMN     "type" "accountType" NOT NULL DEFAULT 'checkings';
