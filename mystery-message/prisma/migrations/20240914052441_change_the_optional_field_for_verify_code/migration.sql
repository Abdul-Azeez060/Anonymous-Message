/*
  Warnings:

  - Made the column `verifyCode` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `verifyCodeExpiry` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "verifyCode" SET NOT NULL,
ALTER COLUMN "verifyCodeExpiry" SET NOT NULL;