/*
  Warnings:

  - You are about to drop the column `lemonSqueezyCustomerId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lemonSqueezyOrderId` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `lemonSqueezyCustomerId`,
    DROP COLUMN `lemonSqueezyOrderId`,
    ADD COLUMN `razorpayOrderId` VARCHAR(191) NULL,
    ADD COLUMN `razorpayPaymentId` VARCHAR(191) NULL,
    ADD COLUMN `razorpaySignature` VARCHAR(191) NULL;
