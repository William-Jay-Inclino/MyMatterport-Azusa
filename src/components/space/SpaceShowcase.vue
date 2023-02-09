<template>

    <iframe 
        style="height: 60vh; width: 100%"
        ref="showcase"
        height="480" 
        :src="`/bundle/showcase.html?m=${spaceStore.modelSid}&applicationKey=${spaceStore.appKey}&play=1&newtags=1`" 
        frameborder=”0” 
        allow="xr-spatial-tracking"
        allowfullscreen
    >
    </iframe>

</template>

<script setup lang="ts">

import { useSpaceStore } from '@/stores/space'
import { onMounted, ref } from 'vue';
import type { MpSdk, ShowcaseBundleWindow } from '../../../public/bundle/sdk'

const spaceStore = useSpaceStore()
const showcase = ref<HTMLIFrameElement>()

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
        let mpSdk: MpSdk
        try {
            mpSdk = await showcaseWindow.MP_SDK.connect(showcaseWindow, spaceStore.appKey)
            
            mpSdk.Tag.data.subscribe({
                onAdded: async(index, item, collection) => {
                    console.log('remove', item)
                    await mpSdk.Tag.remove(item.id)
                }
            })

            console.log('=====MP SDK LOADED=====')

        } catch (e) {
            console.log('Error in MPSDK', e)
            return 
        }

    })
} )

</script>