<template>
  <div class="container">
    <div class="column is-hidden-tablet">
      <button
        class="button is-rounded"
        @click="spaceStore.isMobileSidebarActive = true"
        style="width: 80px"
      >
        <o-icon pack="mdi" icon="forwardburger" size="medium" class="button-icon">
        </o-icon>
      </button>
    </div>
    <div
      class="column profile-container is-three-quarters-mobile is-mobile"
      v-if="sessionStore.authUser"
    >
      <div class="is-block-absolute">
        <h1 class="is-4 profile-title has-text-black">Edit Profile</h1>
      </div>
      <div
        class="column profile-area is-three-fifths is-offset-one-fifth is-three-quarters-mobile"
      >
        <div class="password-wrapper">
          <o-field horizontal>
            <div class="label-text has-text-dark">Family Name</div>
            <o-input
              placeholder="Admin"
              class="login-input"
              expanded
              v-model="sessionStore.authUser.last_name"
            ></o-input>
          </o-field>
        </div>
        <div class="password-wrapper">
          <o-field horizontal>
            <div class="label-text has-text-dark">Name</div>
            <o-input
              placeholder="Administrator"
              class="login-input"
              expanded
              v-model="sessionStore.authUser.first_name"
            ></o-input>
          </o-field>
        </div>
        <div class="password-wrapper">
          <o-field horizontal>
            <div class="label-text has-text-dark">Middle Name</div>
            <o-input
              placeholder="middle name"
              class="login-input"
              expanded
              v-model="sessionStore.authUser.middle_name"
            ></o-input>
          </o-field>
        </div>
        <div class="password-wrapper">
          <o-field horizontal>
            <div class="label-text has-text-dark">Company Name</div>
            <o-input
              placeholder="Company Name"
              class="login-input"
              expanded
              v-model="sessionStore.authUser.company_name"
            ></o-input>
          </o-field>
        </div>
        <div class="password-wrapper">
          <o-field horizontal>
            <div class="label-text has-text-dark">Mail Address</div>
            <o-input
              placeholder="Mail Address"
              class="login-input"
              expanded
              disabled
              style="background: none; border: none"
              v-model="sessionStore.authUser.email"
            ></o-input>
          </o-field>
        </div>
        <div class="">
          <div class="password-wrapper">
            <o-field horizontal>
              <div class="label-text has-text-dark">Password</div>
              <button
                class="button is-primary"
                @click="emit('send-password', { action: 'Send Mail for Reset Password' })"
              >
                Send Reset Password to the Mail
              </button>
            </o-field>
          </div>
          <div>
            <button
              class="button is-rounded is-primary log-button"
              @click="
                emit('profile-update', {
                  action: 'Update Profile',
                  user: sessionStore.authUser,
                })
              "
            >
              <span class="menu-text">Update</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Stores
import { useUserStore } from "@/stores/user";
import { useSessionStore } from "@/stores/session";
import { onMounted } from "vue";

// Components
import TheLeftSidebar from "@/components/TheLeftSidebar.vue";

const emit = defineEmits(["send-password", "profile-update"]);
const userStore = useUserStore();
const sessionStore = useSessionStore();

sessionStore.init();
</script>

<style scoped>
@media screen and (max-width: 768px) {
  .profile-area {
    top: 75px !important;
  }
  .profile-container {
    height: 715px;
    width: 395px;
    margin-top: calc(-6%);
    margin-left: calc(30%);
  }
  .log-button {
    left: -25px !important;
  }
}
.password-wrapper {
  margin-top: 20px !important;
}
.label-text {
  text-align: left;
}
.button {
  display: flex;
  width: 270px;
  height: 33px;
  border-radius: 50px;
}
.button-icon {
  margin-top: -30px !important;
}
.log-button {
  margin-left: 0px !important;
  right: 0;
  left: 0;
}
</style>
