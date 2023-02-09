<template>
    
    <tree data-cy="space-tree-wrapper" v-if="spaceStore.treeNodes" :nodes="spaceStore.treeNodes" :config="spaceStore.treeConfig" @nodeFocus="onFocus">
        <!-- for testing -->
        <template #after-input="props">
            <span :data-cy="`tree-${props.node.text}`" :data-cy-type="props.node.type + ' node'"></span>
        </template>
        <!-- end -->
    </tree>

</template>

<script setup lang="ts">
//@ts-ignore
import tree from "vue3-treeview";
import "vue3-treeview/dist/style.css";
import type { Node } from "@/stores/types"
import { useSpaceStore } from "@/stores/space"
import {useRoute} from 'vue-router'
import { computed } from "vue";
import router from "@/router";

const spaceStore = useSpaceStore()
const route=useRoute();

const path = computed(() =>route.name)

// handlers
const onFocus = (node: Node) => {
    console.log('node', node)
    if(node.id){

        // toggle node open/close
        if(!node.state){
            node.state = {
                opened: true
            }
        }else{
            node.state.opened = !node.state.opened
        }
        // ------

        console.log('route', path.value)
        if(path.value !== 'spaceList'){
            router.push({ name:'spaceList' })
        }

        spaceStore.setSelectedTreeItem({uuid: node.id, parent_uuid: node.parent})
    }
    
}
// ------




</script>


<style lang="scss">
    // removed the scoped attribue on <style> tag to also update the global css for the <tree> component

    .input-wrapper{
        margin-left: 0 !important
    }

    .node-wrapper{
        cursor: pointer;
    }

</style>
