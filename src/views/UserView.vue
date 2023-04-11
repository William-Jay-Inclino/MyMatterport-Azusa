<template>
  <div class="">
    <div class="columns login-pattern-background" v-if="router.currentRoute.value.name === 'userLogin'">
      <div class="column">
        <UserLogin @login-user="loginUser" />
      </div>
    </div>
    <div class="columns pattern-background" v-else-if="router.currentRoute.value.name === 'userProfile'">
      <DragCol leftPercent="20" :sliderWidth="8" width="100%" height="100vh" sliderColor="#FFFFF"
        sliderBgColor="rgba(255, 255, 255, 0.018)" sliderBgHoverColor="rgba(255, 255, 255, 0.06)">
        <template #left>
          <TheLeftSidebar />
          <MobileLeftSidebarView />
        </template>
        <template #right>
          <div>
            <UserProfile @click-reset-password="clickResetPassword" @click-update="clickUpdate" />
          </div>
        </template>
      </DragCol>
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
import type { User } from "@/stores/types";
import { onUnmounted } from "vue";

//@ts-ignore
import { DragCol } from 'vue-resizer' //Ignore linting error

const router = useRouter();
const route = useRoute();
const { oruga } = useProgrammatic();
const userStore = useUserStore();
const sessionStore = useSessionStore();

// Handlers
const loginUser = async (payload: { user: User }) => {
  const res = await sessionStore.loginUser(payload.user);
  
  if (res) {
    router.push("/space/list");
  }

};

const clickResetPassword = (payload: { action: string }) => {
  profileChangeNotification(payload.action), console.log("Sends Password");
};
const clickUpdate = async(payload: { action: string; user: User }) => {
  console.log('clickUpdate()', payload)
    profileChangeNotification(payload.action)
    await userStore.updateUser(payload.user)
    console.log("Updated Profile", payload.user)
    localStorage.setItem("thisUser", JSON.stringify(sessionStore.thisUser))
};

const profileChangeNotification = (payload: string) => {
  oruga.notification.open({
    duration: 4000,
    message: payload,
    variant: "success",
    position: "bottom-right",
    closable: true,
  });
}

onUnmounted(() => {
  userStore.userInfo = {} as User;
})
</script>

<style scoped>
.pattern-background {
  margin-top: 0px;
  width: 100vw;
  height: 100vh;
}
</style>
