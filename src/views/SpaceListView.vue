<template>
  <div>
    <div class="pattern-background">
    <DragCol leftPercent="20" :sliderWidth="20" width="100%" height="100vh" sliderColor="#FFFFF" sliderHoverColor="#FFFFF" sliderBgColor="rgba(255, 255, 255, 0.018)" sliderBgHoverColor="rgba(255, 255, 255, 0.06)">
          <template #left>
            <TheLeftSidebar />
          </template>
          <template #right>
            <main>
            <div class="container is-fluid mt-6">
              <SpaceActionBar @button-click="onClickActionBar" />

              <div v-if="spaceStore.currentNode?.type_ !== FOLDER_TYPE.SPACE">
                <SpaceSwitcherBar @on-switch="switchTableView" />

                <div>
                  <SpaceTable v-show="spaceStore.tableView === TABLE_VIEW.LIST"/>
                  <SpaceCard
                    v-show="spaceStore.tableView === TABLE_VIEW.CARD"
                    @click-card="clickCard"
                  />
                </div>
              </div>

              <div v-else>
                <SpaceMainView/>
              </div>
            </div>

            <SpaceUnitModal v-if="spaceStore.isEditingSpaceNode === false"/>
            <SpaceSettingDetailMain @edit-node="onClickActionBar"/>
          </main>
          </template>
      </DragCol>
    </div>
    <MobileLeftSidebarView />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
// Components
import TheLeftSidebar from "@/components/TheLeftSidebar.vue";
import SpaceActionBar from "@/components/space/SpaceActionBar.vue";
import SpaceSwitcherBar from "@/components/space/SpaceSwitcherBar.vue";
import SpaceTable from "@/components/space/SpaceTable.vue";
import SpaceCard from "@/components/space/SpaceCard.vue";
import SpaceSettingDetailMain from "@/components/space/SpaceSettingDetailMain.vue";
import SpaceUnitModal from "@/views/SpaceUnitModalView.vue";
import MobileLeftSidebarView from '@/views/MobileLeftSidebarView.vue'
import SpaceMainView from "./SpaceMainView.vue";
//@ts-ignore
import { DragCol } from 'vue-resizer' //Ignore linting error
// ----------

// Stores
import { useSpaceStore } from '@/stores/space'
import { useSessionStore } from '@/stores/session'

import { useUserStore } from "@/stores/user"
import { useRoleStore } from "@/stores/roles"
import { useCategoryStore } from "@/stores/categories"
import { ACTION_BAR, TABLE_VIEW, FOLDER_TYPE, type Node } from '@/stores/types'

// ----------

// data
const userStore = useUserStore()
const spaceStore = useSpaceStore();
const sessionStore = useSessionStore();

const modalContent = ref()
// ----------

onMounted( async() => { 
  // order is important
  await userStore.getUsers()
  await sessionStore.init()

})



// Handlers
const switchTableView = (payload: {tableView: TABLE_VIEW}) => spaceStore.tableView = payload.tableView

const clickCard = (payload: { action: string; child: Node }) => {
  spaceStore.setCurrentNode(payload.child)
  console.log("Card Item Clicked");
};

const onClickActionBar = (payload: {action: ACTION_BAR, space_unit_type: FOLDER_TYPE}) => {
    console.log('action', payload)

    if(payload.action === ACTION_BAR.ADD_SECTION || payload.action === ACTION_BAR.ADD_FACILITY || payload.action === ACTION_BAR.ADD_SPACE){
      spaceStore.spaceUnitForm.type_ = payload.space_unit_type
      spaceStore.isEditingSpaceNode = false
      spaceStore.isSpaceUnitModalActive = true
      if(sessionStore.tempAuthUser){
        spaceStore.spaceUnitForm.owner_uuid = sessionStore.tempAuthUser.uuid
      }
    }else if(payload.action === ACTION_BAR.FACILITY_SETTING || payload.action === ACTION_BAR.SECTION_SETTING){
        console.log('Modal Section Setting')
        modalContent.value = payload.action
        spaceStore.isCardModalActive = true
    }else if(payload.action === ACTION_BAR.EDIT_SECTION || payload.action === ACTION_BAR.EDIT_FACILITY || payload.action === ACTION_BAR.EDIT_SPACE){
        console.log("Edit Space Node")
        spaceStore.isEditingSpaceNode = true
        spaceStore.isSpaceUnitModalActive = true
        console.log()
    }
    else{
        console.error('Error: Action is undefined; Action is not in ACTION_BAR interface')
    }
}

</script>
