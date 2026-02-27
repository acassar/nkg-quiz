import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { Quiz } from "@/types/quiz/quiz.types";
import { Serializer } from "pinia-plugin-persistedstate";

//TODO: make the persistence work and allow map persistence
const serializer: Serializer = {
  serialize(data) {
    console.log("Serializing quizMap:", data);
    return JSON.stringify(Array.from(data.entries()));
  },
  deserialize(serializedData) {
    return new Map(JSON.parse(serializedData));
  },
};

export const useQuizStore = defineStore(
  "quiz",
  () => {
    const quizMap = reactive<Map<number, Quiz>>(new Map());
    const test = ref("test");

    const quizzes = computed(() => Array.from(quizMap.values()));

    function getById(id: number): Quiz | undefined {
      return quizMap.get(id);
    }

    function set(quiz: Quiz) {
      quizMap.set(quiz.id, quiz);
    }

    function remove(id: number) {
      quizMap.delete(id);
    }

    function clear() {
      quizMap.clear();
    }

    return {
      quizzes,
      getById,
      set,
      remove,
      clear,
      test,
    };
  },
  { persist: { storage: sessionStorage, serializer } },
);
