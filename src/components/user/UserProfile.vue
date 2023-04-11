<template>
  <div class="container">
    <div class="column is-hidden-tablet">
      <button class="button is-rounded" @click="spaceStore.isMobileSidebarActive = true" style="width: 80px">
        <o-icon pack="mdi" icon="forwardburger" size="medium" class="button-icon">
        </o-icon>
      </button>
    </div>
    <div class="column profile-container is-three-quarters-mobile is-mobile" v-if="sessionStore.thisUser">
      <div class="is-block-absolute">
        <h1 class="is-4 profile-title has-text-black">{{ $t("Edit Profile") }}</h1>
      </div>
      <div class="column profile-area is-three-fifths is-offset-one-fifth is-three-quarters-mobile">
        <div class="password-wrapper">
          <o-field horizontal>
            <div class="label-text has-text-dark">{{ $t("Family Name") }}</div>
            <o-input :placeholder="$t('Admin')" class="login-input" data-cy="last-name-input" expanded
              v-model="sessionStore.thisUser.last_name"></o-input>
          </o-field>
        </div>
        <div class="password-wrapper">
          <o-field horizontal>
            <div class="label-text has-text-dark">{{ $t("First Name") }}</div>
            <o-input :placeholder="$t('Administrator')" class="login-input" data-cy="first-name-input" expanded
              v-model="sessionStore.thisUser.first_name"></o-input>
          </o-field>
        </div>
        <div class="password-wrapper">
          <o-field horizontal>
            <div class="label-text has-text-dark">{{ $t("Company Name") }}</div>
            <o-input :placeholder="$t('Company Name')" class="login-input" data-cy="company-name-input" expanded
              v-model="sessionStore.thisUser.company_name"></o-input>
          </o-field>
        </div>
        <div class="password-wrapper">
          <o-field horizontal>
            <div class="label-text has-text-dark">{{ $t("Mail Address") }}</div>
            <o-input placeholder="sample@archi-twin.com" class="login-input" expanded disabled
              style="background: none; border: none" v-model="sessionStore.thisUser.email"></o-input>
          </o-field>
        </div>
        <div class="">
          <div class="password-wrapper">
            <o-field horizontal>
              <div class="label-text has-text-dark">{{ $t("Password") }}</div>
              <button class="button is-primary" @click="
                emit('click-reset-password', { action: 'Send Mail for Reset Password' })
              ">
                {{ $t("Send Reset Password to the Mail") }}
              </button>
            </o-field>
          </div>
          <div>
            <button class="button is-rounded is-primary log-button" data-cy="update-user" @click="
              emit('click-update', {
                action: 'Update Profile',
                user: sessionStore.thisUser,
              })
            ">
              <span class="menu-text">{{ $t("Update") }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Stores
import { useSessionStore } from "@/stores/session";
import { useSpaceStore } from "@/stores/space";

// Components
import TheLeftSidebar from "@/components/TheLeftSidebar.vue";
import { onMounted } from "vue";
import { useRoleStore } from "@/stores/roles";

const emit = defineEmits(["click-reset-password", "click-update"]);
const sessionStore = useSessionStore();
const spaceStore = useSpaceStore()

const thisUserLocal = localStorage.getItem('thisUser')

if(thisUserLocal){
  sessionStore.thisUser = JSON.parse(thisUserLocal)
}else{
  if(sessionStore.authUser){
    sessionStore.thisUser = {...sessionStore.authUser}
  }
}

// onMounted( async() => {
//   await sessionStore.init();

//   if(sessionStore.authUser){
//     sessionStore.thisUser = {...sessionStore.authUser}
//   }

// })

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
    margin-left: calc(15%);
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
