<template>
  <div class="">
    <div
      class="columns login-pattern-background"
      v-if="router.currentRoute.value.name === 'userLogin'"
    >
      <div class="column">
        <UserLogin @login-user="loginUser" />
      </div>
    </div>
    <div
      class="columns pattern-background"
      v-else-if="router.currentRoute.value.name === 'userProfile'"
    >
      <div
        class="column is-one-quarter-tablet is-one-fifth-widescreen is-hidden-mobile menu-width"
        style="height: 100vh"
      >
        <TheLeftSidebar />
      </div>
      <MobileLeftSidebarView />
      <div>
        <UserProfile @send-password="sendPassword" @profile-update="profileUpdate" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Components
import TheLeftSidebar from "@/components/TheLeftSidebar.vue";
import UserLogin from "@/components/user/UserLogin.vue";
import UserProfile from "@/components/user/UserProfile.vue";
import SpaceActionBar from "@/components/space/SpaceActionBar.vue";

import { useRouter, useRoute } from "vue-router";
import { useProgrammatic } from "@oruga-ui/oruga-next";
import { useUserStore } from "@/stores/user";
import { useSessionStore } from "@/stores/session";
import { User } from "@/stores/types";

const router = useRouter();
const route = useRoute();
const { oruga } = useProgrammatic();
const userStore = useUserStore();
const sessionStore = useSessionStore();

userStore.getUsers();
userStore.setSelectedUser(userStore.getRandomUser);
sessionStore.isLoggedIn;

// Handlers
const loginUser = (payload: { user: User }) => {
  sessionStore.loginUser(payload.user);
  if (sessionStore.isLoggedIn === true && sessionStore.authUser != null) {
    console.log("Logged User Details", sessionStore.authUser);
    router.push("/space/list");
  }
};

const sendPassword = (payload: { action: string }) => {
  profileChangeNotification(payload.action), console.log("Sends Password");
};
const profileUpdate = (payload: { action: string; user: User }) => {
  profileChangeNotification(payload.action),
    userStore.updateUser(payload.user),
    console.log("Updated Profile", payload.user);
};

function profileChangeNotification(payload) {
  oruga.notification.open({
    duration: 4000,
    message: payload,
    variant: "success",
    position: "bottom-right",
    closable: true,
  });
}
</script>

<style scoped>
.pattern-background {
  margin-top: 0px;
  width: 100vw;
  height: 100vh;
}
</style>
