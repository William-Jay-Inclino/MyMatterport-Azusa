<template>
    <div>
        <div style="border-bottom:solid rgba(233, 226, 226, 0.404) 1px; min-width:200px;">
            <h1 data-cy="tag-list-label" style="text-align: right;font-size: 1.6em;">{{ $t('Tag') }}</h1>
        </div>
        <div class="columns">
            <div class="column">
                <div class="field is-grouped" v-if="mpStore.categories && mpStore.categories.length > 0">
                    <label style="font-size: 1em;" data-cy="tag-category-label">{{ $t('Tag Category') }}</label>
                  <o-dropdown
                    v-model="mpStore.listFilter.category"
                    @change="mpStore.listFilter.sub_category = null; mpStore.renderTagsInSpace()"
                    data-cy="tag-category-select"
                    menuClass="transparent-dropdown-menu"
                    expanded
                    :scrollable="true"
                    :max-height="100"
                    aria-role="list">
                        <template #trigger>
                            <div class="transparent-input" style="display: flex;flex-direction: row; justify-content: space-between;">
                                <div>{{ mpStore.listFilter.category ? mpStore.listFilter.category.name : $t('All Categories') }}</div>
                                <o-icon pack="mdi" icon="menu-down-outline"></o-icon>
                            </div>
                        </template>
    
                       <o-dropdown-item
                          data-cy="category-item-select"
                          itemClass="transparent-dropdown-item"
                          aria-role="listitem">
                            <div class="media">
                                <div class="media-content">
                                    <span>{{ $t('All Categories') }}</span>
                                </div>
                            </div>
                        </o-dropdown-item>
    
                        <o-dropdown-item
                          data-cy="category-item-select"
                          itemClass="transparent-dropdown-item"
                          v-for="item in mpStore.categories"
                          :value="item"
                          aria-role="listitem">
                            <div class="media">
                                <div class="colored-indicator" :style="{ 'background-color': convertToCssRgb(item.json_data!.color.rgb) }"></div>
                                <div class="media-content">
                                    <span>{{ item.name }}</span>
                                </div>
                            </div>
                        </o-dropdown-item>
                    </o-dropdown>
                </div>
                <div class="field is-grouped" v-if="mpStore.categories && mpStore.categories.length > 0">
                    <label data-cy="tag-subcategory-label" style="font-size: 1em;">{{ $t('Subcategory') }}</label>
                    <o-dropdown
                      v-model="mpStore.listFilter.sub_category"
                      @change="mpStore.renderTagsInSpace()"
                      data-cy="subcategory-select"
                      menuClass="transparent-dropdown-menu"
                      expanded
                      :scrollable="true"
                      :max-height="100"
                      aria-role="list">
                        <template #trigger>
                            <div class="transparent-input" style="display: flex;flex-direction: row; justify-content: space-between;">
                                <div>{{ mpStore.listFilter.sub_category ? mpStore.listFilter.sub_category.name : $t('All Subcategories') }}</div>
                                <o-icon pack="mdi" icon="menu-down-outline"></o-icon>
                            </div>
                        </template>
    
                        <o-dropdown-item
                          data-cy="subcategory-item-select"
                          itemClass="transparent-dropdown-item"
                          aria-role="listitem"
                          v-model="mpStore.listFilter.sub_category">
                            <div class="media">
                                <div class="media-content">
                                    <span>{{ $t('All Subcategories') }}</span>
                                </div>
                            </div>
                        </o-dropdown-item>
    
                        <o-dropdown-item
                          data-cy="subcategory-item-select"
                          itemClass="transparent-dropdown-item"
                          v-for="item in mpStore.subCategories"
                          aria-role="listitem"
                          :value="item">
                            <div class="media">
                                <div class="media-content">
                                    <span>{{ item.name }}</span>
                                </div>
                            </div>
                        </o-dropdown-item>
                    </o-dropdown>
                </div>
                <div class="scrollable-table">
                    <table data-cy="tag-list-table" v-show="mpStore.tagList.length > 0">
                        <tr v-for="row in mpStore.tagList" style="border-bottom: solid white 1px;">
                            
                            <td style="width:10%">
                                <div class="colored-indicator" :style="{'background-color': convertToCssRgb(row.json_data.mp_data.color)}"></div>
                            </td>
                            <td @click="mpStore.navigateToTag(row)">
                                <span
                                  :data-cy-id="row.uuid"
                                  data-cy="tag-item">
                                    {{row.json_data.mp_data.label}}
                                </span>
                            </td>
                            <td class="row-container">
                                <span class="mr-1">
                                    <o-icon data-cy="edit-tag-action" pack="mdi" icon="pencil" size="small" class="is-clickable"
                                        @click="mpStore.initTagData(row)">
                                    </o-icon>
                                </span>
                                <span class="mr-1">
                                    <o-icon pack="mdi" icon="content-copy" size="small" class="is-clickable" @click="emit('open-toast')">
                                    </o-icon>
                                </span>
                                <span class="mr-1">
                                    <o-icon :test-deleted-txt="row.json_data.mp_data.label" data-cy="delete-tag-action" pack="mdi" icon="trash-can" size="small" class="is-clickable"
                                        @click="mpStore.removeTag(row)">
                                    </o-icon>
                                </span>
    
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useMpStore } from '@/stores/mp'
import { convertToCssRgb } from '@/utils/color';

const mpStore = useMpStore()
const emit = defineEmits(['open-toast'])

</script>
