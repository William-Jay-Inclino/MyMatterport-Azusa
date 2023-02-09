<template>
    <div style="border-bottom:solid rgba(233, 226, 226, 0.404) 1px; min-width:200px; padding: 4px;">
        <h1 style="text-align: right;font-size: 1em;" v-if="mpStore.isAddingTag">Add Tag</h1>
        <h1 style="text-align: right;font-size: 1em;" v-else="mpStore.isAddingTag">Edit Tag - {{ mpStore.tagData?.data.mp_data.label }}
        </h1>
    </div>
    <div class="scrollable-panel">
        <div class="columns">
            <div class="column">
                <div class="field is-grouped">
                    <div class="control">
                        <label>Relocation</label>
                    </div>
                    <div class="control">
                        <o-icon @click="mpStore.relocateTag()" pack="mdi" icon="map-marker" size="normal"></o-icon>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <label style="font-size: 1em;">Tag Category</label>
                    </div>
                    <div class="control is-expanded">
                        <o-dropdown menuClass="transparent-dropdown-menu" expanded :scrollable="true" :max-height="100"
                            v-model="mpStore.tagData?.data.category" aria-role="list">
                            <template #trigger>
                                <div class="transparent-input " style="display: flex;flex-direction: row;justify-content: space-between;">
                                    <div>{{ mpStore.tagData?.data.category?.name }}</div>
                                    <o-icon pack="mdi" icon="menu-down-outline"></o-icon>
                                </div>
                            </template>
                        
                            <o-dropdown-item itemClass="transparent-dropdown-item" v-for="(tag, index) in mpStore.categories" :key="index"
                                :value="tag" aria-role="listitem">
                                <div class="media">
                                    <div class="media-content">
                                        <span>{{ tag.name }}</span>
                                    </div>
                                </div>
                            </o-dropdown-item>
                        </o-dropdown>
                    </div>
                </div>
                <div class="field is-grouped">
                    <label style="font-size: 1em;">Subcategory</label>
                    <o-dropdown menuClass="transparent-dropdown-menu" expanded :scrollable="true" :max-height="100"
                        v-model="mpStore.tagData?.data.subcategory" aria-role="list">
                        <template #trigger>
                            <div class="transparent-input" style="display: flex;flex-direction: row; justify-content: space-between;">
                                <div>{{ mpStore.tagData?.data.subcategory?.name }}</div>
                                <o-icon pack="mdi" icon="menu-down-outline"></o-icon>
                            </div>
                        </template>
    
                        <o-dropdown-item itemClass="transparent-dropdown-item" v-for="(tag, index) in mpStore.subCategories"
                            :key="index" :value="tag" aria-role="listitem">
                            <div class="media">
                                <div class="media-content">
                                    <span>{{ tag.name }}</span>
                                </div>
                            </div>
                        </o-dropdown-item>
                    </o-dropdown>
                </div>
                <br>
                <div class="field is-grouped">
                    <div class="control">
                        <label>Tag Name</label>
                    </div>
                    <div class="control">
                        <input v-model="mpStore.tagData?.data.mp_data.label" class="transparent-input" type="text"
                            placeholder="Enter tag name" name="tag_name">
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <label>Tag Description</label>
                    </div>
                    <div class="control">
                        <textarea class="transparent-input" cols="15" rows="5" style="resize:none">
                                        {{ mpStore.tagData?.data.mp_data.description }}
                        </textarea>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <label>Embed Media</label>
                    </div>
                    <div class="control">
                        <textarea class="transparent-input" cols="15" rows="5" style="resize:none">
    
                                    </textarea>
                        <!-- insert media object here -->
                    </div>
                </div>
            </div>
        </div>
    </div>
    <br>
    <hr style="width: 3px;">
    <div class="columns">
        <div class="column">
            <div class="button is-rounded is-small bg-transparent" @click="mpStore.clearTagData()">
                <span>Cancel</span>
            </div>
        </div>
        <div class="column is-3"></div>
        <div class="column">
            <div v-if="mpStore.isAddingTag" class="button is-rounded is-small bg-transparent">
                <span>Finish</span>
            </div>
            <div v-else="mpStore.isAddingTag" class="button is-rounded is-small bg-transparent">
                <span>Update</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref} from 'vue'
import { useMpStore } from '@/stores/mp'

const mpStore = useMpStore() 

// const selectedCategory = ref<TagCategory>()
// selectedCategory.value = mpStore.tagForm.tag_category
// const tagCategories = ref<Array<TagCategory>>([
//     {name: 'HVAC', color: '#ed9b40'},
//     {name: 'Cooling', color: '#FFEEDB'},
//     {name: 'Disposal', color: '#BA3B46'},
//     {name: 'Cleaning', color: '#9448BC'},
//     {name: 'Servers', color: '#63B4D1'},
// ])

// const selectedSubCategory = ref<TagSubCategory>()
// selectedSubCategory.value = mpStore.tagForm.tag_subcategory
// const subCategories = ref<Array<TagSubCategory>>([
//     {name: 'Fan', color: '#ed9b40'},
//     {name: 'Blades', color: '#ed9b40'},
//     {name: 'Air ducts', color: '#ed9b40'},
//     {name: 'Ventilation', color: '#ed9b40'},
//     {name: 'Bins', color: '#ed9b40'},
// ])

// console.log("Category:" + selectedCategory)
// console.log("Subcategory:" + selectedSubCategory)
</script>

<style>
.scrollable-panel {
  max-height: 400px;
  max-width: 19vw;
}

.scrollable-panel::-webkit-scrollbar {
width: 2px;               /* width of the entire scrollbar */
}

.scrollable-panel::-webkit-scrollbar-track {
background: transparent;        /* color of the tracking area */
}

.scrollable-panel::-webkit-scrollbar-thumb {
background-color: rgba(24, 23, 23, 0.877);   /* color of the scroll thumb */
border-radius: 1px;       /* roundness of the scroll thumb */
}

</style>
