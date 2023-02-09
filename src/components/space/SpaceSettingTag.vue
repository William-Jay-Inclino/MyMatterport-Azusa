<template>
    <div style="position: relative;">
        <div class="button is-small is-rounded left-button" @click="spaceStore.categoryForm({action: 'Add',tag_category: blank})">
            <o-icon pack="mdi" icon="plus" size="small"></o-icon>
        </div>
        <o-table :data="data" paginated="true" pagination-simple="true" per-page="4">
            <o-table-column field="roles" label="Tag Category" v-slot:default="props">
                {{ props.row.name }}
            </o-table-column>
            <o-table-column field="color" label="Color" v-slot:default="props">
                <div class="colored-indicator" :style="{'background-color': convertToCssRgb(props.row.color.rgb)}">
                </div>
            </o-table-column>
            <o-table-column field="roles" label="Subcategory" v-slot:default="props">
                <div class="pill-direction-row">
                    <div v-if="props.row.sub_category.length !== 0" v-for="subcategory in props.row.sub_category" :style="{'background-color': subcategory.color}" class="pill">
                        <div>
                            <div class="pill-direction-row">
                                <div class="is-tiny-circle">
                                    <figure class="image is-16x16" v-if="subcategory.icon !== undefined">
                                        <img :src="`../../../public/uploads/${subcategory.icon}`">
                                    </figure>
                                </div>
                                <span :class="isBgLight(subcategory.color) ? 'has-text-black' : 'has-text-white'">{{ subcategory.name }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </o-table-column>
            <o-table-column field="actions" label="Actions" v-slot:default="props">
                <span class="mr-1">
                    <o-icon pack="mdi" icon="pencil" size="small" class="is-clickable" @click="spaceStore.categoryForm({action: 'Edit',tag_category: props.row})">
                    </o-icon>
                </span>
                <span class="mr-1">
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
import { ref, watch} from 'vue'

const spaceStore = useSpaceStore()

const data = ref<Array<Category>>([])
const currentTree = ref(spaceStore.selectedTreeItem?.data)
// @ts-ignore
data.value = currentTree.value.categories

const blank:Category = {
    uuid: '',
    name: '',
    color: {name: COLOR.BLUE,rgb:{r:0,g:0,b:0}},
    sub_category: []
}

const removeTag = (tag: Category) => {
    const newArr = data.value.filter(item => {
        return item.uuid !== tag.uuid
    })
    data.value = []
    data.value = newArr
    console.log("Delete Tag Categoty")
}

const updateTableData = (newTags:Category,action:string) => {
    if (action === "Add") {
        data.value = [...data.value, newTags]
    }
    const subcats = newTags.sub_category
    data.value.forEach((row,index) => {
        if(row.uuid === newTags.uuid){
            data.value[index].name = newTags.name
            data.value[index].color = newTags.color
            data.value[index].sub_category = []
            data.value[index].sub_category = subcats
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