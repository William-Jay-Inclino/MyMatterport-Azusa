<template>
    <section>
        <o-modal v-model:active="spaceStore.isSpaceAddTagActive" :width="900" clip="scroll">
            <div class="is-modal-scrollable" style="min-width:800px">
                <h6 class="title is-6"> {{ formData.action }} Tag Category </h6>
                <div class="columns is-vcentered">
                    <div class="column">
                        <p> Tag Category </p>
                    </div>
                    <div class="column is-7">
                        <o-field>
                            <input type="text" :value="spaceStore.categoryFormData.tag_category.name" maxlength="25" @input="characterCount($event)" class="input">
                        </o-field>
                    </div>
                    <div class="column">
                        {{ nameCount }}/25
                    </div>
                </div>
                <div class="columns is-vcentered">
                    <div class="column">
                        <p> Display color </p>
                    </div>
                    <div class="column is-10">
                        <div class="field is-grouped">
                            <label v-for="color in colors" :for="color.name" class="colored-radio"
                                :style="{'background-color': convertToCssRgb(color.rgb),'outline': setColorSelected(color),'width':'1.8em','height':'1.8em'}"></label>
                            <input v-for="color in colors" type="radio" :id="color.name" name="color-group" :value="color"
                                @click="getColor(color)" class="is-hidden">
                        </div>
                        <!-- <o-field grouped>
                            <o-dropdown aria-role="list" v-model="currentColor" :scrollable="true" max-height="100px" position="top-right">
                                <template #trigger="{ active }">
                                    <o-button :style="{'background-color': convertToCssRgb(currentColor.rgb)}" outlined rounded size="small">
                                       {{  }}
                                    </o-button>
                                </template>
                                <o-dropdown-item v-for="(color, index) in colors" :key="index" :value="color" @click="getColor(color)">
                                    <div class="media">
                                        <div class="media-content">
                                            <span>{{ color.name }}</span>
                                        </div>
                                        <div class="colored-indicator media-right" :style="{'background-color': convertToCssRgb(color.rgb)}"></div>
                                    </div>
                                </o-dropdown-item>
                            </o-dropdown>
                        </o-field> -->
                    </div>
                </div>
                <div style="position: relative;">
                    <div class="button is-small is-rounded left-button"
                        @click="spaceStore.subCategoryForm({action: 'Add',tag_subcategory: blank})">
                        <o-icon pack="mdi" icon="plus" size="small"></o-icon>
                    </div>
                    <o-table :data="spaceStore.categoryFormData.tag_category.sub_category" :paginated="true" :pagination-simple="true" :per-page="4">
                        <o-table-column field="name" label="Subcategory Name" v-slot:default="props">
                            {{ props.row.name }}
                        </o-table-column>
                        <o-table-column field="icon" label="Icon" v-slot:default="props">
                            <figure class="image is-32x32" style="border: solid black 1px;border-radius: 50%;" v-if="props.row.icon !== ''">
                                <img :src="`../../../public/uploads/${props.row.icon}`">
                            </figure>
                            {{ props.row.icon }}
                        </o-table-column>
                        <o-table-column field="actions" label="Actions" v-slot:default="props">
                            <span class="mr-1">
                                <o-icon pack="mdi" icon="pencil" size="small" class="is-clickable" @click="spaceStore.subCategoryForm({action: 'Edit',tag_subcategory: props.row})">
                                </o-icon>
                            </span>
                            <span class="mr-1">
                                <o-icon pack="mdi" icon="trash-can-outline" size="small" class="is-clickable" @click="removeSubcategory(props.row.uuid)">
                                </o-icon>
                            </span>
                        </o-table-column>
                    </o-table>
                </div>
                <br>
                <div class="columns">
                    <div class="column">
                        <button @click="spaceStore.isSpaceAddTagActive = false" class="button is-rounded">Cancel</button>
                    </div>
                    <div class="column is-8">
                    </div>
                    <div class="column">
                        <button class="button is-link is-rounded" @click="saveTag">Finish</button>
                    </div>
                </div>
            </div>
        </o-modal>
    </section>
    <SpaceAddSubCategory @on-addsubcategory="saveSubCategory"/>
</template>

<script setup lang="ts">
import { type Role, type Category, type SubCategory, COLOR, type TagColor } from '@/stores/types'
import { extractRGBValues, useHexToRgb, convertToCssRgb } from '@/utils/color';
import { useSpaceStore } from '@/stores/space';
import { colors } from '@/stores/config';
import { ref } from 'vue';

import SpaceAddSubCategory from './SpaceAddSubCategory.vue';

const emit = defineEmits(['on-addcategory'])
const spaceStore = useSpaceStore()

const formData = ref(spaceStore.categoryFormData)
const data = ref<Array<SubCategory>>(spaceStore.categoryFormData.tag_category.sub_category)
const nameCount = ref(0)
const tagCategory = ref<Category>({uuid: '',name: '',color: {name: COLOR.BLUE,rgb:{r:0,g:0,b:0}},sub_category:[]})
const tagSubCategory = ref<Array<SubCategory>>([])
    const selectedColor = ref<TagColor>({name: COLOR.MAROON,rgb: { r: 0.5, g: 0, b: 0 }})


const characterCount = (e:any) => {
    nameCount.value = e.target.value.length
    spaceStore.categoryFormData.tag_category.name = e.target.value
}

const getColor = (color:TagColor) => {
    spaceStore.categoryFormData.tag_category.color = color
    selectedColor.value = color
}

const setColorSelected = (current:TagColor) => {
    if (current.name === selectedColor.value.name) {
        return `solid rgb(37, 191, 193) 3px`
    }
    return 'none'
}

const saveTag = () => {
    tagCategory.value.uuid = spaceStore.categoryFormData.tag_category.uuid
    tagCategory.value.name = spaceStore.categoryFormData.tag_category.name
    tagCategory.value.color = spaceStore.categoryFormData.tag_category.color
    tagCategory.value.sub_category = spaceStore.categoryFormData.tag_category.sub_category
    emit('on-addcategory', tagCategory.value, formData.value.action)
    spaceStore.isSpaceAddTagActive = false
}

const saveSubCategory = (newSubCat:SubCategory,action:string) => {
    data.value = spaceStore.categoryFormData.tag_category.sub_category
    if (action === "Add") {
        spaceStore.categoryFormData.tag_category.sub_category.push(newSubCat)
        tagSubCategory.value.push(newSubCat)
    }
    spaceStore.categoryFormData.tag_category.sub_category.forEach((sub,index) => {
        if (sub.uuid === newSubCat.uuid) {
            sub.name = newSubCat.name
            sub.icon = newSubCat.icon
        }
    })
}

const removeSubcategory = (tag: string) => {
    const newArr = spaceStore.categoryFormData.tag_category.sub_category.filter(item => {
        return item.uuid !== tag
    })
    spaceStore.categoryFormData.tag_category.sub_category = []
    spaceStore.categoryFormData.tag_category.sub_category = newArr
    console.log("Delete Subcategory" + newArr)
}

const blank:SubCategory = {
    uuid: '',
    name: '',
    color: '',
}
</script>