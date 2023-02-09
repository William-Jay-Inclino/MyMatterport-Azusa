<template>
    <div style="border-bottom:solid rgba(233, 226, 226, 0.404) 1px; min-width:200px; padding: 4px;">
        <h1 style="text-align: right;font-size: 1em;" v-if="mpStore.isAddingTag">Add Tag</h1>
        <h1 style="text-align: right;font-size: 1em;" v-else="mpStore.isAddingTag">Edit Tag - {{ mpStore.formLabel }}
        </h1>
    </div>
    <div class="scrollable-panel" v-if="mpStore.tagData">
        <div class="columns">
            <div class="column">
                <div class="field is-grouped">
                    <div class="control">
                        <label>Relocation</label>
                    </div>
                    <div class="control">
                        <o-icon @click="mpStore.relocateTag()" pack="mdi" icon="map-marker" size="normal"></o-icon>
                        <p class="has-text-danger is-size-7" v-show="mpStore.tagDataError.relocation"> Relocation is required </p>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <label style="font-size: 1em;">Tag Category</label>
                    </div>
                    <div class="control is-expanded"  v-if="mpStore.categories && mpStore.categories.length > 0">
                        <o-dropdown menuClass="transparent-dropdown-menu" expanded :scrollable="true" :max-height="100"
                             aria-role="list">
                            <template #trigger>
                                <div class="transparent-input " style="display: flex;flex-direction: row;justify-content: space-between;">
                                    <div class="colored-indicator" :style="{ 'background-color': convertToCssRgb(mpStore.tagData!.data.category!.color.rgb)}"></div>
                                    <div>{{ mpStore.tagData.data.category?.name }}</div>
                                    <o-icon pack="mdi" icon="menu-down-outline"></o-icon>
                                </div>
                            </template>
                        
                            <o-dropdown-item itemClass="transparent-dropdown-item" v-for="item in mpStore.categories"
                            @click="setListCategory({category: item, type: 'category'})" :value="item" aria-role="listitem">
                                <div class="media">
                                    <div class="media-content">
                                        <span>{{ item.name }}</span>
                                    </div>
                                </div>
                            </o-dropdown-item>
                        </o-dropdown>
                        <p class="has-text-danger is-size-7" v-show="mpStore.tagDataError.category"> Tag category is required </p>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <label style="font-size: 1em;">Subcategory</label>
                    </div>
                    <div class="control is-expanded" v-if="mpStore.categories && mpStore.categories.length > 0">
                        <o-dropdown menuClass="transparent-dropdown-menu" expanded :scrollable="true" :max-height="100"
                             aria-role="list">
                            <template #trigger>
                                <div class="transparent-input" style="display: flex;flex-direction: row; justify-content: space-between;">
                                    <div>{{ mpStore.tagData?.data.subcategory?.name }}</div>
                                    <o-icon pack="mdi" icon="menu-down-outline"></o-icon>
                                </div>
                            </template>
                        
                            <o-dropdown-item itemClass="transparent-dropdown-item" v-for="item in mpStore.subCategories"
                            @click="setListCategory({category: item, type: 'subcategory'})" :value="item" aria-role="listitem">
                                <div class="media">
                                    <div class="media-content">
                                        <span>{{ item.name }}</span>
                                    </div>
                                </div>
                            </o-dropdown-item>
                        </o-dropdown>
                        <p class="has-text-danger is-size-7" v-show="mpStore.tagDataError.subCategory"> Subcategory is required </p>
                    </div>
                </div>
                <br>
                <div class="field is-grouped">
                    <div class="control">
                        <label>Tag Name</label>
                    </div>
                    <div class="control">
                        <input v-model="mpStore.tagData.data.mp_data.label" class="transparent-input" type="text"
                            placeholder="Enter tag name" name="tag_name">
                        <p class="has-text-danger is-size-7" v-show="mpStore.tagDataError.name"> Tag name is required </p>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <label>Tag Description</label>
                    </div>
                    <div class="control">
                        <textarea class="transparent-input" cols="15" rows="5" style="resize:none" v-model="mpStore.tagData.data.mp_data.description">
                                        {{ mpStore.tagData.data.mp_data.description }}
                        </textarea>
                        <p class="has-text-danger is-size-7" v-show="mpStore.tagDataError.description"> Tag description is required </p>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <label>Embed Media</label>
                    </div>
                    <div class="control">
                        <textarea v-model="mpStore.mediaLink" class="transparent-input" cols="15" rows="5" style="resize:none">
                            {{ mpStore.tagData?.data.mp_data.description }}
                        </textarea>
                        <p class="has-text-danger is-size-7" v-show="mpStore.tagDataError.invalid_url"> Invalid URL </p>
                    </div>
                </div>
                <div class="is-flex is-flex-direction-row is-justify-content-flex-end">
                    <button :disabled="mpStore.isCheckingMedia" @click="mpStore.setMedia()" class="button is-dark is-small mt-1">
                        {{ mpStore.isCheckingMedia && !mpStore.isSaving ? 'Checking...' : 'Check' }}
                    </button>
                </div>
                <div v-if="mpStore.mediaInfo && !mpStore.isSaving" class="columns">
                    <div class="table-container">
                        <div class="column">
                            <table class="table is-striped is-bordered is-hoverable">
                                <tr>
                                    <td colspan=2>
                                        <figure class="image is-5by3">
                                            <img :src="mpStore.mediaInfo.thumbnail_url">
                                        </figure>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Title</th>
                                    <th> {{ mpStore.mediaInfo.title }} </th>
                                </tr>
                                <tr>
                                    <th>Provider</th>
                                    <th> {{ mpStore.mediaInfo.provider_name }} </th>
                                </tr>
                                <tr>
                                    <th>URL</th>
                                    <th> {{ mpStore.mediaInfo.provider_url }} </th>
                                </tr>
                                <tr>
                                    <th>Author</th>
                                    <th> {{ mpStore.mediaInfo.author_name }} </th>
                                </tr>
                                <tr>
                                    <th>Type</th>
                                    <th> {{ mpStore.mediaInfo.type }} </th>
                                </tr>
                
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <br>
    <hr style="width: 3px;">
</template>

<script setup lang="ts">
import { convertToCssRgb } from '@/utils/color';
import { useMpStore } from '@/stores/mp'
import type { Category, SubCategory } from '@/stores/types';
const mpStore = useMpStore() 


const setListCategory = (payload: {category: Category | SubCategory | null, type: string}) => {
    console.log('setListCategory()', payload)

    if(payload.type === 'category'){
        mpStore.tagData!.data.category = payload.category as Category
    }else{
        mpStore.tagData!.data.subcategory = payload.category as SubCategory
    }
    
}

</script>
