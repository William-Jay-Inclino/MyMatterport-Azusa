<template>
    <div style="position: relative;" data-cy="role-table-wrapper">
        <div class="button is-small is-rounded left-button" @click="spaceStore.roleForm({action:'Add',role: blank})">
            <o-icon pack="mdi" icon="plus" size="small"></o-icon>
        </div>
        <o-table :data="data" :paginated="true" :pagination-simple="true" per-page="4">
            <o-table-column field="role" label="Role Name" v-slot:default="props">
                <span :data-cy="`space-unit-tbl-${props.row.name}`">
                    {{ props.row.name }}
                </span>
            </o-table-column>
            <o-table-column field="color" label="Color" v-slot:default="props">
                <div class="colored-indicator" :style="{'background-color': convertToCssRgb(props.row.color.rgb)}">
                </div>
            </o-table-column>
            <o-table-column field="tag_category" label="Tag Category" v-slot:default="props">
                <div class="pill-direction-row">
                    <div v-for="category in props.row.categories" :style="{ 'background-color': convertToCssRgb(category.color.rgb) }" class="pill">
                        <span :class="isBgLight(convertToCssRgb(category.color.rgb)) ? 'has-text-black' : 'has-text-white'">{{ category.name }}</span>
                    </div>
                </div>
            </o-table-column>
            <o-table-column field="actions" label="Actions" v-slot:default="props">
                <span class="mr-1">
                    <o-icon pack="mdi" icon="pencil" size="small" class="is-clickable" @click="spaceStore.roleForm({action: 'Edit',role: props.row})">
                    </o-icon>
                </span>
                <span class="mr-1">
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
import { COLOR, type Category, type Role, type SpaceUnit,type User } from '@/stores/types'
import { useSpaceStore} from '@/stores/space'
import { ref } from 'vue'

import SpaceSettingAddRole from './SpaceSettingAddRole.vue'

const spaceStore = useSpaceStore()

const data = ref<Array<Role>>([])
const currentTree = ref<SpaceUnit>()
currentTree.value = spaceStore.selectedTreeItem
const unfilteredRoles = ref<Array<Role>>([])
const categories = ref<Array<Category>>([])
// @ts-ignore
categories.value = currentTree.value?.data.categories


function getRoles() {
    // @ts-ignore
    currentTree.value?.users.forEach((user: User) => {
        return user.roles.forEach(role => {
            unfilteredRoles.value.push(role)
        })
    })
    const filtered = unfilteredRoles.value.filter((role, index, arr) => {
        return arr.map(mapObj => mapObj.uuid).indexOf(role.uuid) === index;
    })
    data.value = filtered.map(item => {
        const cats:Array<Category> = []
        for (let index = 0; index < 2; index++) {
            const rand = Math.floor(Math.random() * categories.value.length)
            cats.push(categories.value[rand])
        }
        item.categories = cats
        return item
    })
}

getRoles()


const blank:Role = {
    uuid: '',
    name: '',
    color: {name: COLOR.BLUE,rgb:{r:0,g:0,b:0}},
    categories: []
}

const removeRole = (role: Role) => {
    const newArr = data.value.filter(item => {
        return item.uuid !== role.uuid
    })
    data.value = []
    data.value = newArr
    console.log("Deleted Role")
}

const updateTableData = (role: Role,action:string) => {
    if (action === "Add") {
        data.value = [...data.value, role]
    }
    const categories = role.categories
    data.value.forEach((row,index) => {
        if(row.uuid === role.uuid){
            data.value[index].name = role.name
            data.value[index].color = role.color
            data.value[index].categories = []
            data.value[index].categories = categories
            console.log("Edited categories: "+ JSON.stringify(data.value[index].categories))
        }
    })
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