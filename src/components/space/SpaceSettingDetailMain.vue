<template>
    <CommonModalView>
        <template #modal_header>
            <div class="columns">
                <div class="column is-two-thirds">
                    <h6 class="title is-6">{{ spaceStore.selectedTreeItem?.type }} Setting</h6>
                </div>
                <div class="column">
                    <h6 class="title is-6" style="text-align: right;">
                        <span class="icon">
                            <o-icon pack="mdi" icon="pencil-outline" size="normal" :class="'has-text-black'">
                            </o-icon>
                        </span>
                        {{ spaceStore.selectedTreeItem?.type }} General Setting
                    </h6>
                </div>
            </div>
            <div class="columns">
                <div class="column is-1"></div>
                <div class="column ">
                    <p class="subtitle is-6">{{ spaceStore.selectedTreeItem?.type }} Name: {{ spaceStore.selectedTreeItem?.name }}</p>
                    <p class="subtitle is-6">{{ spaceStore.selectedTreeItem?.type }} Manager: Manager Here</p>
                </div>
            </div>
        </template>
        <!-- We can insert our table components into one of the names slots -->
        <template #modal_body>
            <o-tabs v-model="activeTab" :multiline="true">
                <o-tab-item :value="0" label="Assignee Setting" data-cy="tab-assignee">
                    <template #header>
                        <o-icon pack="mdi" icon="account-cog-outline" size="normal" :class="'has-text-black'"></o-icon>
                        <span> Assignee Setting </span>
                    </template>
                    <SpaceSettingAssignee @add-assignee="spaceStore.isSpaceAddAssigneeActive = true"/>
                </o-tab-item>
            
                <o-tab-item :value="1" label="Role Setting" data-cy="tab-role">
                    <template #header>
                        <o-icon pack="mdi" icon="account-group-outline" size="normal" :class="'has-text-black'"></o-icon>
                        <span> Role Setting </span>
                    </template>
                    <SpaceSettingsRole/>
                </o-tab-item>
            
                <o-tab-item :value="2" label="Tag Category Setting" data-cy="tab-category">
                    <template #header>
                        <o-icon pack="mdi" icon="tag-outline" size="normal" :class="'has-text-black'"></o-icon>
                        <span> Tag Category Setting </span>
                    </template>
                    <SpaceSettingTag @add-category="spaceStore.isSpaceAddTagActive = true"/>
                </o-tab-item>
            </o-tabs>
        </template>
        <template #modal_footer>
            <div class="is-flex is-flex-direction-row is-justify-content-end">
                <button @click="spaceStore.isCardModalActive = false" class="button is-link is-rounded">Save</button>
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
</template>

<script setup lang="ts">
import CommonModalView from '../common/CommonModal.vue'
import SpaceSettingAssignee from './SpaceSettingAssignee.vue'
import SpaceSettingTag from './SpaceSettingTag.vue'
import SpaceSettingsRole from './SpaceSettingsRole.vue'

import { ref } from 'vue'
import { useSpaceStore } from '@/stores/space'
const spaceStore = useSpaceStore()

const activeTab = ref(0)

</script>