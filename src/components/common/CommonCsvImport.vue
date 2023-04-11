<template>
    <label for="fileInput" v-bind="$attrs">
        <o-icon pack="mdi" icon="upload" size="large">
        </o-icon>
        {{ $t('Drag file or click the icon') }}
    </label>
    <input data-cy="bulk-upload-file-input" type="file" name="file" ref="uploadedFile" id="fileInput" style="visibility: hidden;" @change="$event => handleFileUpload($event)">
</template>
<script setup lang="ts">
import { ref } from 'vue'
//@ts-ignore
import Papa from 'papaparse';

const csv = ref([])
const uploadedFile = ref(null)
const emit = defineEmits(['update:csv'])

const handleFileUpload = (event:any) => {
    let file = event.target.files[0]

    if(file !== null &&  file!== undefined){
        console.log("Has file")
    }

    // Now you can pass the file object to the parseFile function
    Papa.parse(file,{
        header:true,
        complete: function (result:any) {
        console.log(result);
        csv.value = result.data;
        emit('update:csv',csv.value)
        event.target.value = ""
      }
    })
}

</script>