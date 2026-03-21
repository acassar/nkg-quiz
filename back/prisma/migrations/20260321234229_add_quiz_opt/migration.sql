-- CreateTable
CREATE TABLE "QuizOptions" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "autoRestart" BOOLEAN NOT NULL DEFAULT false,
    "revealAnswers" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QuizOptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizOptions_quizId_key" ON "QuizOptions"("quizId");

-- AddForeignKey
ALTER TABLE "QuizOptions" ADD CONSTRAINT "QuizOptions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
