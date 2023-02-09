<template>
<section>
        <o-modal v-model:active="spaceStore.isSpaceAddRoleActive" :width="900" clip="scroll">
            <div class="is-modal-scrollable" style="min-width:800px">
                <h6 class="title is-6">{{ spaceStore.roleFormData.action }} Role</h6>
                <div class="columns is-vcentered">
                    <div class="column is-2">
                        <p> Role Name </p>
                    </div>
                    <div class="column is-7">
                        <o-field>
                            <input type="text" data-cy="input-role-field" :value="spaceStore.roleFormData.role.name" maxlength="25" @input="characterCount($event)" class="input">
                        </o-field>  
                    </div>
                    <div class="column">
                        {{ nameCount }}/25
                    </div>
                </div>
                
                <o-field>
                    <div class="columns is-vcentered">
                        <div class="column">
                            Display Color
                        </div>
                        <div class="column is-10">
                            <div class="field is-grouped">
                                <label v-for="color in colors" :for="color.name" class="colored-radio" 
                                :style="{'background-color': convertToCssRgb(color.rgb),'outline': setColorSelected(color),'width':'1.8em','height':'1.8em'}"></label>
                                <input v-for="color in colors" type="radio" :id="color.name" name="color-group" :value="color" @click="getColor(color)" class="is-hidden">
                            </div>
                        </div>
                    </div>
                </o-field>
                <o-field>
                    <div class="columns is-vcentered">
                        <div class="column">
                            Display Tag Category
                        </div>
                        <div class="column">
                            <o-dropdown aria-role="list" :scrollable="true" max-height="300px" position="top-right">
                                <template #trigger="{ active }">
                                    <o-button outlined rounded size="small">
                                        <o-icon pack="mdi" icon="plus-thick" size="small"></o-icon>
                                    </o-button>
                                </template>
                                <o-dropdown-item v-for="(tag, index) in filteredTags" :key="index" :value="tag" @click="() => addCategory(tag)">
                                    <div class="media">
                                        <div class="media-content">
                                            <span>{{ tag.name }}</span>
                                        </div>
                                        <div class="colored-indicator media-right" :style="{'background-color': convertToCssRgb(tag.color.rgb)}"></div>
                                    </div>
                                </o-dropdown-item>
                            </o-dropdown>
                        </div>
                        <div class="column is-10">
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
                        <button @click="spaceStore.isSpaceAddRoleActive = false" class="button is-rounded">Cancel</button>
                    </div>
                    <div class="column is-8">
                        
                    </div>
                    <div class="column">
                        <button class="button is-link is-rounded" @click="saveCategory">Finish</button>
                    </div>
                </div>
            </div>
        </o-modal>
    </section>
</template>

<script setup lang="ts">
import { type SpaceUnit, type Category, type Role, COLOR, type TagColor } from '@/stores/types';
import { isBgLight, convertToCssRgb, useHexToRgb, extractRGBValues} from '@/utils/color';
import { useSpaceStore } from '@/stores/space';
import { colors } from '@/stores/config';
import { faker } from '@faker-js/faker';
import { ref } from 'vue'
import type { TagPlacer } from '@/stores/tagPlacer';

const spaceStore = useSpaceStore()

const emit = defineEmits(['add-category'])

const nameCount = ref(0)
const currentTree = ref<SpaceUnit>()
currentTree.value = spaceStore.selectedTreeItem
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

function getCategories() {
    // @ts-ignore
    unfilteredTags.value = currentTree.value?.data.categories.map((tag: Category) => tag)
    filteredTags.value = unfilteredTags.value.filter((tag, index, arr) => {
        return arr.map(mapObj => mapObj.uuid).indexOf(tag.uuid) === index;
    });
}

getCategories()

const addCategory = (tag:Category) => {
    if (spaceStore.roleFormData.action === "Edit" && spaceStore.roleFormData.role.categories === undefined) {
        spaceStore.roleFormData.role.categories = []
    }
    spaceStore.roleFormData.role.categories?.push(tag)
    console.log("Added tag; "+ tag)
}

const removeCategory = (tag:Category) => {
    const newArr = spaceStore.roleFormData.role.categories?.filter(item => {
        return item.uuid !== tag.uuid
    })
    spaceStore.roleFormData.role.categories = []
    spaceStore.roleFormData.role.categories = newArr
}

const saveCategory = () => {
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
    spaceStore.isSpaceAddRoleActive = false
}

const blank:Role = {
    uuid: '',
    name: '',
    color: {name: COLOR.BLUE,rgb: {r:255,g:255,b:255}},
    categories: []
}
</script>