<template>
  <div class="columns is-vcentered pt-5">
    <div class="column is-5">
      <button
        class="button is-ghost"
        v-if="spaceStore.currentNode?.type_ !== FOLDER_TYPE.FACILITY"
      >
        <o-icon pack="mdi" icon="ab-testing" size="normal" class="button-icon"> </o-icon>
        <h1 class="title is-5 menu-item-text switcher-title">
          {{ $t("Sections and Facilities on the Section") }}
        </h1>
      </button>
      <button
        class="button is-ghost"
        v-if="spaceStore.currentNode?.type_ === FOLDER_TYPE.FACILITY"
      >
        <o-icon pack="mdi" icon="animation" size="normal" class="button-icon"> </o-icon>
        <h1 class="title is-5 menu-item-text switcher-title">
          {{ $t("Spaces on the Facility") }}
        </h1>
      </button>
    </div>
    <div class="column">
      <button
        class="button is-ghost"
        data-cy="list-view"
        @click="emit('on-switch', { tableView: TABLE_VIEW.LIST })"
      >
        <o-icon
          pack="mdi"
          icon="format-list-bulleted-square"
          size="normal"
          :class="{ 'has-text-primary': spaceStore.tableView === TABLE_VIEW.LIST }"
        >
        </o-icon>
      </button>
      <button
        class="button is-ghost"
        data-cy="card-view"
        @click="emit('on-switch', { tableView: TABLE_VIEW.CARD })"
      >
        <o-icon
          pack="mdi"
          icon="dots-grid"
          size="normal"
          :class="{ 'has-text-primary': spaceStore.tableView === TABLE_VIEW.CARD }"
        >
        </o-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSpaceStore } from "@/stores/space";
import { TABLE_VIEW } from "@/stores/types";
import { FOLDER_TYPE } from "@/stores/types";

const spaceStore = useSpaceStore();

const emit = defineEmits(["on-switch"]);
</script>
