<template>
    <div data-cy="tag-form" class="scrollable-panel" v-if="mpStore.tagData">
        <div style="border-bottom:solid rgba(233, 226, 226, 0.404) 1px; min-width:200px; padding: 4px;">
            <h1 data-cy="tag-form-label" style="text-align: right;font-size: 1em;" v-if="mpStore.isAddingTag">{{ $t('Add Tag') }}</h1>
            <h1 data-cy="tag-form-label" style="text-align: right;font-size: 1em;" v-else="mpStore.isAddingTag">{{ $t('Edit Tag') }} - {{ mpStore.formLabel }}
            </h1>
        </div>
        <div class="columns">
            <div class="column">
                <div class="field is-grouped">
                    <div class="control">
                        <label>{{ $t('Relocation') }}</label>
                    </div>
                    <div class="control">
                        <o-icon @click="mpStore.relocateTag()" data-cy="relocate-icon" pack="mdi" icon="map-marker" size="normal"></o-icon>
                        <p class="has-text-danger is-size-7" data-cy="relocate-icon-msg" v-show="mpStore.tagDataError.relocation"> {{ $t('Relocation is required') }} </p>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <label style="font-size: 1em;">{{ $t('Tag Category') }}</label>
                    </div>
                    <div class="control is-expanded"  v-if="mpStore.categories && mpStore.categories.length > 0">
                        <o-dropdown v-if="mpStore.category" data-cy="category-select" v-model="mpStore.category" menuClass="transparent-dropdown-menu" expanded :scrollable="true" :max-height="100"
                             aria-role="list">
                            <template #trigger>
                                <div data-cy="category-field" class="transparent-input " style="display: flex;flex-direction: row;justify-content: space-between;">
                                    <div class="colored-indicator" :style="{ 'background-color': convertToCssRgb(mpStore.category.json_data!.color.rgb)}"></div>
                                    <div>{{ mpStore.category.name }}</div>
                                    <o-icon pack="mdi" icon="menu-down-outline"></o-icon>
                                </div>
                            </template>
                        
                            <o-dropdown-item data-cy="category-item" itemClass="transparent-dropdown-item" v-for="item in mpStore.categories" :value="item" aria-role="listitem">
                                <div class="media">
                                    <div class="media-content">
                                        <span> {{ item.name }} </span>
                                    </div>
                                </div>
                            </o-dropdown-item>
                        </o-dropdown>
                        <p class="has-text-danger is-size-7" v-show="mpStore.tagDataError.category" data-cy="category-item-msg"> {{ $t('Tag category is required') }} </p>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <label style="font-size: 1em;">{{ $t('Subcategory') }}</label>
                    </div>
                    <div class="control is-expanded" v-if="mpStore.categories && mpStore.categories.length > 0">
                        <o-dropdown data-cy="subcategory-select" v-model="mpStore.subCategory" menuClass="transparent-dropdown-menu" expanded :scrollable="true" :max-height="100"
                             aria-role="list">
                            <template #trigger>
                                <div data-cy="subcategory-field" class="transparent-input" style="display: flex;flex-direction: row; justify-content: space-between;">
                                    <div v-if="mpStore.subCategory">{{ mpStore.subCategory.name }}</div>
                                    <o-icon pack="mdi" icon="menu-down-outline"></o-icon>
                                </div>
                            </template>
                        
                            <o-dropdown-item data-cy="subcategory-item" itemClass="transparent-dropdown-item" v-for="item in mpStore.subCategories" :value="item" aria-role="listitem">
                                <div class="media">
                                    <div class="media-content">
                                        <span>{{ item.name }}</span>
                                    </div>
                                </div>
                            </o-dropdown-item>
                        </o-dropdown>
                        <p class="has-text-danger is-size-7" v-show="mpStore.tagDataError.subCategory" data-cy="subcategory-item-msg"> {{ $t('Subcategory is required') }} </p>
                    </div>
                </div>
                <br>
                <div class="field is-grouped">
                    <div class="control">
                        <label>{{ $t('Tag Name') }}</label>
                    </div>
                    <div class="control">
                        <input data-cy="tag-name-input" v-model="mpStore.tagData.json_data.mp_data.label" class="transparent-input" type="text"
                            placeholder="Enter tag name" name="tag_name">
                        <p class="has-text-danger is-size-7" v-show="mpStore.tagDataError.name" data-cy="tag-name-input-msg"> {{ $t('Tag name is required') }} </p>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <label>{{ $t('Tag Description') }}</label>
                    </div>
                    <div class="control">
                        <textarea data-cy="tag-desc-input" class="transparent-input" cols="15" rows="5" style="resize:none" v-model="mpStore.tagData.json_data.mp_data.description">{{ mpStore.tagData.json_data.mp_data.description }}</textarea>
                        <p class="has-text-danger is-size-7" v-show="mpStore.tagDataError.description" data-cy="tag-desc-input-msg"> {{ $t('Tag description is required') }} </p>
                    </div>
                </div>
                <div class="field is-grouped">
                    <div class="control">
                        <label>{{ $t('Embed Media') }}</label>
                    </div>
                    <div class="control">
                        <textarea data-cy="embed-media" :disabled="!!mpStore.mediaInfo" v-model="mpStore.mediaLink" class="transparent-input" cols="15" rows="5" style="resize:none">{{ mpStore.tagData?.json_data.mp_data.description }}</textarea>
                        <p data-cy="invalid-url" class="has-text-danger is-size-7" v-show="mpStore.tagDataError.invalid_url"> {{  $t('Invalid URL') }} </p>
                        <p data-cy="embed-media-err" class="has-text-danger is-size-7" v-show="mpStore.tagDataError.embedly"> {{  $t('Check media before saving') }} </p>
                    </div>
                </div>
                <div class="is-flex is-flex-direction-row is-justify-content-flex-end" v-if="!mpStore.isSaving">
                    <button data-cy="check-btn" v-if="mpStore.mediaLink !== ''" :disabled="mpStore.isCheckingMedia" @click="mpStore.setMedia()" class="button is-dark is-small mt-1">
                        {{ mpStore.isCheckingMedia ? $t('Checking...') : $t('Check') }}
                    </button>
                    <button data-cy="remove-btn" v-if="mpStore.tagData.json_data.media" @click="mpStore.removeMedia()" class="button is-dark is-small mt-1">
                            {{ $t('Remove') }}
                    </button>
                </div>
                <div data-cy="embedly-table" v-if="mpStore.mediaInfo && !mpStore.isSaving" class="columns">
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
                        <button data-cy="embedly-remove-btn" @click="mpStore.removeMedia()" class="button is-dark is-small mt-1">
                            {{ $t('Remove') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { convertToCssRgb } from '@/utils/color';
import { useMpStore } from '@/stores/mp'
const mpStore = useMpStore() 

</script>
