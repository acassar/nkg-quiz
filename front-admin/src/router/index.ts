import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import EditQuizView from "../views/quiz/EditQuizView.vue";
import SessionStatsView from "../pages/SessionStatsView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/quiz/edit/:id",
    name: "EditQuiz",
    component: EditQuizView,
    props: (route: any) => ({ quizId: parseInt(route.params.id) }),
  },
  {
    path: "/session/:code/stats",
    name: "SessionStats",
    component: SessionStatsView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
