INSERT INTO "QuizOptions" ("quizId", "autoRestart", "revealAnswers", "showLeaderboard", "showScores", "showFullRanking")
SELECT q.id, false, false, true, true, true
FROM "Quiz" q
WHERE NOT EXISTS (
  SELECT 1 FROM "QuizOptions" o WHERE o."quizId" = q.id
);
