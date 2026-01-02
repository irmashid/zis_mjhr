-- Create Database
CREATE DATABASE IF NOT EXISTS `zis_mjhr`;
USE `zis_mjhr`;

-- Create User (Muzakki) Table
CREATE TABLE `Muzakki` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `family_size` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Transaction Table
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('FITRAH_UANG', 'FITRAH_BERAS', 'MAL', 'INFAQ', 'SODAQOH') NOT NULL,
    `amount` DOUBLE NOT NULL,
    `amount_rice` DOUBLE NULL,
    `description` VARCHAR(191) NULL,
    `muzakkiId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add ForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_muzakkiId_fkey` FOREIGN KEY (`muzakkiId`) REFERENCES `Muzakki`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
