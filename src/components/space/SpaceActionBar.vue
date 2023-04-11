<template>
  <div class="columns">
    <div class="column is-hidden-tablet">
      <o-button
        variant="primary"
        pack="mdi"
        icon-right="forwardburger"
        inverted
        @click="spaceStore.isMobileSidebarActive = true"
      />
      <!-- <button class="button" @click="spaceStore.isMobileSidebarActive = true">
        <o-icon pack="mdi" icon="forwardburger" size="medium" class="button-icon">
        </o-icon>
      </button> -->
    </div>

    <div class="column is-5">
      <h3 class="title is-3" data-cy="space-title">
        <o-icon pack="mdi" icon="layers-outline" size="large" class="button-icon">
        </o-icon>
        <span>{{ spaceStore.currentNode?.name }}</span>
      </h3>
    </div>

    <div class="column is-6">
      <div class="is-pulled-right" data-cy="action-bar-buttons">
        <button
          class="button is-ghost has-text-centered has-text-dark"
          @click="emit('button-click', { action: ACTION_BAR.ADD_FACILITY, space_unit_type: FOLDER_TYPE.FACILITY })"
          v-show="spaceStore.currentNode?.type_ === FOLDER_TYPE.SECTION"
        >
          <span class="icon">
            <o-icon pack="mdi" icon="animation" size="normal" class="button-icon">
            </o-icon>
          </span>
          <span class="action-text" data-cy="add-facility-btn">{{
            $t("Add Facility")
          }}</span>
        </button>
        <button
          class="button is-ghost has-text-centered has-text-dark"
          @click="emit('button-click', { action: ACTION_BAR.ADD_SECTION, space_unit_type: FOLDER_TYPE.SECTION })"
          v-show="spaceStore.currentNode?.type_ === FOLDER_TYPE.ROOT || spaceStore.currentNode?.type_ === FOLDER_TYPE.SECTION"
        >
          <span class="icon">
            <o-icon pack="mdi" icon="animation" size="normal" class="button-icon">
            </o-icon>
          </span>
          <span class="action-text" data-cy="add-section-btn">{{
            $t("Add Section")
          }}</span>
        </button>
        <button
          class="button is-ghost has-text-centered has-text-dark"
          @click="emit('button-click', { action: ACTION_BAR.ADD_SPACE, space_unit_type: FOLDER_TYPE.SPACE })"
          v-show="spaceStore.currentNode?.type_ === FOLDER_TYPE.FACILITY"
        >
          <span class="icon">
            <o-icon pack="mdi" icon="animation" size="normal" class="button-icon">
            </o-icon>
          </span>
          <span class="action-text" data-cy="add-space-btn">{{ $t("Add Space") }}</span>
        </button>
        <button 
          class="button is-ghost has-text-centered has-text-dark"
          @click="emit('button-click', { action: ACTION_BAR.EDIT_SPACE })"
          v-show="spaceStore.currentNode?.type_ === FOLDER_TYPE.SPACE">
          <span class="icon">
            <o-icon pack="mdi" icon="domain" size="normal" class="button-icon">
            </o-icon>
          </span>
          <span class="action-text" data-cy="current-space-setting">{{ $t("Current Space Setting") }}</span>
        </button>
        <button
          class="button is-ghost has-text-centered has-text-dark"
          @click="emit('button-click', { action: ACTION_BAR.SECTION_SETTING })"
          v-show="spaceStore.currentNode?.type_ === FOLDER_TYPE.SECTION"
          data-cy="section-setting-btn"
        >
          <span class="icon">
            <o-icon pack="mdi" icon="animation" size="normal" class="button-icon">
            </o-icon>
          </span>
          <span class="action-text">{{ $t("Current Section Setting") }}</span>
        </button>
        <button
          class="button is-ghost has-text-centered has-text-dark"
          @click="emit('button-click', { action: ACTION_BAR.FACILITY_SETTING })"
          v-show="spaceStore.currentNode?.type_ === FOLDER_TYPE.FACILITY"
          data-cy="facility-setting-btn"
        >
          <span class="icon">
            <o-icon pack="mdi" icon="animation" size="normal" class="button-icon">
            </o-icon>
          </span>
          <span class="action-text">{{ $t("Current Facility Setting")  }}</span>
        </button>
      </div>
        <router-link :to="{ name: 'space3d' }">
          <button 
            class="button is-link is-rounded"
            v-show="spaceStore.currentNode?.type_ === FOLDER_TYPE.SPACE"
            data-cy="enter-space-btn">
            <span>{{ $t("Enter the Space") }}</span>
            <span class="icon">
              <o-icon pack="mdi" icon="login" size="normal">
              </o-icon>
            </span>
          </button>
        </router-link>
      </div>
    </div>
</template>

<script setup lang="ts">
import { useSpaceStore } from "@/stores/space";
import { FOLDER_TYPE, ACTION_BAR, USER_GROUP } from "@/stores/types";
import { useSessionStore } from "@/stores/session";
const emit = defineEmits(["button-click"]);

const spaceStore = useSpaceStore();
const sessionStore = useSessionStore()
</script>
