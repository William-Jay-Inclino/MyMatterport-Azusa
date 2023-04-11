<template>
    <section>
        <o-modal data-cy="space-settings-modal" overlayClass="is-background-transparent" v-model:active="spaceStore.isCardModalActive" :width="900" clip="scroll">
            <div class="is-modal-scrollable">
                <slot name="modal_header"></slot>

                <slot name="modal_body"></slot>
                
                <slot name="modal_footer"></slot>
            </div>

        </o-modal>
    </section>
</template>

<script setup lang="ts">
import { useSpaceStore } from '@/stores/space'

defineProps(['modalWidth'])

const spaceStore = useSpaceStore()
</script>

<style>

.is-background-transparent {
    background-color: rgba(0, 0, 0, 0.023);
}
</style>