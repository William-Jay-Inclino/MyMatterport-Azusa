<template>
    <div style="position: relative;" data-cy="role-table-wrapper">
        <div class="button is-small is-rounded left-button" @click="spaceStore.roleForm({action:'Add',role: blank})" data-cy="show-add-edit-role-modal">
            <o-icon pack="mdi" icon="plus" size="small"></o-icon>
        </div>
        <o-table :data="roles" :paginated="true" :pagination-simple="true" per-page="4">
            <o-table-column field="role" :label="$t('Role Name')" v-slot:default="props">
                <span data-cy="role-table-name-column" :data-cy-id="`role-table-name-${props.row.name}`">
                    {{ props.row.name }}
                </span>
            </o-table-column>
            <o-table-column field="color" :label="$t('Color')" v-slot:default="props">
                <div class="colored-indicator" :style="{'background-color': convertToCssRgb(props.row.color.rgb)}">
                </div>
            </o-table-column>
            <o-table-column field="tag_category" :label="$t('Tag Category')" v-slot:default="props">
                <div class="pill-direction-row" data-cy="role-table-category-column">
                    <div v-if="props.row.categories.length !== 0"  v-for="category in props.row.categories" :style="{ 'background-color': convertToCssRgb(category.color.rgb) }" class="pill">
                        <span :class="isBgLight(convertToCssRgb(category.color.rgb)) ? 'has-text-black' : 'has-text-white'">{{ category.name }}</span>
                    </div>
                </div>
            </o-table-column>
            <o-table-column field="actions" :label="$t('Actions')" v-slot:default="props">
                <span class="mr-1" data-cy="role-table-edit">
                    <o-icon pack="mdi" icon="pencil" size="small" class="is-clickable" @click="spaceStore.roleForm({action: 'Edit',role: props.row})">
                    </o-icon>
                </span>
                <span class="mr-1" data-cy="role-table-delete">
                    <o-icon pack="mdi" icon="trash-can-outline" size="small" class="is-clickable" @click="removeRole(props.row)">
                    </o-icon>
                </span>
            </o-table-column>
        </o-table>
    </div>
    <br>
    <SpaceSettingAddRole @add-category="updateTableData"/>
</template>

<script setup lang="ts">
import { isBgLight, convertToCssRgb } from '@/utils/color'
import { COLOR, type Category, type Role,type User } from '@/stores/types'
import { useSpaceStore} from '@/stores/space'
import { ref,computed } from 'vue'

import SpaceSettingAddRole from './SpaceSettingAddRole.vue'
import { useRoleStore } from '@/stores/roles'

const spaceStore = useSpaceStore()
const roleStore = useRoleStore()

const data = ref<Array<Role>>([])
const currentTree = ref()
currentTree.value = spaceStore.currentNode
const unfilteredRoles = ref<Array<Role>>([])
const categories = ref<Array<Category>>([])

const roles = computed(() => {
    const rawRoles = spaceStore.currentNode?.roles ? spaceStore.currentNode.roles : []
    if (rawRoles.length !== 0) {
        console.log("Raw roles "+ JSON.stringify(rawRoles))
        data.value = rawRoles.map((r:Role) => {
        if (typeof r.color === 'string' && r.color !== null) {
            //@ts-ignore
            r.color = JSON.parse(r.color)   
        }
        r.categories = []
        return r
    })
    return data.value
    }
})

// // @ts-ignore
// if (currentTree.value?.data?.categories !== undefined) {
//     // @ts-ignore
//     //categories.value = currentTree.value?.data.categories
// }else{
// //If categories is empty, this is probably a newly added section and should inheret the categories of its parent
//     //@ts-ignore
//     const keys = Object.keys(spaceStore.treeNodes).map(k => {
//         return k
//     })

//     for (let i = 0; i < keys.length; i++) {
//         //@ts-ignore
//         if (spaceStore.treeNodes[keys[i]].id === spaceStore.currentNode?.parent && spaceStore.currentNode?.parent !== "root") {
//             //@ts-ignore
//             //categories.value = spaceStore.treeNodes[keys[i]].data.categories
//             //@ts-ignore
//         }else if(spaceStore.treeNodes[keys[i]].id === spaceStore.currentNode?.parent && spaceStore.currentNode?.parent === "root"){
//             categories.value = []
//         }
//     }
// }


const blank:Role = {
    uuid: "",
    name: "",
    color: {name: COLOR.MAROON,rgb:{ r: 0.5, g: 0, b: 0 }},
    categories: []
}

const removeRole = async (role: Role) => {
    const newArr = data.value.filter(item => {
        return item.uuid !== role.uuid
    })
    await roleStore.deleteRole(role.uuid)
    //data.value = []
    //data.value = newArr
    if (spaceStore.currentNode) {
        const newRoles = spaceStore.currentNode.roles?.filter(row => {
            return row.uuid !== role.uuid
        })
        spaceStore.currentNode.roles = newRoles
    }
    console.log("Deleted Role")
}

const updateTableData = async (role: Role,action:string) => {

    if (action === "Add") {
        //data.value = [...data.value, role]
        spaceStore.currentNode?.roles?.push(role)
        await roleStore.addRole(role)
    }else{
        const categories = role.categories
        data.value.forEach((row,index) => {
            if(row.uuid === role.uuid){
                data.value[index].name = role.name
                data.value[index].color = role.color
                data.value[index].categories = []
                data.value[index].categories = categories
            }
        })
    }
    
    
}
</script>

<style>
.is-info {
    color: black !important;
    border-color: black !important;
}
.left-button {
    position: absolute;
    left: 2px;
    top: 5px;
    z-index: 10;
}
</style>