<template>
<o-tabs v-model="activeTab" :multiline="true">
    <o-tab-item :value="0" label="Assignee Setting">
        <template #header>
            <o-icon pack="mdi" icon="monitor-eye" size="normal" :class="'has-text-black'"></o-icon>
            <span> {{ $t('Space View') }} </span>
        </template>
        <router-link :to="{ name: 'space3d' }">
            <SpaceShowcase/>
        </router-link>
    </o-tab-item>

    <o-tab-item :value="1" label="Assignee Setting">
        <template #header>
            <o-icon pack="mdi" icon="account-cog-outline" size="normal" :class="'has-text-black'"></o-icon>
            <span data-cy="space-tab-assignee"> {{ $t('Assignee Setting') }} </span>
        </template>
        <div class="box">
            <SpaceSettingAssignee @add-assignee="spaceStore.isSpaceAddAssigneeActive = true"/>
        </div>
    </o-tab-item>

    <o-tab-item :value="2" label="Role Setting">
        <template #header>
            <o-icon pack="mdi" icon="account-group-outline" size="normal" :class="'has-text-black'"></o-icon>
            <span data-cy="space-tab-role"> {{ $t('Role Setting') }} </span>
        </template>
        <div class="box" >
            <SpaceSettingsRole/>
        </div>
    </o-tab-item>

    <o-tab-item :value="3" label="Tag Category Setting">
        <template #header>
            <o-icon pack="mdi" icon="tag-outline" size="normal" :class="'has-text-black'"></o-icon>
            <span data-cy="space-tab-tagcategory"> {{ $t('Tag Category Setting') }} </span>
        </template>
        <div class="box">
            <SpaceSettingTag/>
        </div>
    </o-tab-item>
</o-tabs>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSpaceStore } from '@/stores/space'
import SpaceSettingAssignee from '../components/space/SpaceSettingAssignee.vue'
import SpaceSettingsRole from '@/components/space/SpaceSettingsRole.vue'
import SpaceSettingTag from '@/components/space/SpaceSettingTag.vue'
import SpaceShowcase from '@/components/space/SpaceShowcase.vue'
import CommonModalVue from '@/components/common/CommonModal.vue'
const spaceStore = useSpaceStore()


const activeTab = ref(0)
</script>