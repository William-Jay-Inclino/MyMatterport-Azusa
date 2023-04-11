<template>
    <div style="position: relative;" data-cy="category-table-wrapper">
        <div class="button is-small is-rounded left-button" @click="spaceStore.categoryForm({action: 'Add',tag_category: blank})" data-cy="show-add-edit-category-modal">
            <o-icon pack="mdi" icon="plus" size="small"></o-icon>
        </div>
        <o-table :data="categories" :paginated="true" :pagination-simple="true" per-page="4">
            <o-table-column field="roles" :label="$t('Tag Category')" v-slot:default="props">
                <span data-cy="category-table-name-column" :data-cy-id="`category-table-name-${props.row.name}`">
                    {{ props.row.name }}
                </span>
            </o-table-column>
            <o-table-column field="color" :label="$t('Color')" v-slot:default="props">
                <div class="colored-indicator" :style="{'background-color': convertToCssRgb(props.row.json_data.color.rgb)}" 
                data-cy="category-table-color-column" :data-cy-id="`category-table-color-${props.row.json_data.color.name}`">
                </div>
            </o-table-column>
            <o-table-column field="roles" :label="$t('Subcategory')" v-slot:default="props">
                <div class="pill-direction-row">
                    <div v-if="props.row.subcategories.length !== 0" v-for="subcategory in props.row.subcategories" :style="{'background-color': convertToCssRgb(props.row.json_data.color.rgb)}" class="pill"
                        data-cy="category-table-subcategory-column">
                            <div>
                                <div class="pill-direction-row">
                                    <div class="is-tiny-circle" :data-cy-id="`category-table-icon-${subcategory.icon}`">
                                        <figure class="image is-16x16" v-if="subcategory.json_data.icon !== undefined">
                                            <img :src="`/uploads/${subcategory.json_data.icon}`">
                                        </figure>
                                    </div>
                                    <span :class="isBgLight(convertToCssRgb(props.row.json_data.color.rgb)) ? 'has-text-black' : 'has-text-white'"
                                    :data-cy-id="`category-table-icon-${props.row.json_data.icon}`">{{ subcategory.name }}</span>
                                </div>
                            </div>
                        </div>
                </div>
            </o-table-column>
            <o-table-column field="actions" :label="$t('Actions')" v-slot:default="props">
                <span class="mr-1" data-cy="category-table-edit">
                    <o-icon pack="mdi" icon="pencil" size="small" class="is-clickable" @click="spaceStore.categoryForm({action: 'Edit',tag_category: props.row})">
                    </o-icon>
                </span>
                <span class="mr-1" data-cy="category-table-delete">
                    <o-icon pack="mdi" icon="trash-can-outline" size="small" class="is-clickable" @click="removeTag(props.row)">
                    </o-icon>
                </span>
            </o-table-column>
        </o-table>
    </div>
    <br>
    <SpaceSettingAddTag @on-addcategory="updateTableData"/>
</template>

<script setup lang="ts">
import { isBgLight, convertToCssRgb } from '@/utils/color'
import SpaceSettingAddTag from './SpaceSettingAddTag.vue'
import { COLOR, type Category } from '@/stores/types'
import { useSpaceStore} from '@/stores/space'
import { useCategoryStore } from '@/stores/categories'
import { ref, computed} from 'vue'

const spaceStore = useSpaceStore()
const categoryStore = useCategoryStore()

const data = ref<Array<Category>>([])
const currentTree = ref(spaceStore.currentNode?.data)

const categories = computed(() => {
    const rawCategories = spaceStore.currentNode?.categories ? spaceStore.currentNode.categories : []
    if (rawCategories.length !== 0) {
        data.value = rawCategories.map((cat:Category) => {
            if (typeof cat.json_data === 'string' && cat.json_data !== null) {
                cat.json_data = JSON.parse(cat.json_data)
            }
            if (cat.subcategories.length !== 0) {
                const subs = cat.subcategories.map(sub => {
                    if (typeof sub.json_data === "string" && sub.json_data !== null) {
                        sub.json_data = JSON.parse(sub.json_data)
                    }
                    return sub
                })
                cat.subcategories = subs
            }
            return cat
        })
        return data.value
    }
})

const blank:Category = {
    uuid: '',
    name: '',
    color: {name: COLOR.MAROON,rgb:{ r: 0.5, g: 0, b: 0 }},
    subcategories: []
}

const removeTag = async (tag: Category) => {
    console.log("For deletion "+ JSON.stringify(tag))
    if (spaceStore.currentNode) {
        const newCats = spaceStore.currentNode.categories?.filter(row => {
            return row.uuid !== tag.uuid
        })
        spaceStore.currentNode.categories = newCats
    }
    await categoryStore.deleteCategory(tag)
    console.log("Delete Tag Category")
}

const updateTableData = async (newTags:Category,action:string) => {
    if (action === "Add") {
        const newCategory:Category = { ...newTags }
        //data.value.push(newCategory)
        spaceStore.currentNode?.categories?.push(newCategory)
        await categoryStore.addCategory(newTags)
    }else{
        console.log("Updated category table")
        await categoryStore.updateCategory(newTags)
        if (newTags.subcategories.length !== 0) {
            await categoryStore.bulkUpdateSubcategory(newTags.subcategories)
        }
        //Local rendering, subject for removal
        //@ts-ignore
        spaceStore.currentNode?.categories.forEach((row,index) => {
                if(row.uuid === newTags.uuid){
                    if (spaceStore.currentNode?.categories) {
                        spaceStore.currentNode.categories[index].name = newTags.name
                        spaceStore.currentNode.categories[index].color = newTags.color
                    }
                    /* data.value[index].subcategories = newTags.subcategories.map(sub => {
                        if (typeof sub.json_data === 'string' && sub.json_data !== null) {
                            sub.json_data = JSON.parse(sub.json_data)
                        }
                        return sub
                    }) */
                }
            })
    }
    //@ts-ignore
    if (spaceStore.currentNode?.categories) {
        spaceStore.currentNode.categories.forEach((row,index) => {
            if (row.name === newTags.name) {
                //@ts-ignore
                spaceStore.currentNode.categories[index].subcategories = newTags.subcategories.map(sub => {
                    if (typeof sub.json_data === 'string' && sub.json_data !== null) {
                        sub.json_data = JSON.parse(sub.json_data)
                    }
                    return sub
                })
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

.is-tiny-circle {
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    padding: 2px;
    display: inline-block;
}

.text-light {
    color: white;
    font-weight: bolder;
}

</style>