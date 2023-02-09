<template>
    <section>
        <o-modal v-model:active="spaceStore.isSpaceAddSubcategoryActive" :width="900" clip="scroll">
            <div class="is-modal-scrollable">
                <h6 class="title is-6"> {{ spaceStore.subCategoryFormData.action }} Subcategory </h6>
                <div class="columns is-vcentered">
                    <div class="column is-2">
                        <p> Subcategory Name </p>
                    </div>
                    <div class="column is-7">
                        <o-field>
                            <input type="text" :value="spaceStore.subCategoryFormData.tag_subcategory.name" maxlength="25" @input="characterCount($event)" class="input">
                        </o-field>
                    </div>
                    <div class="column">
                        {{ nameCount }}/25
                    </div>
                </div>
                
                <o-field>
                    <div class="columns is-vcentered">
                        <div class="column">
                            Display Icon
                        </div>
                        <div class="column">
                            <o-field grouped>
                                <figure class="image is-32x32" v-if="spaceStore.subCategoryFormData.tag_subcategory.icon !== undefined">
                                    <img :src="`../../../public/uploads/${spaceStore.subCategoryFormData.tag_subcategory.icon}`">
                                </figure>
                                <label class="colored-indicator" style="background-color: white;" v-else="spaceStore.subCategoryFormData.tag_subcategory.icon === undefined"></label>
                                <label>{{ spaceStore.subCategoryFormData.tag_subcategory.icon !== undefined ? spaceStore.subCategoryFormData.tag_subcategory.icon : 'Undefined' }}</label>
                            </o-field>
                        </div>
                        <div class="column">
                            <o-upload v-model="dropFiles" accept="image/*" @change="getFile" ref="fileInputRef" drag-drop>
                                <section class="ex-center">
                                    <p>
                                        <o-icon icon="upload" size="is-large">
                                        </o-icon>
                                    </p>
                                    <p>Drop your files here or click to upload</p>
                                </section>
                            </o-upload>
                        </div>
                        <div class="column">
                            <p class="has-text-grey is-size-7 has-text-centered">
                                最大画素数50x50サイズのファイルまで対応しています
                            </p>
                        </div>
                    </div>
                </o-field>
                <div class="columns">
                    <div class="column">
                        <button @click="spaceStore.isSpaceAddSubcategoryActive = false" class="button is-rounded">Cancel</button>
                    </div>
                    <div class="column is-8">
                        
                    </div>
                    <div class="column">
                        <button class="button is-link is-rounded" @click="addSubCategory">Finish</button>
                    </div>
                </div>
            </div>
        </o-modal>
    </section>
</template>

<script setup lang="ts">
import { useSpaceStore } from '@/stores/space'
import type { Category, SubCategory} from '@/stores/types'
import { ref, watch } from 'vue'
import { faker } from '@faker-js/faker'



const emit = defineEmits(['on-addsubcategory'])
const spaceStore = useSpaceStore()

const tagSubcategoryName = ref()
const nameCount = ref(0)
const dropFiles = ref()
const tagSubCategories = ref<SubCategory>()


const characterCount = (e:any) => {
    nameCount.value = e.target.value.length
    spaceStore.subCategoryFormData.tag_subcategory.name = e.target.value
}

const getFile = (event:any) => {
    const file = event.target.files[0]
    spaceStore.subCategoryFormData.tag_subcategory.icon = file.name
}

const addSubCategory = () => {
    const tagSubCategory = {} as SubCategory
    if (spaceStore.subCategoryFormData.action === "Add") {
        tagSubCategory.uuid = faker.datatype.uuid()
    }
    tagSubCategory.name = spaceStore.subCategoryFormData.tag_subcategory.name
    tagSubCategory.icon = spaceStore.subCategoryFormData.tag_subcategory.icon
    tagSubCategory.color = faker.color.rgb({format: 'css'})
    tagSubCategories.value = tagSubCategory
    emit('on-addsubcategory',tagSubCategories.value,spaceStore.subCategoryFormData.action)
    spaceStore.isSpaceAddSubcategoryActive = false
}

</script>

<style>
.file-upload {
    border: dashed 2px rgba(128, 128, 128, 0.6);
    border-radius: 8px;
    padding: 4px;
    display: flex;
    flex-direction: row;
    max-width: 180px;
    justify-content: space-around;
}
</style>
