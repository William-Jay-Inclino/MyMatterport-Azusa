<template>
  <div class="columns is-full">
    <div class="">
      <div class="login-wrapper">
        <div class="logo-container m-auto">
          <img width="299" height="60" class="login-logo" src="/logo_archi_2.png" />
        </div>
        <div class="column is-block-absolute">
          <div class="column mail-wrapper">
            <o-field horizontal>
              <div class="label-text has-text-dark">{{ $t("Mail Address") }}</div>
              <o-input v-model="userStore.userInfo.email" type="email" placeholder="sample@archi-twin.com"
                class="login-input" data-cy="login-input" expanded></o-input>
            </o-field>
          </div>
          <div class="column password-wrapper">
            <o-field horizontal>
              <div class="label-text has-text-dark">{{ $t("Password") }}</div>
              <o-input v-model="userStore.userInfo.password" type="password" :placeholder="$t('Password')" class="login-input"
                data-cy="password-input" expanded password-reveal></o-input>
            </o-field>
          </div>
          <div class="column has-text-centered is-block-absolute">
            <span class="has-text-weight-medium has-text-danger error-message">
              {{ sessionStore.authErrorMessage }}
            </span>
          </div>
          <div>
            <button class="button is-rounded is-primary log-button" data-cy="login-button"
              @click="emit('login-user', { user: userStore.userInfo })">
              <span class="menu-text">{{ $t("Login") }}</span>
              <o-icon pack="mdi" icon="login" size="small" class="button-icon has-text-white">
              </o-icon>
            </button>
          </div>
        </div>
        <div class="column help-text-wrapper">
          <span class="help-text">{{
            $t(
              "If you have forgotten your account information, please click here 言語を変更したい場合は、ここをクリックしてください (JP) Powered by Architwin"
            )
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Stores
import UserForm from "@/components/user/UserForm.vue";
import { useSessionStore } from "@/stores/session";
import { useUserStore } from "@/stores/user";

const sessionStore = useSessionStore();
const userStore = useUserStore();

// for Testing Purpose only, please remove when Live Data is available
userStore.getUsers()

const emit = defineEmits(["login-user"]);
</script>

<style scoped>
.log-button {
  width: 105px;
}

.button-icon {
  margin-top: 0px !important;
}
</style>
