<template>
    <section>
        <o-modal v-model:active="spaceStore.isSpaceAddSubcategoryActive" :width="900" clip="scroll" data-cy="add-edit-subcategory-modal">
            <div class="is-modal-scrollable">
                <h6 class="title is-6"> {{ $t(spaceStore.subCategoryFormData.action) }} {{ $t('Subcategory') }} </h6>
                <div class="columns is-vcentered">
                    <div class="column is-2">
                        <p> {{ $t('Subcategory Name') }} </p>
                    </div>
                    <div class="column is-7">
                        <o-field>
                            <input type="text" data-cy="subcategory-name-input" :value="spaceStore.subCategoryFormData.tag_category.name" maxlength="25" @input="characterCount($event)" class="input">
                        </o-field>
                    </div>
                    <div class="column">
                        {{ nameCount }}/25
                    </div>
                </div>
                
                <o-field>
                    <div class="columns is-vcentered">
                        <div class="column">
                           {{ $t('Display Icon') }}
                        </div>
                        <div class="column">
                            <o-field grouped>
                                <figure class="image is-32x32" data-cy="subcategory-icon-image" v-if="spaceStore.subCategoryFormData.tag_category.json_data?.icon !== ''">
                                    <img :src="`/uploads/${spaceStore.subCategoryFormData.tag_category.json_data?.icon}`">
                                </figure>
                                <label class="colored-indicator" style="background-color: white;" v-else="spaceStore.subCategoryFormData.tag_subcategory.json_data?.icon === ''"></label>
                                <label data-cy="subcategory-icon-name">{{ spaceStore.subCategoryFormData.tag_category.json_data?.icon !== '' ? spaceStore.subCategoryFormData.tag_category.json_data?.icon : 'Undefined' }}</label>
                            </o-field>
                        </div>
                        <div class="column">
                            <o-upload data-cy="subcategory-icon-file-upload" v-model="dropFiles" accept="image/*" @change="getFile" ref="fileInputRef" drag-drop>
                                <section class="ex-center">
                                    <p>
                                        <o-icon icon="upload" size="is-large">
                                        </o-icon>
                                    </p>
                                    <p>{{ $t('Drag file or click the icon') }}</p>
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
                        <button @click="spaceStore.isSpaceAddSubcategoryActive = false" class="button is-rounded" data-cy="cancel-add-subcategory-btn">Cancel</button>
                    </div>
                    <div class="column is-8">
                        
                    </div>
                    <div class="column">
                        <button class="button is-link is-rounded" @click="addSubCategory" data-cy="add-subcategory-btn">Finish</button>
                    </div>
                </div>
            </div>
        </o-modal>
    </section>
</template>

<script setup lang="ts">
import { useSpaceStore } from "@/stores/space";
import { useCategoryStore } from "@/stores/categories";
import type { Category } from "@/stores/types";
import { ref } from "vue";
import { faker } from "@faker-js/faker";
//@ts-ignore
import { createToaster } from "@meforma/vue-toaster"

const emit = defineEmits(["on-addsubcategory"]);
const spaceStore = useSpaceStore()
const categoryStore = useCategoryStore()

const tagSubcategoryName = ref();
const nameCount = ref(0);
const dropFiles = ref();
const tagSubCategories = ref<Category>();

const characterCount = (e: any) => {
  nameCount.value = e.target.value.length;
  spaceStore.subCategoryFormData.tag_category.name = e.target.value;
};

const getFile = (event: any) => {
  const file = event.target.files[0];
  //@ts-ignore
  spaceStore.subCategoryFormData.tag_category.json_data = {
    icon: file.name
  };
};

const toaster = createToaster({ 
    position: "bottom-right"
});

const addSubCategory = () => {
  const tagSubCategory = {} as Category;
  const error = categoryStore.validateSubCategoryForm()
  console.log("Validation "+ JSON.stringify(error))
  console.log("Icon value "+ JSON.stringify(spaceStore.subCategoryFormData.tag_category.json_data?.icon))
    if (error.name === 0 && error.icon === 0) {
        if (spaceStore.subCategoryFormData.action === "Add") {
        tagSubCategory.uuid = faker.datatype.uuid();
        }
        tagSubCategory.name = spaceStore.subCategoryFormData.tag_category.name;
        tagSubCategory.icon = spaceStore.subCategoryFormData.tag_category.icon;
        tagSubCategory.json_data = spaceStore.subCategoryFormData.tag_category.json_data
        tagSubCategories.value = tagSubCategory;
        emit(
            "on-addsubcategory",
            tagSubCategories.value,
            spaceStore.subCategoryFormData.action
        );
        spaceStore.isSpaceAddSubcategoryActive = false; 
    }else if(error.name === 1) {
        toaster.error("Please enter a valid name")
    }else if(error.icon === 1) {
        toaster.error("Please upload an icon file")
    }
};
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
