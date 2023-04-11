<template>
    <section>
        <o-modal data-cy="common-alert-modal" v-model:active="spaceStore.isAlertModalActive">
            <div class="is-modal-scrollable" style="min-width: max-content;">
                <h6 class="title is-6">{{ spaceStore.spaceAlertModalDetail?.message }}</h6>
                <div class="is-flex is-flex-direction-row is-justify-content-space-between">
                    <o-button @click="spaceStore.isAlertModalActive = false" variant="primary" inverted rounded>{{ $t('Cancel') }}</o-button>
                    <o-button @click="spaceStore.spaceAlertModalDetail?.action" v-show="spaceStore.spaceAlertModalDetail.can_confirm" :variant="spaceStore.spaceAlertModalDetail.theme"  rounded>{{ $t('Confirm') }}</o-button>
                </div>
            </div>
        </o-modal>
    </section>
</template>

<script setup lang="ts">
import { useSpaceStore } from '@/stores/space'
import { THEME } from '@/stores/types'


const spaceStore = useSpaceStore()
</script>