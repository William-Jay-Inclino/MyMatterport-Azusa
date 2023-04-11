<template>
    <CommonModalView>
        <template #modal_header>
            <div class="columns">
                <div class="column is-two-thirds">
                    <h6 class="title is-6">{{ $t(`${spaceStore.spaceUnitEditLabel} Setting`) }}</h6>
                </div>
                <div class="column">
                    <!-- <h6 class="title is-6" style="text-align: right;">
                        <span class="icon">
                            <o-icon pack="mdi" icon="pencil-outline" size="normal" :class="'has-text-black'">
                            </o-icon>
                        </span>
                        {{ $t(`${spaceStore.spaceUnitLabel} Manager Setting`) }}
                    </h6> -->
                    <button
                        class="button is-ghost has-text-centered has-text-dark"
                        @click="emit('edit-node', { action: ACTION_BAR.EDIT_SECTION })"
                        v-show="spaceStore.currentNode?.type_ === FOLDER_TYPE.SECTION"
                        
                        >
                    <span class="icon">
                        <o-icon pack="mdi" icon="pencil-outline" size="normal" :class="'has-text-black'">
                        </o-icon>
                    </span>
                    <span class="title is-6">{{ $t(`${spaceStore.spaceUnitEditLabel} Manager Setting`) }}</span>
                    </button>

                    <button
                        class="button is-ghost has-text-centered has-text-dark"
                        @click="emit('edit-node', { action: ACTION_BAR.EDIT_FACILITY })"
                        v-show="spaceStore.currentNode?.type_ === FOLDER_TYPE.FACILITY"
                        
                        >
                    <span class="icon">
                        <o-icon pack="mdi" icon="pencil-outline" size="normal" :class="'has-text-black'">
                        </o-icon>
                    </span>
                    <span class="title is-6">{{ $t(`${spaceStore.spaceUnitEditLabel} Manager Setting`) }}</span>
                    </button>
                </div>
            </div>
            <div class="columns">
                <div class="column is-1"></div>
                <div class="column ">
                    <p class="subtitle is-6">{{ $t(`${spaceStore.spaceUnitEditLabel} name`) }}: {{ spaceStore.currentNode?.name }}</p>
                    <p class="subtitle is-6">{{ $t(`${spaceStore.spaceUnitEditLabel} Manager`) }}: Manager Here</p>
                </div>
            </div>
        </template>
        <!-- We can insert our table components into one of the names slots -->
        <template #modal_body>
            <o-tabs v-model="activeTab" :multiline="true">
                <o-tab-item :value="0" label="Assignee Setting">
                    <template #header>
                        <o-icon pack="mdi" icon="account-cog-outline" size="normal" :class="'has-text-black'"></o-icon>
                        <span data-cy="tab-assignee"> {{ $t('Assignee Setting') }}</span>
                    </template>
                    <SpaceSettingAssignee @add-assignee="spaceStore.isSpaceAddAssigneeActive = true"/>
                </o-tab-item>
            
                <o-tab-item :value="1" label="Role Setting">
                    <template #header>
                        <o-icon pack="mdi" icon="account-group-outline" size="normal" :class="'has-text-black'"></o-icon>
                        <span data-cy="tab-role">{{ $t('Role Setting') }}</span>
                    </template>
                    <SpaceSettingsRole/>
                </o-tab-item>
            
                <o-tab-item :value="2" label="Tag Category Setting">
                    <template #header>
                        <o-icon pack="mdi" icon="tag-outline" size="normal" :class="'has-text-black'"></o-icon>
                        <span data-cy="tab-tagcategory"> {{ $t('Tag Category Setting') }} </span>
                    </template>
                    <SpaceSettingTag @add-category="spaceStore.isSpaceAddTagActive = true"/>
                </o-tab-item>
            </o-tabs>
        </template>
        <template #modal_footer>
            <div class="is-flex is-flex-direction-row is-justify-content-end">
                <button @click="spaceStore.isCardModalActive = false" class="button is-link is-rounded" data-cy="space-setting-main-modal">{{ $t('Save') }}</button>
            </div>
            <!-- <div class="columns">
                <div class="column">
                </div>
                <div class="column is-two-thirds"></div>
                <div class="column" style="text-align:right;">
                    <button @click="spaceStore.isCardModalActive = false" class="button is-link is-rounded">Save</button>
                </div>
            </div> -->
    </template>
  </CommonModalView>
  <SpaceUnitModalView v-if="spaceStore.isEditingSpaceNode === true"/>
</template>

<script setup lang="ts">
import CommonModalView from "../common/CommonModal.vue";
import SpaceSettingAssignee from "./SpaceSettingAssignee.vue";
import SpaceSettingTag from "./SpaceSettingTag.vue";
import SpaceSettingsRole from "./SpaceSettingsRole.vue";
import SpaceUnitModalView from "@/views/SpaceUnitModalView.vue";

import { ref } from "vue";
import { useSpaceStore } from "@/stores/space";
import { ACTION_BAR, FOLDER_TYPE } from "@/stores/types";

const spaceStore = useSpaceStore();
const emit = defineEmits(['edit-node'])

const activeTab = ref(0);
</script>
