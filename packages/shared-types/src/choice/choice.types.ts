export type Choice = {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
};

export type ChoiceInput = Omit<Choice, "id" | "questionId"> & {
  id?: number;
  questionId?: number;
};
