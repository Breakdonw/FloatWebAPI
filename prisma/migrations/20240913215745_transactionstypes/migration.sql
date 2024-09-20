-- CreateEnum
CREATE TYPE "transactionsTypes" AS ENUM ('purchase', 'creditCardPayment', 'savingsDeposit', 'recurring');

-- AlterTable
ALTER TABLE "Transactions" ADD COLUMN     "type" "transactionsTypes" NOT NULL DEFAULT 'purchase';
