<template>
<section>
        <o-modal v-model:active="spaceStore.isSpaceAddRoleActive" :width="900" clip="scroll" data-cy="add-edit-role-modal">
            <div class="is-modal-scrollable" style="min-width:800px">
                <h6 class="title is-6">{{ $t(`${spaceStore.roleFormData.action} Role`) }}</h6>
                <div class="columns is-vcentered">
                    <div class="column is-2">
                        <p> {{ $t('Role Name') }} </p>
                    </div>
                    <div class="column is-7">
                        <o-field>
                            <input type="text" data-cy="role-name-input" :value="spaceStore.roleFormData.role.name" maxlength="25" @input="characterCount($event)" class="input">
                        </o-field>  
                    </div>
                    <div class="column">
                        {{ nameCount }}/25
                    </div>
                </div>
                
                <o-field>
                    <div class="columns is-vcentered">
                        <div class="column">
                            {{ $t('Display Color') }}
                        </div>
                        <div class="column is-10">
                            <div class="field is-grouped">
                                <label v-for="color in colors" :for="color.name" class="colored-radio" :data-cy-id="`role-color-${color.name}`"
                                :style="{'background-color': convertToCssRgb(color.rgb),'outline': setColorSelected(color),'width':'1.8em','height':'1.8em'}"></label>
                                <input v-for="color in colors" type="radio" :id="color.name" name="color-group" :value="color" @click="getColor(color)" class="is-hidden">
                            </div>
                        </div>
                    </div>
                </o-field>
                <o-field>
                    <div class="columns is-vcentered">
                        <div class="column is-4">
                            <span >{{ $t('Display Tag Category') }}</span>
                        </div>
                        <div class="column">
                            <o-dropdown aria-role="list" :scrollable="true" max-height="300px" position="top-right" data-cy="role-category-dropdown">
                                <template #trigger="{ active }">
                                    <o-button outlined rounded size="small">
                                        <o-icon pack="mdi" icon="plus-thick" size="small"></o-icon>
                                    </o-button>
                                </template>
                                <o-dropdown-item v-for="(tag, index) in unfilteredTags" :key="index" :value="tag" @click="() => addCategory(tag)" :data-cy="`category-dropdown-item`">
                                    <div class="media">
                                        <div class="media-content">
                                            <span>{{ tag.name }}</span>
                                        </div>
                                        <div class="colored-indicator media-right" :style="{'background-color': convertToCssRgb(tag.color.rgb)}"></div>
                                    </div>
                                </o-dropdown-item>
                            </o-dropdown>
                        </div>
                        <div class="column is-8">
                            <div class="is-flex is-flex-direction-row" style="gap:2px">
                                <div v-if="spaceStore.roleFormData.role.categories?.length !== 0" v-for="category in spaceStore.roleFormData.role.categories" :style="{'background-color': convertToCssRgb(category.color.rgb)}" class="pill">
                                    <div class="pill-direction-row">
                                        <span :class="isBgLight(convertToCssRgb(category.color.rgb)) ? 'has-text-black' : 'has-text-white'">{{ category.name }}</span>
                                        <o-icon pack="mdi" icon="window-close" class="is-clickable" size="small" @click="removeCategory(category)"></o-icon>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </o-field>
                <div class="columns">
                    <div class="column">
                        <button @click="spaceStore.isSpaceAddRoleActive = false" class="button is-rounded">{{ $t('Cancel') }}</button>
                    </div>
                    <div class="column is-8">
                        
                    </div>
                    <div class="column">
                        <button class="button is-link is-rounded" @click="saveRole" data-cy="add-role-btn">{{ $t('Save') }}</button>
                    </div>
                </div>
            </div>
        </o-modal>
    </section>
</template>

<script setup lang="ts">
import {type Category, type Role, COLOR, type TagColor } from '@/stores/types';
import { isBgLight, convertToCssRgb, useHexToRgb, extractRGBValues} from '@/utils/color';
import { useSpaceStore } from '@/stores/space';
import { useRoleStore } from '@/stores/roles';
import { colors } from '@/stores/config';
import { faker } from '@faker-js/faker';
import { ref, computed } from 'vue'
//@ts-ignore
import { createToaster } from "@meforma/vue-toaster"

const spaceStore = useSpaceStore()

const emit = defineEmits(['add-category'])

const nameCount = ref(0)
const currentTree = ref()
currentTree.value = spaceStore.currentNode
const unfilteredTags = ref<Array<Category>>([])
const filteredTags = ref<Array<Category>>([])
const selectedTags = ref<Array<Category>>([])
const selectedColor = ref<TagColor>(spaceStore.roleFormData.role.color)

const characterCount = (e:any) => {
    nameCount.value = e.target.value.length
    spaceStore.roleFormData.role.name = e.target.value
}

const getColor = (color:TagColor) => {
    spaceStore.roleFormData.role.color = color
    selectedColor.value = color
}

const setColorSelected = (current:TagColor) => {
    if (current.name === selectedColor.value.name) {
        return `solid rgb(37, 191, 193) 3px`
    }
    return 'none'
}

const rawCategories = spaceStore.currentNode?.categories ? spaceStore.currentNode?.categories : []
if (rawCategories.length !== 0 && unfilteredTags.value.length === 0) {
    unfilteredTags.value = rawCategories.map((cat:Category) => {
    if (typeof cat.color === 'string' && cat.color !== null) {
        cat.color = JSON.parse(cat.color)
    }
    return cat
})
}

const toaster = createToaster({
    position: "bottom-right"
})

/* function getCategories() {
    let categories:Array<Category> = []
    // @ts-ignore
    if (currentTree.value?.data?.categories !== undefined) {
        categories = currentTree.value?.data.categories
    }else{
        //If categories is empty, this is probably a newly added section and should inheret the categories of its parent
        const keys = Object.keys(spaceStore.treeNodes).map(k => {
            return k
        })

        for (let i = 0; i < keys.length; i++) {
            if (spaceStore.treeNodes[keys[i]].id === spaceStore.currentNode?.parent && spaceStore.currentNode?.parent !== "root") {
                //console.log("Categories of tree: " + JSON.stringify(spaceStore.treeNodes[keys[i]].data.categories))
                //categories = spaceStore.treeNodes[keys[i]].data.categories
            }else if(spaceStore.treeNodes[keys[i]].id === spaceStore.currentNode?.parent && spaceStore.currentNode?.parent === "root"){
                categories = []
            }
        }
    }
    unfilteredTags.value = categories.map((tag: Category) => tag)
    filteredTags.value = unfilteredTags.value.filter((tag, index, arr) => {
        return arr.map(mapObj => mapObj.uuid).indexOf(tag.uuid) === index;
    });
}

getCategories() */

const addCategory = (tag:Category) => {
    if (spaceStore.roleFormData.action === "Edit" && spaceStore.roleFormData.role.categories === undefined) {
        spaceStore.roleFormData.role.categories = []
    }
    spaceStore.roleFormData.role.categories?.push(tag)
    filteredTags.value = filteredTags.value.filter(item => {
        return item.uuid !== tag.uuid
    })
    console.log("Added tag; "+ tag)
}

const removeCategory = (tag:Category) => {
    const newArr = spaceStore.roleFormData.role.categories?.filter(item => {
        return item.uuid !== tag.uuid
    })
    spaceStore.roleFormData.role.categories = []
    spaceStore.roleFormData.role.categories = newArr
}

const saveRole = async () => {
    if (spaceStore.roleFormData.role.name !== "") {
        const role = {} as Role
        if (spaceStore.roleFormData.action === "Add") {
            role.uuid = faker.datatype.uuid()
        }
        role.uuid = spaceStore.roleFormData.role.uuid
        role.name = spaceStore.roleFormData.role.name
        role.color = spaceStore.roleFormData.role.color
        role.categories = spaceStore.roleFormData.role.categories
        console.log("Selected categories: "+ role.categories)
        emit('add-category',role,spaceStore.roleFormData.action)

        selectedTags.value = []
        spaceStore.roleFormData.role = blank
        console.log("This should be empty "+ JSON.stringify(spaceStore.roleFormData.role))
        spaceStore.isSpaceAddRoleActive = false
    } else {
        toaster.error("Please enter a valid role name")
    }
}

const blank:Role = {
    uuid: '',
    name: '',
    color: {name: COLOR.MAROON,rgb: { r: 0.5, g: 0, b: 0 }},
    categories: []
}
</script>
