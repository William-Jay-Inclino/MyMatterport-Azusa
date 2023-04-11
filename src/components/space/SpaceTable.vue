<template>
    <div class="columns">
        <div class="column is-10" data-cy="space-table-wrapper">
            <o-table 
            id="spaceUnitTable"
            v-if="spaceStore.currentNode?.type_ !== FOLDER_TYPE.SPACE"
            v-model:selected="spaceStore.currentNode"
            :data="spaceStore.nodeChildren"
            :sticky-header="true"
            :paginated="true" 
            :per-page="8"
            :pagination-simple="true"
>

            <div v-if="spaceStore.currentNode?.type_ === FOLDER_TYPE.SECTION || spaceStore.currentNode?.type_ === FOLDER_TYPE.ROOT">
              <o-table-column field="name" :label="$t('Name')" v-slot:default="props">
                <span :data-cy="`tbl-${props.row.name}`" class="table-space-name">{{ props.row.name }}</span>
              </o-table-column>
  
              <o-table-column field="belonging_club" :label="$t('Belonging Club')" v-slot:default="props">
                {{ props.row.data ? props.row.data['belonging_club'] ? props.row.data['belonging_club'] : '' : '' }}
              </o-table-column>
  
              <o-table-column field="created_on" :label="$t('Created on')" v-slot:default="props">
                <!-- {{ props.row.created_on }} -->
              </o-table-column>
  
              <o-table-column field="type" :label="$t('Classification')" v-slot:default="props">
                {{ props.row.type_ }}
              </o-table-column>
            </div>

            <div v-else-if="spaceStore.currentNode?.type_ === FOLDER_TYPE.FACILITY">
              <o-table-column field="name" :label="$t('Name')" v-slot:default="props">
                <span :data-cy="`tbl-${props.row.name}`" class="table-space-name">{{ props.row.name }}</span>
              </o-table-column>
              <o-table-column field="created_on" :label="$t('Last Edit Date')" v-slot:default="props">
                {{ props.row.created_on }}
              </o-table-column>
              <o-table-column field="created_on" :label="$t('Created on')" v-slot:default="props">
                {{ props.row.created_on }}
              </o-table-column>
            </div>
          </o-table>
        </div>
    </div>
</template>
  

<script setup lang="ts">

import { useSpaceStore } from '@/stores/space'
import { FOLDER_TYPE } from '@/stores/types'
 
const spaceStore = useSpaceStore() 
</script>