<template>
    <!-- <div class="base-layer">
        <iframe 
            style="height: 100vh; width: 100%"
            ref="showcase"
            height="480" 
            :src="`/bundle/showcase.html?m=${spaceStore.modelSid}&applicationKey=${mpStore.appKey}&play=1&newtags=1`" 
            frameborder=”0” 
            allow="xr-spatial-tracking"
            allowfullscreen
            >
        </iframe>
        <Space3DTable/>
    </div> -->
    <div class="columns">
        <div :class="{'column is-12': mpStore.isRelocating, 'column is-9': !mpStore.isRelocating}">
            <iframe 
                style="height: 100vh; width: 100%"
                ref="showcase"
                height="480" 
                :src="`/bundle/showcase.html?m=${spaceStore.modelSid}&applicationKey=${mpStore.appKey}&play=1&newtags=1`" 
                frameborder=”0” 
                allow="xr-spatial-tracking"
                allowfullscreen
            >
            </iframe>
        </div>
        <div class="column is-3" v-show="!mpStore.isRelocating">
            <div class="container is-fluid">
                <div class="columns" style="height: 80vh; overflow-y: auto">
                    <div class="column">
                        <Space3dTagList v-show="mpStore.sidebarView === SPACE3D_SIDEBAR_VIEW.LIST"/>
                        <Space3dTagForm v-show="mpStore.sidebarView === SPACE3D_SIDEBAR_VIEW.FORM"/>
                    </div>
                </div>
    
                <div v-if="mpStore.sidebarView === SPACE3D_SIDEBAR_VIEW.LIST" class="columns pt-3">
                    <div class="column">
                        <button @click="mpStore.initTagData()" class="button is-primary">
                            Add Tag
                        </button>
                    </div>
                </div>

                <div v-else class="columns pt-3">
                    <div class="column">
                        <button @click="mpStore.clearTagData()" class="button is-primary">
                            Cancel
                        </button>
                    </div>
                    <div class="column">
                        <button :disabled="mpStore.isSaving" @click="emit('save-tag')" v-if="mpStore.isAddingTag" class="button is-primary">
                            {{ mpStore.isSaving ? 'Adding...' : 'Add' }}
                        </button>
                        <button :disabled="mpStore.isSaving" v-else class="button is-primary" @click="emit('save-tag')">
                            {{ mpStore.isSaving ? 'Updating...' : 'Update' }}
                        </button>
                    </div>
                </div>
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
// import Space3DTable from './Space3DTable.vue';

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

onMounted( ()=> {
    if(!showcase.value){
        console.log('Showcase is undefined')
        return 
    }

    if(!showcase.value.contentWindow){
        console.log('Showcase/Iframe Content Window is undefined')
        return 
    }

    const showcaseWindow = showcase.value.contentWindow as ShowcaseBundleWindow

    showcase.value.addEventListener("load", async() => {
        try {
            await showcaseWindow.MP_SDK.connect(showcaseWindow, mpStore.appKey).then(mpStore.onShowcaseConnect)
            console.log('=====MP SDK LOADED=====')

        } catch (e) {
            console.log('Error in MPSDK', e)
            return 
        }

    })
    
} )

</script>