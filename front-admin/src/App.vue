<script setup lang="ts">
import { ref } from "vue";
import HeaderBar from "./components/HeaderBar.vue";
import Login from "./components/Login.vue";
import { useAuth } from "./composables/useAuth";
import router from "./router";
import { socketClient } from "./services/socket.service";
import { SOCKET_LIFECYCLE_EVENTS, useSocketEvent } from "@nkg-quiz/shared-socket";

useSocketEvent(socketClient, SOCKET_LIFECYCLE_EVENTS.CONNECT, () => {
  console.log("[admin-socket] Connected");
});
useSocketEvent(socketClient, SOCKET_LIFECYCLE_EVENTS.DISCONNECT, () => {
  console.log("[admin-socket] Disconnected");
});
useSocketEvent(socketClient, SOCKET_LIFECYCLE_EVENTS.CONNECT_ERROR, () => {
  console.error("[admin-socket] Connection error");
});

const { isAuthed } = useAuth();
const isTransitioning = ref(false);

router.afterEach((to, from) => {
  const toDepth = to.path.split("/").length;
  const fromDepth = from.path.split("/").length;
  to.meta.transition = toDepth < fromDepth ? "slide-right" : "slide-left";
});

//TODO: handle auth state changes (e.g. token expiration) and redirect to login if needed
</script>

<template>
  <div class="shell">
    <Login />

    <HeaderBar />

    <div v-if="isAuthed" class="columns">
      <div
        class="grid route-container"
        :class="{ transitioning: isTransitioning }"
      >
        <RouterView v-slot="{ Component, route }">
          <Transition
            :name="(route.meta.transition as string) || 'slide-left'"
            @before-enter="isTransitioning = true"
            @after-enter="isTransitioning = false"
          >
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease;
}
.slide-left-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left-leave-to,
.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-left-leave-active,
.slide-right-leave-active {
  position: absolute;
  width: 100%;
}
.route-container {
  position: relative;
}
.route-container.transitioning {
  overflow: hidden;
}
</style>
