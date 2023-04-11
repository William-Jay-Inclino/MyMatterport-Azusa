<template>
    <section>
        <o-modal v-model:active="spaceStore.isSpaceAddTagActive" :width="900" clip="scroll" data-cy="add-edit-category-modal">
            <div class="is-modal-scrollable" style="min-width:800px">
                <h6 class="title is-6"> {{ $t(formData.action)}} {{ $t('Tag Category') }}</h6>
                <div class="columns is-vcentered">
                    <div class="column">
                        <p> {{ $t('Tag Category') }} </p>
                    </div>
                    <div class="column is-7">
                        <o-field>
                            <input type="text" data-cy="category-name-input" :value="spaceStore.categoryFormData.tag_category.name" maxlength="25" @input="characterCount($event)" class="input">
                        </o-field>
                    </div>
                    <div class="column">
                        {{ nameCount }}/25
                    </div>
                </div>
                <div class="columns is-vcentered">
                    <div class="column">
                        <p> {{ $t('Display Color') }} </p>
                    </div>
                    <div class="column is-10">
                        <div class="field is-grouped">
                            <label v-for="color in colors" :for="color.name" class="colored-radio"
                                :style="{'background-color': convertToCssRgb(color.rgb),'outline': setColorSelected(color),'width':'1.8em','height':'1.8em'}"
                                :data-cy-id="`category-color-${color.name}`"></label>
                            <input v-for="color in colors" type="radio" :id="color.name" name="color-group" :value="color"
                                @click="getColor(color)" class="is-hidden">
                        </div>
                    </div>
                </div>
                <div style="position: relative;" data-cy="subcategory-table-wrapper">
                    <div class="button is-small is-rounded left-button"
                        @click="spaceStore.subCategoryForm({action: 'Add',tag_category: blank})" data-cy="show-add-edit-subcategory-modal">
                        <o-icon pack="mdi" icon="plus" size="small"></o-icon>
                    </div>
                    <o-table :data="spaceStore.categoryFormData.tag_category.subcategories" :paginated="true" :pagination-simple="true" :per-page="4">
                        <o-table-column field="name" :label="$t('Subcategory Name')" v-slot:default="props">
                            <span data-cy="subcategory-table-name-column" :data-cy-id="`subcategory-table-name-${props.row.name}`">{{ props.row.name }}</span>
                        </o-table-column>
                        <o-table-column field="icon" :label="$t('Icon')" v-slot:default="props">
                            <figure class="image is-32x32" style="border: solid black 1px;border-radius: 50%;" v-if="props.row.icon !== ''">
                                <img :src="`/uploads/${props.row.json_data.icon}`" data-cy="subcategory-table-icon-image-column" :data-cy-id="`subcategory-table-icon-image-${props.row.json_data.icon}`">
                            </figure>
                            <span data-cy="subcategory-table-icon-name-column" :data-cy-id="`subcategory-table-icon-name-${props.row.json_data.icon}`">
                                {{ props.row.json_data.icon }}
                            </span>
                        </o-table-column>
                        <o-table-column field="actions" :label="$t('Actions')" v-slot:default="props">
                            <span class="mr-1" data-cy="subcategory-table-edit" :data-cy-id="`subcategory-table-edit-${props.row.name}`">
                                <o-icon pack="mdi" icon="pencil" size="small" class="is-clickable" @click="spaceStore.subCategoryForm({action: 'Edit',tag_category: props.row})">
                                </o-icon>
                            </span>
                            <span class="mr-1" data-cy="subcategory-table-delete" :data-cy-id="`subcategory-table-delete-${props.row.name}`">
                                <o-icon pack="mdi" icon="trash-can-outline" size="small" class="is-clickable" @click="removeSubcategory(props.row)">
                                </o-icon>
                            </span>
                        </o-table-column>
                    </o-table>
                </div>
                <br>
                <div class="columns">
                    <div class="column">
                        <button @click="spaceStore.isSpaceAddTagActive = false" class="button is-rounded" data-cy="cancel-add-category-btn">{{ $t('Cancel') }}</button>
                    </div>
                    <div class="column is-8">
                    </div>
                    <div class="column">
                        <button class="button is-link is-rounded" @click="saveTag" data-cy="add-category-btn">{{ $t('Save') }}</button>
                    </div>
                </div>
            </div>
        </o-modal>
    </section>
    <SpaceAddSubCategory @on-addsubcategory="saveSubCategory"/>
</template>

<script setup lang="ts">
import { type Role, type Category, COLOR, type TagColor } from '@/stores/types'
import { extractRGBValues, useHexToRgb, convertToCssRgb } from '@/utils/color';
import { useSpaceStore } from '@/stores/space';
import { useCategoryStore } from '@/stores/categories';
import { colors } from '@/stores/config';
import { ref,computed } from 'vue';
//@ts-ignore
import { createToaster } from "@meforma/vue-toaster"

import SpaceAddSubCategory from './SpaceAddSubCategory.vue';

const emit = defineEmits(['on-addcategory'])
const spaceStore = useSpaceStore()
const categoryStore = useCategoryStore()
const subcategories = ref<Array<Category>>([])

const formData = ref(spaceStore.categoryFormData)
const nameCount = ref(0)
const tagCategory = ref<Category>({uuid: '',name: '',color: {name: COLOR.BLUE,rgb:{r:0,g:0,b:0}},subcategories:[]})

const characterCount = (e:any) => {
    nameCount.value = e.target.value.length
    spaceStore.categoryFormData.tag_category.name = e.target.value
}

const getColor = (color:TagColor) => {
    if (!color) {
        console.error("Color not defined")
        return
    }
    spaceStore.categoryFormData.tag_category.color = color
    spaceStore.selectedColor = color
}

const setColorSelected = (current:TagColor) => {
    if (current.name === spaceStore.selectedColor?.name) {
        return `solid rgb(37, 191, 193) 3px`
    }
    return 'none'
}

const toaster = createToaster({
    position: "bottom-right"
})

const saveTag = async () => {
    if (spaceStore.categoryFormData.tag_category.name !== "") {
        tagCategory.value.uuid = spaceStore.categoryFormData.tag_category.uuid
        tagCategory.value.name = spaceStore.categoryFormData.tag_category.name
        tagCategory.value.color = spaceStore.categoryFormData.tag_category.color
        tagCategory.value.subcategories = spaceStore.categoryFormData.tag_category.subcategories
        tagCategory.value.json_data = {
            color: spaceStore.categoryFormData.tag_category.color
        }
        //await categoryStore.addCategory(tagCategory.value)
        emit('on-addcategory', tagCategory.value, formData.value.action)
        setColorSelected({name: COLOR.MAROON,rgb: { r: 0.5, g: 0, b: 0 }})
        spaceStore.isSpaceAddTagActive = false
    } else {
        toaster.error("Please enter a valid category name")
    }
}

const saveSubCategory = async (newSubCat:Category,action:string) => {
    const cat:Category = {
        uuid: newSubCat.uuid,
        name: newSubCat.name,
        color: spaceStore.categoryFormData.tag_category.color,
        json_data: newSubCat.json_data,
        subcategories: []
    }
    if (action === "Add") {
        spaceStore.categoryFormData.tag_category.subcategories.push(cat)
    }
    spaceStore.categoryFormData.tag_category.subcategories.forEach((sub,index) => {
        if (sub.uuid === newSubCat.uuid) {
            sub.name = newSubCat.name
            sub.icon = newSubCat.json_data?.icon
        }
    })
}

const removeSubcategory = async (tag: Category) => {
    const newArr = spaceStore.categoryFormData.tag_category.subcategories.filter(item => {
        return item.uuid !== tag.uuid
    })
    spaceStore.categoryFormData.tag_category.subcategories = []
    spaceStore.categoryFormData.tag_category.subcategories = newArr
    await categoryStore.deleteCategory(tag)
    console.log("Delete Subcategory" + newArr)
}

const blank:Category = {
    uuid: "",
    name: "",
    color: { name: COLOR.MAROON, rgb: { r: 0.5, g: 0, b: 0 } },
    icon: "",
    parent_uuid: spaceStore.categoryFormData.tag_category.uuid,
    subcategories:[]
}
</script>
