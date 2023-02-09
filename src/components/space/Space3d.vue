<template>
     <div class="base-layer">
        <iframe style="height: 100vh; width: 100%" ref="showcase" height="480"
            :src="`/bundle/showcase.html?m=${spaceStore.modelSid}&applicationKey=${mpStore.appKey}&play=1&newtags=1`"
            frameborder=”0” allow="xr-spatial-tracking" allowfullscreen>
        </iframe>
        <div class="matterport-sidebar" :style="{ width: sidebarWidth }">
            <div v-show="open === true" style="max-width:290px;">
                <Space3dTagList v-if="mpStore.sidebarView === SPACE3D_SIDEBAR_VIEW.LIST" @open-toast="toast"/>
                <Space3dTagForm v-else="mpStore.sidebarView === SPACE3D_SIDEBAR_VIEW.FORM"/>
                <div class="columns">
                    <div class="column" v-if="mpStore.sidebarView === SPACE3D_SIDEBAR_VIEW.FORM">
                        <div class="button is-rounded is-small bg-transparent" @click="mpStore.revertUpdates()">
                            <span>Cancel</span>
                        </div>
                    </div>
                    <div class="column is-3"></div>
                    <div class="column" v-if="mpStore.sidebarView === SPACE3D_SIDEBAR_VIEW.LIST">
                        <div class="is-flex is-flex-direction-row is-justify-content-space-between">
                            <div></div>
                            <div class="button is-rounded is-small bg-transparent" @click="mpStore.initTagData()">
                                <span>Add Tag</span>
                                <o-icon pack="mdi" icon="plus" size="small" class="is-clickable">
                                </o-icon>
                            </div>
                        </div>
                    </div>
                    <div class="column" v-if="mpStore.sidebarView === SPACE3D_SIDEBAR_VIEW.FORM">
                        <button :disabled="mpStore.isSaving" @click="emit('save-tag')" v-if="mpStore.isAddingTag"
                            class="button is-rounded is-small bg-transparent">
                            <span>{{ mpStore.isSaving ? 'Adding...' : 'Add' }}</span>
                        </button>
                        <button :disabled="mpStore.isSaving" v-else="mpStore.isAddingTag" @click="emit('save-tag')"
                            class="button is-rounded is-small bg-transparent">
                            <span> {{ mpStore.isSaving ? 'Updating...' : 'Update' }}</span>
                        </button>
                    </div>
                </div>
            </div>
            <div style="border-left: solid rgba(233, 226, 226, 0.404) 1px;padding-left: 10px;padding-top: 10px;"
                class="content-centered">
                <button class="transparent-icon-button" @click="handleOpen">
                    <o-icon pack="mdi" icon="bullseye" size="normal"></o-icon>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useMpStore } from '@/stores/mp'
import { useSpaceStore } from '@/stores/space'
import { SPACE3D_SIDEBAR_VIEW } from '@/stores/types'
//@ts-ignore
import { createToaster } from "@meforma/vue-toaster"; //ignore linting error

import { onMounted, ref } from 'vue';
import type { ShowcaseBundleWindow } from '../../../public/bundle/sdk'

//@ts-ignore
import Space3dTagList from './TagList.vue'
import Space3dTagForm from './TagForm.vue';

const mpStore = useMpStore()
const spaceStore = useSpaceStore()
const showcase = ref<HTMLIFrameElement>()

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

const onSaveTag = () => mpStore.onSaveTag()

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

        } catch (e) {
            console.log('Error in MPSDK', e)
            return
        }

    })

})

</script>