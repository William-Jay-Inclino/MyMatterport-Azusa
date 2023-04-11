<template>
    <div>
        <iframe id="mp-iframe" style="height: 100vh; width: 100%" ref="showcase" height="480"
            :src="`/bundle/showcase.html?m=${publicSpaceStore.modelSid}&applicationKey=${publicSpaceStore.appKey}&play=1&newtags=1`"
            frameborder=”0” allow="xr-spatial-tracking" allowfullscreen>
        </iframe>
    </div>
</template>

<script setup lang="ts">

import { usePublicSpace } from '@/stores/spacePublic';
import type { ShowcaseBundleWindow } from 'public/bundle/sdk';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const publicSpaceStore = usePublicSpace()
const showcase = ref<HTMLIFrameElement>()

onMounted( async() => {

    if (!showcase.value) {
        console.log('Showcase is undefined')
        return
    }

    if (!showcase.value.contentWindow) {
        console.log('Showcase/Iframe Content Window is undefined')
        return
    }

    const urlParams = route.params 
    console.log('urlParams', urlParams)

    if(!urlParams['uuid']){
        console.error('Space ID is undefined; Check the URL')
        return 
    }

    const space = await publicSpaceStore.getSpace(urlParams['uuid'] as string)
    console.log('space', space)

    if(!space){
        router.push({name: 'error404'})
        return 
    }

    publicSpaceStore.setSpace(space)

    const showcaseWindow = showcase.value.contentWindow as ShowcaseBundleWindow

    showcase.value.addEventListener("load", async () => {
        try {
            await showcaseWindow.MP_SDK.connect(showcaseWindow, publicSpaceStore.appKey).then(publicSpaceStore.onShowcaseConnect)
            console.log('=====MP SDK LOADED=====')

        } catch (e) {
            console.log('Error in MPSDK', e)
            return
        }

    })

})

</script>
