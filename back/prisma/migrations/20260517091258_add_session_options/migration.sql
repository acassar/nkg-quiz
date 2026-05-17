-- AlterTable
ALTER TABLE "QuizOptions" ADD COLUMN     "showFullRanking" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showLeaderboard" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showScores" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "SessionOptions" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "autoRestart" BOOLEAN NOT NULL DEFAULT false,
    "revealAnswers" BOOLEAN NOT NULL DEFAULT false,
    "showLeaderboard" BOOLEAN NOT NULL DEFAULT true,
    "showScores" BOOLEAN NOT NULL DEFAULT true,
    "showFullRanking" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SessionOptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionOptions_sessionId_key" ON "SessionOptions"("sessionId");

-- AddForeignKey
ALTER TABLE "SessionOptions" ADD CONSTRAINT "SessionOptions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
