<template>
    <section>
        <o-modal data-cy="space-unit-modal" v-model:active="spaceStore.isSpaceUnitModalActive" :width="900" clip="scroll">
            <div class="is-modal-scrollable">
                <div class="columns">
                    <div class="column is-two-thirds">
                        <h6 class="title is-6" data-cy="add-label-text">Add {{ spaceStore.spaceUnitForm.type }}</h6>
                    </div>
                </div>

                <div class="columns ml-6">
                    <div class="column">
                        <SpaceUnitDetail/>
                    </div>
                </div>

                <div class="columns ml-6">
                    <div class="column">
                        <SpaceUnitAddUsers/>
                    </div>
                </div> 

                <div class="columns">
                    <div class="column">
                        <SpaceUnitUsers/>
                    </div>
                </div>
                
                <div class="columns is-vcentered">
                    <div class="column">
                        <button @click="spaceStore.isSpaceUnitModalActive = false" class="button is-light is-rounded">Cancel</button>
                    </div>
                    <div class="column is-8">
                        <p class="has-text-centered has-text-grey is-size-7">
                            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex eacommodo 
                        </p>
                    </div>
                    <div class="column">
                        <button data-cy="save-btn" @click="onSave" class="button is-link is-rounded is-pulled-right">Save</button>
                    </div>
                </div>
            </div>

        </o-modal>
    </section>
</template>

<script setup lang="ts">

// Components
import SpaceUnitDetail from '@/components/space/SpaceUnitDetail.vue'
import SpaceUnitAddUsers from '@/components/space/SpaceUnitAddUsers.vue'
import SpaceUnitUsers from '@/components/space/SpaceUnitUsers.vue';
// ----------

// Stores
import { useSpaceStore } from '@/stores/space'
// ----------


// data
const spaceStore = useSpaceStore()
// ----------

// handlers 
const onSave = () => spaceStore.saveSpaceUnit()

// ----------

</script>