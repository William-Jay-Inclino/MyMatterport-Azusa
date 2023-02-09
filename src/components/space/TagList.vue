<template>
    <div style="border-bottom:solid rgba(233, 226, 226, 0.404) 1px; min-width:200px;">
        <h1 style="text-align: right;font-size: 1.6em;">Tag</h1>
    </div>
    <div class="columns">
        <div class="column">
            <div class="field is-grouped" v-if="mpStore.categories && mpStore.categories.length > 0">
                <label style="font-size: 1em;">Tag Category</label>
                <o-dropdown menuClass="transparent-dropdown-menu" expanded :scrollable="true" :max-height="100"
                        aria-role="list">
                    <template #trigger>
                        <div class="transparent-input" style="display: flex;flex-direction: row; justify-content: space-between;">
                            <div>{{ mpStore.listFilter.category ? mpStore.listFilter.category.name : 'All Categories' }}</div>
                            <o-icon pack="mdi" icon="menu-down-outline"></o-icon>
                        </div>
                    </template>

                    <o-dropdown-item itemClass="transparent-dropdown-item" @click="setListCategory({category: null, type: 'category'})" aria-role="listitem">
                        <div class="media">
                            <div class="media-content">
                                <span>All Categories</span>
                            </div>
                        </div>
                    </o-dropdown-item>

                    <o-dropdown-item itemClass="transparent-dropdown-item" v-for="item in mpStore.categories"  @click="setListCategory({category: item, type: 'category'})" aria-role="listitem">
                        <div class="media">
                            <div class="colored-indicator" :style="{ 'background-color': convertToCssRgb(item.color.rgb) }"></div>
                            <div class="media-content">
                                <span>{{ item.name }}</span>
                            </div>
                        </div>
                    </o-dropdown-item>
                </o-dropdown>
            </div>
            <div class="field is-grouped" v-if="mpStore.categories && mpStore.categories.length > 0">
                <label style="font-size: 1em;">Subcategory</label>
                <o-dropdown menuClass="transparent-dropdown-menu" expanded :scrollable="true" :max-height="100"
                        aria-role="list">
                    <template #trigger>
                        <div class="transparent-input" style="display: flex;flex-direction: row; justify-content: space-between;">
                            <div>{{ mpStore.listFilter.sub_category ? mpStore.listFilter.sub_category.name : 'All Subcategories' }}</div>
                            <o-icon pack="mdi" icon="menu-down-outline"></o-icon>
                        </div>
                    </template>

                    <o-dropdown-item itemClass="transparent-dropdown-item" @click="mpStore.listFilter.sub_category = null" aria-role="listitem">
                        <div class="media">
                            <div class="media-content">
                                <span>All Subcategories</span>
                            </div>
                        </div>
                    </o-dropdown-item>

                    <o-dropdown-item itemClass="transparent-dropdown-item"  v-for="item in mpStore.listFilter.category?.sub_category" @click="setListCategory({category: item, type: 'subcategory'})" aria-role="listitem">
                        <div class="media">
                            <div class="media-content">
                                <span>{{ item.name }}</span>
                            </div>
                        </div>
                    </o-dropdown-item>
                </o-dropdown>
            </div>
            <div class="scrollable-table">
                <table>
                    <tr v-for="row in mpStore.tagList" style="border-bottom: solid white 1px;">
                        
                        <td style="width:10%">
                            <div class="colored-indicator" :style="{'background-color': convertToCssRgb(row.data.category!.color.rgb)}"></div>
                        </td>
                        <td @click="mpStore.navigateToTag(row)">
                            {{ row.data.mp_data.label }}
                        </td>
                        <td class="row-container">
                            <span class="mr-1">
                                <o-icon pack="mdi" icon="pencil" size="small" class="is-clickable"
                                    @click="mpStore.initTagData(row)">
                                </o-icon>
                            </span>
                            <span class="mr-1">
                                <o-icon pack="mdi" icon="content-copy" size="small" class="is-clickable" @click="emit('open-toast')">
                                </o-icon>
                            </span>
                            <span class="mr-1">
                                <o-icon pack="mdi" icon="trash-can" size="small" class="is-clickable"
                                    @click="mpStore.removeTag(row)">
                                </o-icon>
                            </span>

                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useMpStore } from '@/stores/mp'
import { convertToCssRgb } from '@/utils/color';
import type { Category, SubCategory } from '@/stores/types'

const mpStore = useMpStore()
const emit = defineEmits(['open-toast'])

const setListCategory = (payload: {category: Category | SubCategory | null, type: string}) => {
    console.log('setListCategory()', payload)

    if(!payload.category){ //All categories
        mpStore.listFilter.category = null
        mpStore.listFilter.sub_category = null
        return 
    }

    if(payload.type === 'category'){
        mpStore.listFilter.category = payload.category as Category
        mpStore.listFilter.sub_category = null
    }else{
        mpStore.listFilter.sub_category = payload.category as SubCategory
    }
    
}

</script>
