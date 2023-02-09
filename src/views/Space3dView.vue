<template>
    <div>
        <div v-if="allowAccess">
            <Space3d @save-tag="onSaveTag"/>
        </div>
        <div v-else>
            <div class="has-text-centered pt-6">
                <h1 class="title is-1">UNAUTHORIZE PAGE</h1>
            </div>
            <div class="has-text-centered">
                <button @click="$router.push({'name': 'spaceList'})" class="button is-primary is-light"> Go to Space List </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Space3d from '@/components/space/Space3d.vue';
import { useSpaceStore } from '@/stores/space'
import { useMpStore } from '@/stores/mp'
import { useSessionStore } from '@/stores/session'
import { computed } from 'vue';

const spaceStore = useSpaceStore()
const mpStore = useMpStore()
const sessionStore = useSessionStore()

sessionStore.init()

const allowAccess = computed( () => !!spaceStore.selectedTreeItem)

const onSaveTag = () => mpStore.onSaveTag()

</script>
