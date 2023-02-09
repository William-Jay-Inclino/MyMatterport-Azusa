<template>
    <div class="space-unit-users" data-cy="space-unit-users">
        <div class="columns">
            <div class="column" data-cy="space-unit-table-wrapper">
                <o-table
                    style="min-height: 200px"
                    :data="spaceStore.spaceUnitUserList" 
                    checkable 
                    :checkbox-position="'right'"
                    v-model:checked-rows="checkedRows"
                    :paginated="true" 
                    :per-page="5"
                    :pagination-simple="true">

                    <o-table-column field="name" label="Name" v-slot:default="props">
                        {{ props.row.name }}
                    </o-table-column>

                    <o-table-column field="email" label="Mail Address" v-slot:default="props">
                        <span :data-cy="`space-unit-tbl-${props.row.email}`">{{ props.row.email }}</span>
                    </o-table-column>

                      <!-- <o-table-column
                          v-for="column in columns"
                          v-bind="column"
                          #default="{ row }"
                          sortable>
                            {{ row[column.field]}}
                      </o-table-column> -->
                  </o-table>
            </div>
        </div>
        <div class="columns">
            <div class="column">
                <button @click="removeRows" class="button is-light is-rounded is-pulled-right is-small" data-cy="remove-user-btn">
                    <span>Remove Selected User</span>
                    <span class="icon">
                        <o-icon 
                            pack="mdi" 
                            icon="account-minus-outline"
                            size="small">
                        </o-icon> 
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useSpaceStore } from '@/stores/space';
import type { SpaceUnitUser } from '@/stores/types';
import { ref } from 'vue';

const spaceStore = useSpaceStore() 
const checkedRows = ref<Array<SpaceUnitUser>>([])


const removeRows = () => {
    checkedRows.value.forEach( (row: SpaceUnitUser) => {
        const indx = spaceStore.spaceUnitUserList.findIndex( (user) => user.uuid === row.uuid )
        if(indx !== -1){
            spaceStore.spaceUnitUserList.splice(indx, 1)
        }
    })
}


</script>

<style lang="scss">

    .space-unit-users{
        .level{
            min-height: 50px !important;
        }
    }

</style>