-- AlterEnum
ALTER TYPE "transactionsTypes" ADD VALUE 'income';

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "Frequency" INTEGER;
