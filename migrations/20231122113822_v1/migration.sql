/*
  Warnings:

  - You are about to alter the column `amount` on the `RecipeIngredient` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(7,2)`.
  - A unique constraint covering the columns `[name]` on the table `Ingredient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `promptId` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GENERATION_REQUEST_TYPE" AS ENUM ('GENERATIVE', 'ITERATIVE');

-- CreateEnum
CREATE TYPE "GENERATION_REQUEST_STATUS" AS ENUM ('GENERATION_REQUESTED', 'GENERATION_PROGRESS', 'GENERATION_COMPLETE', 'GENERATION_FAILED');

-- CreateEnum
CREATE TYPE "IMAGE_GENERATION_REQUEST_STATUS" AS ENUM ('GENERATION_REQUESTED', 'GENERATION_PROGRESS', 'GENERATION_UPLOADED', 'GENERATION_COMPLETE', 'GENERATION_FAILED');

-- CreateEnum
CREATE TYPE "CoinTransactionType" AS ENUM ('SIGNUP', 'PURCHASED', 'REFUNDED', 'USED');

-- AlterEnum
ALTER TYPE "UNIT" ADD VALUE 'CLOVES';

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "cookingTimeMinutes" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "instructions" JSONB,
ADD COLUMN     "promptId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RecipeIngredient" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(7,2);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "newUser" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "GenerationRequest" (
    "id" TEXT NOT NULL,
    "requestType" "GENERATION_REQUEST_TYPE" NOT NULL,
    "parentRequestId" TEXT,
    "status" "GENERATION_REQUEST_STATUS" NOT NULL DEFAULT 'GENERATION_REQUESTED',
    "text" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageGenerationRequest" (
    "id" TEXT NOT NULL,
    "parentRequestId" TEXT,
    "status" "IMAGE_GENERATION_REQUEST_STATUS" NOT NULL DEFAULT 'GENERATION_REQUESTED',
    "recipeId" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "blobPathname" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageGenerationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinTransaction" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "transactionType" "CoinTransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CoinTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinBalance" (
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "StripeProduct" (
    "stripeProductId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coins" INTEGER NOT NULL,
    "priceId" TEXT NOT NULL,
    "productLive" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "StripePrice" (
    "stripePriceId" TEXT NOT NULL,
    "priceGBP" DECIMAL(5,2) NOT NULL
);

-- CreateTable
CREATE TABLE "StripeCustomer" (
    "stripeCustomerId" TEXT NOT NULL,
    "stripeName" TEXT NOT NULL,
    "stripeEmail" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageGenerationRequest_recipeId_key" ON "ImageGenerationRequest"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "CoinBalance_userId_key" ON "CoinBalance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeProduct_stripeProductId_key" ON "StripeProduct"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "StripePrice_stripePriceId_key" ON "StripePrice"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomer_stripeCustomerId_key" ON "StripeCustomer"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomer_userId_key" ON "StripeCustomer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_name_key" ON "Ingredient"("name");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "GenerationRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationRequest" ADD CONSTRAINT "GenerationRequest_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageGenerationRequest" ADD CONSTRAINT "ImageGenerationRequest_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageGenerationRequest" ADD CONSTRAINT "ImageGenerationRequest_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoinBalance" ADD CONSTRAINT "CoinBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeProduct" ADD CONSTRAINT "StripeProduct_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "StripePrice"("stripePriceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeCustomer" ADD CONSTRAINT "StripeCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
