<template>
  <div>
    <div class="columns pattern-background">
      <!-- Sidebar -->
        <TheLeftSidebar />
      <MobileLeftSidebarView />
      <!-- End Sidebar -->

      <!-- Content -->
      <main class="column">
        <div class="container is-fluid mt-6">
          <SpaceActionBar @button-click="onClickActionBar" />

          <div v-if="spaceStore.selectedTreeItem?.type !== SPACE_UNIT_TYPE.SPACE">
            <SpaceSwitcherBar @on-switch="switchTableView" />

            <div>
              <SpaceTable v-show="spaceStore.tableView === TABLE_VIEW.LIST" />
              <SpaceCard
                v-show="spaceStore.tableView === TABLE_VIEW.CARD"
                @click-card="clickCard"
              />
            </div>
          </div>

          <div v-else>
            <router-link :to="{ name: 'space3d' }">
              <div class="columns">
                <div class="column is-8 is-offset-2">
                  <button class="button is-primary is-pulled-right mb-4">
                    Enter the Space
                  </button>

                  <SpaceShowcase />
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <SpaceUnitModal />
        <SpaceSettingDetailMain/>
        <!-- <SpaceUnitModal v-if="modalContent === ACTION_BAR.ADD_FACILITY" :label="spaceUnitLabel"/> -->
      </main>
      <!-- End Content -->
    </div>
  </div>
</template>

<script setup lang="ts">
// Components
import TheLeftSidebar from "@/components/TheLeftSidebar.vue";
import SpaceActionBar from "@/components/space/SpaceActionBar.vue";
import SpaceSwitcherBar from "@/components/space/SpaceSwitcherBar.vue";
import SpaceTable from "@/components/space/SpaceTable.vue";
import SpaceCard from "@/components/space/SpaceCard.vue";
import SpaceSettingDetailMain from "@/components/space/SpaceSettingDetailMain.vue";
import SpaceUnitModal from "@/views/SpaceUnitModalView.vue";
import SpaceShowcase from "@/components/space/SpaceShowcase.vue";
import MobileLeftSidebarView from '@/views/MobileLeftSidebarView.vue'
// ----------

// Stores
import { useSpaceStore } from '@/stores/space'
import { useSessionStore } from '@/stores/session'
import { ACTION_BAR, TABLE_VIEW, SPACE_UNIT_TYPE, type SpaceUnit } from '@/stores/types'
import { ref } from "vue";
// ----------

// data
const spaceStore = useSpaceStore();
const sessionStore = useSessionStore();

sessionStore.init()

// ----------

// computed

const modalContent = ref()
// ----------

// Handlers
const switchTableView = (payload: {tableView: TABLE_VIEW}) => spaceStore.tableView = payload.tableView

const clickCard = (payload: { action: string; child: SpaceUnit }) => {
    spaceStore.setSelectedTreeItem({uuid: payload.child.uuid, parent_uuid: payload.child.parent_uuid});
  console.log("Card Item Clicked");
};

const onClickActionBar = (payload: {action: ACTION_BAR, space_unit_type: SPACE_UNIT_TYPE}) => {
    console.log('action', payload)

    if(payload.action === ACTION_BAR.ADD_SECTION || payload.action === ACTION_BAR.ADD_FACILITY || payload.action === ACTION_BAR.ADD_SPACE){
      spaceStore.spaceUnitForm.type = payload.space_unit_type
      spaceStore.isSpaceUnitModalActive = true
    }else if(payload.action === ACTION_BAR.FACILITY_SETTING || payload.action === ACTION_BAR.SECTION_SETTING){
        console.log('Modal Section Setting')
        modalContent.value = payload.action
        spaceStore.isCardModalActive = true
    }else{
        console.error('Error: Action is undefined; Action is not in ACTION_BAR interface')
    }
}
</script>
