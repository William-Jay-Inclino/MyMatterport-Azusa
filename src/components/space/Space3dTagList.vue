<template>
    <div style="border-bottom:solid rgba(233, 226, 226, 0.404) 1px; min-width:200px;">
        <h1 style="text-align: right;font-size: 1.6em;">Tag</h1>
    </div>
    <div class="columns">
        <div class="column">
            <div class="field is-grouped">
                <label style="font-size: 1em;">Tag Category</label>
                <o-dropdown menuClass="transparent-dropdown-menu" expanded :scrollable="true" :max-height="100"
                        aria-role="list">
                    <template #trigger>
                        <div class="transparent-input" style="display: flex;flex-direction: row; justify-content: space-between;">
                            <div class="colored-indicator"
                                :style="{ 'background-color': 'rgb(100,100,100)' }"></div>
                            <div>{{}}</div>
                            <o-icon pack="mdi" icon="menu-down-outline"></o-icon>
                        </div>
                    </template>

                    <o-dropdown-item itemClass="transparent-dropdown-item" aria-role="listitem">
                        <div class="media">
                            <div class="colored-indicator"
                                :style="{ 'background-color': 'rgb(100,100,100)' }"></div>
                            <div class="media-content">
                                <span>{{ }}</span>
                            </div>
                        </div>
                    </o-dropdown-item>
                </o-dropdown>
            </div>
            <div class="field is-grouped">
                <label style="font-size: 1em;">Subcategory</label>
                <o-dropdown menuClass="transparent-dropdown-menu" expanded :scrollable="true" :max-height="100"
                        aria-role="list">
                    <template #trigger>
                        <div class="transparent-input" style="display: flex;flex-direction: row; justify-content: space-between;">
                            <div>{{ }}</div>
                            <o-icon pack="mdi" icon="menu-down-outline"></o-icon>
                        </div>
                    </template>

                    <o-dropdown-item itemClass="transparent-dropdown-item" aria-role="listitem">
                        <div class="media">
                            <div class="media-content">
                                <span>{{  }}</span>
                            </div>
                        </div>
                    </o-dropdown-item>
                </o-dropdown>
            </div>
            <div class="scrollable-table">
                <table>
                    <tr v-for="row in mpStore.tags" style="border-bottom: solid white 1px;">
                        
                        <td style="width:10%">
                            <div class="colored-indicator" :style="{'background-color': convertToCssRgb(row.data.mp_data.color)}"></div>
                        </td>
                        <td>
                            {{ row.data.mp_data.label }}
                        </td>
                        <td class="row-container">
                            <span class="mr-1">
                                <o-icon pack="mdi" icon="pencil" size="small" class="is-clickable"
                                    @click="mpStore.initTagData(row)">
                                </o-icon>
                            </span>
                            <span class="mr-1">
                                <o-icon pack="mdi" icon="content-copy" size="small" class="is-clickable">
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
            <div style="border-top: solid white 1px">
                <br>
                <div class="columns">
                    <div class="column is-6"></div>
                    <div class="column">
                        <div class="button is-rounded is-small bg-transparent" @click="mpStore.initTagData()">
                            <span>Add Tag</span>
                            <o-icon pack="mdi" icon="plus" size="small" class="is-clickable">
                            </o-icon>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref} from 'vue'
import { useMpStore } from '@/stores/mp'
import { convertToCssRgb } from '@/utils/color';

const mpStore = useMpStore()

const open = ref(false)
const sidebarWidth = ref("4vw")

const handleOpen = () => {
  open.value = !open.value
  open.value !== true ? sidebarWidth.value = "4vw" : sidebarWidth.value = "24vw"
}
</script>
