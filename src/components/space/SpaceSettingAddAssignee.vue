<template>
    <section>
        <o-modal v-model:active="spaceStore.isSpaceAddAssigneeActive" :width="900" clip="scroll">
            <div class="is-modal-scrollable">
                <h6 class="title is-6"> Add Assignee </h6>
                <div class="columns is-vcentered">
                    <div class="column is-2">
                        <p> Mail Address </p>
                    </div>
                    <div class="column is-7">
                        <o-field>
                            <o-input></o-input>
                        </o-field>
                    </div>
                    <div class="column">
                        <button class="button is-link is-rounded is-small"> Add to temporary list </button>
                    </div>
                </div>
                
                <o-field>
                    <div class="columns is-vcentered">
                        <div class="column">
                            Bulk Registration with File
                        </div>
                        <div class="column">
                            <CommonCsvImport class="file-upload" @update:csv="(csv) => parsedCsv = csv"/>
                        </div>
                        <div class="column">
                            <p class="has-text-grey is-size-7 has-text-centered"> Readable csv/xlsx file that described Mail Address at
                                First Line </p>
                        </div>
                    </div>
                </o-field>
                <o-table :data="data" :paginated="true" v-model:checked-rows="checkedRows" :pagination-simple="true" :per-page="4"
                    checkable checkbox-position="right">
                    <o-table-column label="Name" v-slot:default="props">
                        {{ props.row.first_name }}
                    </o-table-column>
                    <o-table-column label="Email" v-slot:default="props">
                        {{ props.row.email }}
                    </o-table-column>
                    <o-table-column field="roles" label="Owned Roles" v-slot:default="props">
                        <div class="pill-direction-row">
                            <div v-for="role in props.row.roles" :style="{'background-color': convertToCssRgb(role.color.rgb)}" class="pill">
                                <span :class="isBgLight(convertToCssRgb(role.color.rgb)) ? 'has-text-black' : 'has-text-white'">{{ role.name }}</span></div>
                        </div>
                    </o-table-column>
                    <template #bottom-left>
                        <!-- <b>Total checked</b>: {{ checkedRows.length }} -->
                    </template>
                </o-table><br>
                <div class="columns">
                    <div class="column">
                        <o-dropdown scrollable="true" :disabled="!checkedRows.length" position="top-left" max-height="140" aria-role="list">
                            <template #trigger="{ active }">
                                <o-button variant="info" outlined rounded>
                                    <span>Add role to selected user</span>
                                    <o-icon icon="account-multiple-plus-outline"></o-icon>
                                </o-button>
                            </template>
                    
                            <o-dropdown-item v-for="(role, index) in filteredRoles" :key="index" :value="role.uuid"
                                @click="(() => addRole(role))" aria-role="listitem">
                                <div class="media">
                                    <div class="media-content">
                                        <div class=" is-tiny"></div>
                                        <span>{{ role.name }}</span>
                                    </div>
                                </div>
                            </o-dropdown-item>
                        </o-dropdown>
                    </div><br>
                    <div class="column">
                        <o-dropdown scrollable="true" :disabled="!checkedRows.length" position="top-left" max-height="140" aria-role="list">
                            <template #trigger="{ active }">
                                <o-button variant="info" outlined rounded>
                                    <span>Remove role from selected user</span>
                                    <o-icon icon="account-multiple-minus-outline"></o-icon>
                                </o-button>
                            </template>
                    
                            <o-dropdown-item v-for="(role, index) in selectedCurrentRole" :key="index" :value="role.uuid"
                                @click="() => removeRole(role)" aria-role="listitem">
                                <div class="media">
                                    <div class="media-content">
                                        <span>{{ role.name }}</span>
                                    </div>
                                </div>
                            </o-dropdown-item>
                        </o-dropdown>
                    </div>
                    <div class="column">
                        <o-button variant="info" rounded outlined :disabled="!checkedRows.length" @click="removeUser">
                            <span>Remove selected user</span>
                            <o-icon icon="account-minus-outline"></o-icon>
                        </o-button>
                    </div>
                </div>
                <div class="columns">
                    <div class="column">
                        <button @click="spaceStore.isSpaceAddAssigneeActive = false" class="button is-rounded">Cancel</button>
                    </div>
                    <div class="column is-8">
                        <p class="has-text-grey is-size-7 has-text-centered">A user with only Mail Address written has not yet been officially registered in this Architwin environment.
After pressing the Add button on the right, an invitation email will be sent to the corresponding Mail Address.</p>
                    </div>
                    <div class="column">
                        <button class="button is-link is-rounded" @click="saveUsers">Finish</button>
                    </div>
                </div>
            </div>
        </o-modal>
    </section>
</template>

<script setup lang="ts">
import CommonCsvImport from '../common/CommonCsvImport.vue'
import { useSpaceStore } from '@/stores/space'
import { useUserStore } from '@/stores/user'
import type { User, Role, SpaceUnitUser} from '@/stores/types'
import { ref, watch } from 'vue'
import { convertToCssRgb, isBgLight } from '@/utils/color'

const emit = defineEmits(['on-import'])

const spaceStore = useSpaceStore()
const userStore = useUserStore()

//Parse data from csv and transfer it to data for rendering to table
const parsedCsv = ref([])
const data = ref<Array<SpaceUnitUser>>(parsedCsv.value)

userStore.getRoles()
const roles = userStore.roles
const checkedRows = ref<Array<User>>([])
const selectedCurrentRole = ref<Array<Role>>([]) //Roles of selected user(s)
const currentUserRoles = ref<Array<string>>([]) //Roles of All
const filteredRoles = ref<Array<Role>>([])

//Variable used in watcher dependecy array to trigger code to refetch selected row and current user roles
const hasAssignedRolesChange = ref(false)


watch(parsedCsv, () => {
    data.value = parsedCsv.value.slice(0,-1)
})

watch([checkedRows,hasAssignedRolesChange], () => {
    currentUserRoles.value = []
    checkedRows.value.map(row => {
        if (Object.keys(row.roles).length != 0) {
            return row.roles.map(r => {
                currentUserRoles.value.push(r.uuid)
            })
        }
    })
    
    selectedCurrentRole.value = roles.filter(role => currentUserRoles.value.includes(role.uuid))
    if (currentUserRoles.value.length === 0) {
        filteredRoles.value = roles
    }else {
        filteredRoles.value = roles.filter(role => !currentUserRoles.value.includes(role.uuid))
    }
    
})

const addRole = (val: Role) => {
    checkedRows.value.forEach(row => {
        row.roles = [...row.roles, val]
    })
    hasAssignedRolesChange.value = !hasAssignedRolesChange.value
}

const removeRole = (val: Role) => {
    checkedRows.value.forEach(row => {
        const arr = row.roles.filter(role => {
            return role.uuid != val.uuid
        })
        row.roles = []
        row.roles = arr
    })
    hasAssignedRolesChange.value = !hasAssignedRolesChange.value
}

const removeUser = () => {
    const newArr = data.value.filter(item => {
        return !checkedRows.value.find(row => {
            return item.uuid === row.uuid
        })
    })
    data.value = []
    checkedRows.value = []
    data.value = newArr
}

const saveUsers = () => {
    let importedUsers:Array<SpaceUnitUser> = []
    importedUsers = data.value.map(user => {
        user.owner = spaceStore.selectedTreeItem?.uuid
        return user
    })
    emit('on-import', importedUsers)
    spaceStore.isSpaceAddAssigneeActive = false
}
//Column titles
const columns = ref([
    {
        field: 'name',
        label: 'First Name',
        width: '40',
    },
    {
        field: 'email',
        label: 'Mail Address'
    }
])
</script>

<style>
.file-upload {
    border: dashed 2px rgba(128, 128, 128, 0.6);
    border-radius: 8px;
    padding: 4px;
    display: flex;
    flex-direction: row;
    max-width: 180px;
    justify-content: space-around;
}
</style>
