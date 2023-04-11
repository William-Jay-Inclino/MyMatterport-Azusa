<template>
     <div class="base-layer">
        <iframe id="mp-iframe" style="height: 100vh; width: 100%" ref="showcase" height="480"
            :src="`/bundle/showcase.html?m=${spaceStore.modelSid}&applicationKey=${mpStore.appKey}&play=1&newtags=1`"
            frameborder=”0” allow="xr-spatial-tracking" allowfullscreen>
        </iframe>
        <div class="matterport-sidebar" :style="{ width: sidebarWidth }">
            <div v-show="open === true" style="max-width:290px;">
                <Space3dTagList v-show="mpStore.sidebarView === SPACE3D_SIDEBAR_VIEW.LIST" @open-toast="toast"/>
                <Space3dTagForm v-show="mpStore.sidebarView === SPACE3D_SIDEBAR_VIEW.FORM"/>
                <div class="columns">
                    <div class="column" v-show="mpStore.sidebarView === SPACE3D_SIDEBAR_VIEW.FORM">
                        <div data-cy="cancel-tag-btn" class="button is-rounded is-small bg-transparent" @click="mpStore.revertUpdates()">
                            <span>{{ $t('Cancel') }}</span>
                        </div>
                    </div>
                    <div class="column is-3"></div>
                    <div class="column" v-show="mpStore.sidebarView === SPACE3D_SIDEBAR_VIEW.LIST">
                        <div class="is-flex is-flex-direction-row is-justify-content-space-between">
                            <div></div>
                            <div data-cy="add-tag-btn" class="button is-rounded is-small bg-transparent" @click="mpStore.initTagData()">
                                <span>{{ $t('Add Tag') }}</span>
                                <o-icon pack="mdi" icon="plus" size="small" class="is-clickable">
                                </o-icon>
                            </div>
                            <div v-if="false" class="button is-rounded is-small bg-transparent" @click="mpStore.deleteAllTags()">
                                <span>Clear</span>
                                <o-icon pack="mdi" icon="trash-can" size="small" class="is-clickable">
                                </o-icon>
                            </div>
                        </div>
                    </div>
                    <div class="column" v-show="mpStore.sidebarView === SPACE3D_SIDEBAR_VIEW.FORM">
                        <button data-cy="add-tag-form-btn" :disabled="mpStore.isSaving" @click="emit('save-tag')" v-show="mpStore.isAddingTag"
                            class="button is-rounded is-small bg-transparent">
                            <span>{{ mpStore.isSaving ? 'Adding...' : $t('Add') }}</span>
                        </button>
                        <button data-cy="update-tag-form-btn" :disabled="mpStore.isSaving" v-show="!mpStore.isAddingTag" @click="emit('save-tag')"
                            class="button is-rounded is-small bg-transparent">
                            <span> {{ mpStore.isSaving ? 'Updating...' : $t('Update') }}</span>
                        </button>
                    </div>
                </div>
            </div>
            <div style="border-left: solid rgba(233, 226, 226, 0.404) 1px;padding-left: 10px;padding-top: 10px;"
                class="content-centered">
                <button data-cy="sidebar-toggle-btn" class="transparent-icon-button" @click="handleOpen">
                    <o-icon pack="mdi" icon="bullseye" size="normal"></o-icon>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useMpStore } from '@/stores/mp'
import { useSpaceStore } from '@/stores/space'
// import { useActivityStore } from '@/stores/activity'
import { SPACE3D_SIDEBAR_VIEW } from '@/stores/types'
//@ts-ignore
import { createToaster } from "@meforma/vue-toaster" //ignore linting error

import { onMounted, ref } from 'vue';
import type { ShowcaseBundleWindow } from '../../../public/bundle/sdk'

import Space3dTagList from './Space3dTagList.vue'
import Space3dTagForm from './Space3dTagForm.vue'

const mpStore = useMpStore()
const spaceStore = useSpaceStore()
const showcase = ref<HTMLIFrameElement>()
// const activityStore = useActivityStore()

// activityStore.getActivities()
// if(spaceStore.currentNode){
//     activityStore.getActivitiesBySpaceId(spaceStore.currentNode)
// }

const emit = defineEmits(['save-tag'])

const toaster = createToaster({ 
    position: "bottom-left",
});

const toast = () => {
    toaster.info(`Direct link copied succesfully`)
    console.log('Display toast triggered')
}

const open = ref(false)
const sidebarWidth = ref("60px")

const handleOpen = () => {
    open.value = !open.value
    open.value !== true ? sidebarWidth.value = "60px" : sidebarWidth.value = "300px"
}

onMounted(() => {
    if (!showcase.value) {
        console.log('Showcase is undefined')
        return
    }

    if (!showcase.value.contentWindow) {
        console.log('Showcase/Iframe Content Window is undefined')
        return
    }

    const showcaseWindow = showcase.value.contentWindow as ShowcaseBundleWindow

    showcase.value.addEventListener("load", async () => {
        try {
            await showcaseWindow.MP_SDK.connect(showcaseWindow, mpStore.appKey).then(mpStore.onShowcaseConnect)
            console.log('=====MP SDK LOADED=====')
            handleOpen()
        } catch (e) {
            console.log('Error in MPSDK', e)
            return
        }

    })

})

</script>