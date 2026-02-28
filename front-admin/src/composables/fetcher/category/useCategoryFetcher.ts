import { useFetcher } from "../useFetcher";
import { categoryFetcher } from "@/services/fetcher/category/category.fetcher.ts";

export function useCategoryFetcher() {
  const createCategory = useFetcher(categoryFetcher.createCategory);

  return {
    createCategory,
  };
}
