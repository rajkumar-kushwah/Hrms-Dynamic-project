/*
  Warnings:

  - You are about to drop the column `category` on the `Permission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,module,action]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `module` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Permission_name_category_key";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "category",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "module" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_module_action_key" ON "Permission"("name", "module", "action");
