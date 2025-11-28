/*
  Warnings:

  - You are about to drop the `canvasstate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `canvasstate` DROP FOREIGN KEY `CanvasState_projectId_fkey`;

-- AlterTable
ALTER TABLE `project` ADD COLUMN `canvasData` LONGTEXT NULL;

-- DropTable
DROP TABLE `canvasstate`;
