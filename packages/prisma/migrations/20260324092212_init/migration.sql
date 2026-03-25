/*
  Warnings:

  - You are about to drop the column `ghName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stageName]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_userName_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "ghName",
DROP COLUMN "userName",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "stageName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_stageName_key" ON "user"("stageName");
