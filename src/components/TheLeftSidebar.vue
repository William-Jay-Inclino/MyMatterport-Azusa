<template>
  <div class="column is-one-quarter-tablet is-2-widescreen is-hidden-mobile sidebar-wrapper ml-2 mr-2">
    
    <div class="columns">
      <div class="column">
        <img width="150" height="30" src="/public/logo_archi_2.png" />
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <img width="19" height="16" src="/public/account_tree.png" />
        <span class="tree-title pl-2">Space Tree</span>
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
                  <o-icon pack="mdi" icon="account-cog-outline" class="button-icon"></o-icon>
                  <span class="menu-item-text"> Profile Setting </span>
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'userList' }">
                  <o-icon pack="mdi" icon="account-box-multiple-outline" class="button-icon"></o-icon>
                  <span class="menu-item-text"> User List </span>
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'userList' }">
                  <o-icon pack="mdi" icon="walk" class="button-icon"> </o-icon>
                  <span class="menu-item-text"> Activity </span>
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
            <button class="button is-ghost" @click="logout()">
              <o-icon pack="mdi" icon="logout" class="button-icon"></o-icon
              ><span class="menu-item-text menu-text"> Logout </span>
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

const sessionStore = useSessionStore();

// Methods
const logout = () => {
  sessionStore.logoutUser();
};
</script>

