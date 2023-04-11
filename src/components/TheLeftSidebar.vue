<template>
  <div
    class="column is-hidden-mobile sidebar-wrapper">
    <div class="columns">
      <div class="column">
        <img width="150" height="30" src="/logo_archi_2.png" />
        <br>
        <span data-cy="app-version">{{ APP_VERSION.slice(0, 25) }}</span>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <img width="19" height="16" src="/account_tree.png" />
        <span class="tree-title pl-2"> {{ $t("Space Tree") }} </span>
      </div>
      <div class="column" v-if="false">
        <button @click="spaceStore.deleteAllFolders()" class="button is-white is-small">
            <o-icon pack="mdi" icon="trash-can" class="has-text-danger"> </o-icon>
        </button>
        <!-- <TempAuthUser/> -->
      </div>
    </div>

    <div class="columns space-tree-wrapper">
      <div class="column">
        <SpaceTree />
      </div>
    </div>

    <div class="columns mb-3 sidebar-bot-menu-wrapper">
      <div class="column">
        <aside class="menu">
          <ul class="menu-list">
            <li>
              <router-link :to="{ name: 'userProfile' }">
                <a href="" data-cy="profile-setting-menu">
                  <o-icon
                    pack="mdi"
                    icon="account-cog-outline"
                    class="button-icon"
                  ></o-icon>
                  <span class="menu-item-text">
                    {{ $t("Profile Setting") }}
                  </span>
                </a>
              </router-link>
            </li>
            <li v-show="sessionStore.userRole === USER_GROUP.Admin">
              <router-link :to="{ name: 'userList' }">
                <a href="" data-cy="visit-user-list">
                  <o-icon
                    pack="mdi"
                    icon="account-box-multiple-outline"
                    class="button-icon"
                  >
                  </o-icon>
                  <span class="menu-item-text"> {{ $t("User List") }} </span>
                </a>
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'userList' }">
                <o-icon pack="mdi" icon="walk" class="button-icon"> </o-icon>
                <span class="menu-item-text"> {{ $t("Activity") }} </span>
              </router-link>
            </li>
            <!-- <hr>
            <li>
              <router-link :to="{ name: 'userList' }">
                  <o-icon pack="mdi" icon="logout" class="button-icon"></o-icon>
                  <span class="menu-item-text"> Logout </span>
              </router-link>
            </li> -->
          </ul>
          <hr />
          <router-link :to="{ name: 'userLogin' }">
            <button
              class="button is-ghost"
              data-cy="logout-user"
              @click="logout()"
            >
              <o-icon pack="mdi" icon="logout" class="button-icon"></o-icon
              ><span class="menu-item-text menu-text">
                {{ $t("Logout") }}
              </span>
            </button></router-link
          >
        </aside>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

import SpaceTree from "./space/SpaceTree.vue";
import { useSessionStore } from "@/stores/session";
import { useSpaceStore } from "@/stores/space";
import { USER_GROUP } from "@/stores/types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { APP_VERSION } from "../assets/version.js";
// import { useRouter } from "vue-router";

// const router = useRouter();

const sessionStore = useSessionStore();
const spaceStore = useSpaceStore()
console.log("APP_VERSION", APP_VERSION);

// Methods
const logout = async() => {
  await sessionStore.logoutUser();
  // router.push({name: 'userLogin'});
};
</script>
