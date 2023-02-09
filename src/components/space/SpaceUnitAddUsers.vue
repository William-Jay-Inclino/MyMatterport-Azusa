<template>
    <div>
        <h6 class="title is-6"> {{ spaceStore.spaceUnitForm.type }} Manager Setting </h6>

        <div class="columns is-vcentered" data-cy="email-input-wrapper">
            <div class="column is-2">
                Mail Address
            </div>
            <div class="column is-7">
                <o-field style="margin-bottom: 0">
                    <o-input
                        data-cy="email-input"
                        placeholder="Email"
                        v-model="spaceStore.spaceUnitUser.email"
                        type="email"
                        @keyup.enter="onClickAddUser"
                        :variant="isExist ? 'danger' : ''"
                    >
                    </o-input>
                </o-field>
                <span class="is-size-7 has-text-danger" v-show="isExist"> Mail Address is already taken </span>
            </div>
            <div class="column">
                <button data-cy="add-user-btn" :disabled="!spaceStore.spaceUnitUser.email" @click="onClickAddUser" class="button is-link is-rounded is-small"> Add to temporary list </button>
            </div>
        </div>


        <o-field>
        <div class="columns is-vcentered">
            <div class="column">
                Bulk Registration with File
            </div>
            <div class="column">
                <CommonCsvImport class="file-upload" @update:csv="(csv) => parsedCsv = csv" />
            </div>
            <div class="column">
                <p class="has-text-grey is-size-7 has-text-centered"> Readable csv/xlsx file that described Mail Address at First Line </p>
            </div>
        </div>
        </o-field>

    </div>
</template>

<script setup lang="ts">
import CommonCsvImport from '../common/CommonCsvImport.vue'
import { useSpaceStore } from '@/stores/space';
import { ref, watch } from 'vue';
import { validEmail } from '@/utils/validate'
import type { SpaceUnitUser } from '@/stores/types';


const spaceStore = useSpaceStore()
const errorEmail = ref(false)
const isExist = ref(false)
const parsedCsv = ref([])
const importCount = ref(0)

const dropFiles = ref([])
const deleteDropFile = (index: number) => {
    dropFiles.value.splice(index, 1)
}

const onClickAddUser = () => {
    if(!(validEmail(spaceStore.spaceUnitUser.email))){
        errorEmail.value = true
    }else{
        errorEmail.value = false
    }

    const indx = spaceStore.spaceUnitUserList.findIndex(user => user.email === spaceStore.spaceUnitUser.email)
    isExist.value = (indx !== -1)

    if(errorEmail.value || isExist.value) return 
    
    
    spaceStore.saveSpaceUnitUser()
}

watch(parsedCsv, () => {
    spaceStore.spaceUnitUserList = parsedCsv.value.slice(0,-1)
    console.log('Imported users:'+ JSON.stringify(spaceStore.spaceUnitUserList))
})


</script>