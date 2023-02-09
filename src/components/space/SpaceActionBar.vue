<template>
  <div class="columns">
    <div class="column is-hidden-tablet">
      <o-button variant="primary" pack="mdi" icon-right="forwardburger" inverted @click="spaceStore.isMobileSidebarActive = true"/>
      <!-- <button class="button" @click="spaceStore.isMobileSidebarActive = true">
        <o-icon pack="mdi" icon="forwardburger" size="medium" class="button-icon">
        </o-icon>
      </button> -->
    </div>

    <div class="column is-5">
      <h3 class="title is-3">
        <o-icon pack="mdi" icon="layers-outline" size="large" class="button-icon">
        </o-icon>
        <span>{{ spaceStore.selectedTreeItem?.name }}</span>
      </h3>
    </div>

    <div class="column is-6">
      <div class="is-pulled-right">
        <button
          class="button is-ghost has-text-centered has-text-dark"
          @click="emit('button-click', { action: ACTION_BAR.ADD_FACILITY, space_unit_type: SPACE_UNIT_TYPE.FACILITY })"
          v-show="spaceStore.selectedTreeItem?.type === SPACE_UNIT_TYPE.SECTION"
        >
          <span class="icon">
            <o-icon pack="mdi" icon="animation" size="normal" class="button-icon">
            </o-icon>
          </span>
          <span class="action-text" data-cy="add-facility-btn">Add Facility</span>
        </button>
        <button
          class="button is-ghost has-text-centered has-text-dark"
          @click="emit('button-click', { action: ACTION_BAR.ADD_SECTION, space_unit_type: SPACE_UNIT_TYPE.SECTION })"
          v-show="spaceStore.selectedTreeItem?.type === SPACE_UNIT_TYPE.ROOT || spaceStore.selectedTreeItem?.type === SPACE_UNIT_TYPE.SECTION"
        >
          <span class="icon">
            <o-icon pack="mdi" icon="animation" size="normal" class="button-icon">
            </o-icon>
          </span>
          <span class="action-text" data-cy="add-section-btn">Add Section</span>
        </button>
        <button
          class="button is-ghost has-text-centered has-text-dark"
          @click="emit('button-click', { action: ACTION_BAR.ADD_SPACE, space_unit_type: SPACE_UNIT_TYPE.SPACE })"
          v-show="spaceStore.selectedTreeItem?.type === SPACE_UNIT_TYPE.FACILITY"
        >
          <span class="icon">
            <o-icon pack="mdi" icon="animation" size="normal" class="button-icon">
            </o-icon>
          </span>
          <span class="action-text" data-cy="add-space-btn">Add Space</span>
        </button>
        <button
          class="button is-ghost has-text-centered has-text-dark"
          @click="emit('button-click', { action: ACTION_BAR.SECTION_SETTING })"
          v-show="spaceStore.selectedTreeItem?.type === SPACE_UNIT_TYPE.SECTION"
          data-cy="section-setting-btn"
        >
          <span class="icon">
            <o-icon pack="mdi" icon="animation" size="normal" class="button-icon">
            </o-icon>
          </span>
          <span class="action-text">Current Section Setting</span>
        </button>
        <button
          class="button is-ghost has-text-centered has-text-dark"
          @click="emit('button-click', { action: ACTION_BAR.FACILITY_SETTING })"
          v-show="spaceStore.selectedTreeItem?.type === SPACE_UNIT_TYPE.FACILITY"
          data-cy="facility-setting-btn"
        >
          <span class="icon">
            <o-icon pack="mdi" icon="animation" size="normal" class="button-icon">
            </o-icon>
          </span>
          <span class="action-text">Current Facility Setting</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSpaceStore } from "@/stores/space";
import { SPACE_UNIT_TYPE, ACTION_BAR } from "@/stores/types";
const emit = defineEmits(["button-click"]);

const spaceStore = useSpaceStore()

</script>

