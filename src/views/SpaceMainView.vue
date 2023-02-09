<template>
<o-tabs v-model="activeTab" :multiline="true">
    <o-tab-item :value="0" label="Assignee Setting">
        <template #header>
            <o-icon pack="mdi" icon="monitor-eye" size="normal" :class="'has-text-black'"></o-icon>
            <span> Space View </span>
        </template>
        <figure class="image is-3x2">
            <img src="/matterportscreenshot.jpg">
        </figure>
    </o-tab-item>

    <o-tab-item :value="1" label="Assignee Setting">
        <template #header>
            <o-icon pack="mdi" icon="account-cog-outline" size="normal" :class="'has-text-black'"></o-icon>
            <span> Assignee Setting </span>
        </template>
        <div class="box">
            <SpaceSettingAssignee @add-assignee="spaceStore.isSpaceAddAssigneeActive = true"/>
        </div>
    </o-tab-item>

    <o-tab-item :value="2" label="Role Setting">
        <template #header>
            <o-icon pack="mdi" icon="account-group-outline" size="normal" :class="'has-text-black'"></o-icon>
            <span> Role Setting </span>
        </template>
        
    </o-tab-item>

    <o-tab-item :value="3" label="Tag Category Setting">
        <template #header>
            <o-icon pack="mdi" icon="tag-outline" size="normal" :class="'has-text-black'"></o-icon>
            <span> Tag Category Setting </span>
        </template>
        
    </o-tab-item>
</o-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSpaceStore } from '@/stores/space'
import SpaceSettingAssignee from '../components/space/SpaceSettingAssignee.vue';
const spaceStore = useSpaceStore()


const activeTab = ref(0)
</script>