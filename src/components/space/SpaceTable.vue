<template>

    <div class="columns">
        <div class="column is-10" data-cy="space-table-wrapper">
          <o-table 
            id="spaceUnitTable"
            v-if="spaceStore.selectedTreeItem?.type !== SPACE_UNIT_TYPE.SPACE"
            :data="spaceStore.spaceUnitChildren" 
            :paginated="true" 
            :per-page="25"
            :pagination-simple="true">

            <div v-if="spaceStore.selectedTreeItem?.type === SPACE_UNIT_TYPE.SECTION || spaceStore.selectedTreeItem?.type === SPACE_UNIT_TYPE.ROOT">
              <o-table-column field="name" label="Name" v-slot:default="props">
                <span :data-cy="`tbl-${props.row.name}`">{{ props.row.name }}</span>
              </o-table-column>
  
              <o-table-column field="belonging_club" label="Belonging Club" v-slot:default="props">
                {{ props.row.data ? props.row.data['belonging_club'] ? props.row.data['belonging_club'] : '' : '' }}
              </o-table-column>
  
              <o-table-column field="created_on" label="Created on" v-slot:default="props">
                {{ props.row.created_on }}
              </o-table-column>
  
              <o-table-column field="type" label="Classification" v-slot:default="props">
                {{ props.row.type }}
              </o-table-column>
            </div>

            <div v-else-if="spaceStore.selectedTreeItem?.type === SPACE_UNIT_TYPE.FACILITY">
              <o-table-column field="name" label="Name" v-slot:default="props">
                <span :data-cy="`tbl-${props.row.name}`">{{ props.row.name }}</span>
              </o-table-column>
              <o-table-column field="created_on" label="Last Edit Date" v-slot:default="props">
                {{ props.row.created_on }}
              </o-table-column>
              <o-table-column field="created_on" label="Created on" v-slot:default="props">
                {{ props.row.created_on }}
              </o-table-column>
            </div>

          </o-table>
        </div>
    </div>

</template>
  

<script setup lang="ts">

import { onMounted, ref, watch, computed } from 'vue';
import { useSpaceStore } from '@/stores/space'
import { SPACE_UNIT_TYPE } from '@/stores/types'
import type { SpaceUnit } from '@/stores/types'
 
interface Column{
  field: string,
  label: string
}

const columns = ref<Array<Column>>([])
const spaceStore = useSpaceStore() 

// hooks

onMounted( () => {
  setColumns()
})

// computed
const selectedTreeItem = computed( () => spaceStore.selectedTreeItem )

// watchers 
//@ts-ignore
watch(selectedTreeItem, (payload: SpaceUnit) => {
  if(payload.type !== SPACE_UNIT_TYPE.SPACE){
    setColumns()
  }
})

// methods
const setColumns = () => { 
  console.log('setColumns()')

  let cols: Array<Column> = []

  if(spaceStore.selectedTreeItem?.type === SPACE_UNIT_TYPE.ROOT){ 
    cols = [
      {
        field: 'name',
        label: 'Name'
      },
      {
        field: 'belonging_club',
        label: 'Belonging Club'
      },
      {
        field: 'created_at',
        label: 'Created'
      },
      {
        field: 'space_unit',
        label: 'Classification'
      }
    ]
  }else if(spaceStore.selectedTreeItem?.type === SPACE_UNIT_TYPE.SECTION){
    cols = [
      {
        field: 'name',
        label: 'Name'
      },
      {
        field: 'belonging_club',
        label: 'Belonging Club'
      },
      {
        field: 'created_at',
        label: 'Created on'
      },
      {
        field: 'space_unit',
        label: 'Classification'
      }
    ]
  }else if(spaceStore.selectedTreeItem?.type === SPACE_UNIT_TYPE.FACILITY){
    cols = [
      {
        field: 'name',
        label: 'Name'
      },
      {
        field: 'updated_at',
        label: 'Last Edit Date'
      },
      {
        field: 'created_at',
        label: 'Created on'
      }
    ]
  }

  columns.value = cols 
} 

  

</script>
