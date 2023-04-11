<template>
    
    <tree data-cy="space-tree-wrapper" v-if="spaceStore.treeNodes" :nodes="spaceStore.treeNodes" :config="spaceStore.treeConfig" @nodeFocus="onFocus">
        <!-- for testing -->
        <template #before-input="props">
            <span :data-cy="`tree-type-${props.node.type_}`"></span>
        </template>
        <template #after-input="props">
            <span
              :data-cy="`tree-${props.node.name}`"
              :data-cy-type="props.node.type + ' node'"
              :class="{'is-selected' : spaceStore.currentNode?.id === props.node.id}"
              class="test-node">
            {{ props.node.name }}
            </span>
        </template>
        <!-- end -->
    </tree>
</template>

<script setup lang="ts">
//@ts-ignore
import tree from "vue3-treeview";
import "vue3-treeview/dist/style.css";
import type { Node } from "@/stores/types"
import { ACTIVITY_TYPE } from "@/stores/types";
import { useSpaceStore } from "@/stores/space"
import {useRoute} from 'vue-router'
import { computed, ref } from "vue";
import router from "@/router";
import { useActivityStore } from "@/stores/activity"
import dayjs from "dayjs";

const spaceStore = useSpaceStore()
const activityStore = useActivityStore()
const route=useRoute();
const now = dayjs()

const path = computed(() =>route.name)

// spaceStore.getFoldersByOwnerId();

// handlers
const onFocus = (node: Node) => {
    console.log('node', node)
    if (node.id) {

        // toggle node open/close
        if (!node.state) {
            node.state = {
                opened: true
            }
        } else {
            node.state.opened = !node.state.opened
        }
        // ------

        console.log('route', path.value)
        if (path.value !== 'spaceList') {
            router.push({ name: 'spaceList' })
        }
        spaceStore.setCurrentNode(node)
        activityStore.addActivity({
            space_uuid: node.id,
            created_on: now.format("YYYY/MM/DD"),
            type: ACTIVITY_TYPE.LANDING
        })
        // spaceStore.setSelectedTreeItem({uuid: node.id, parent_uuid: node.parent})
    }
}

// ------
</script>


<style lang="scss">
    // removed the scoped attribue on <style> tag to also update the global css for the <tree> component

    .input-wrapper{
        margin-left: 0 !important;
    }

    .is-selected{
        color: rgba(179, 59, 115, 1);
    }

    .node-wrapper{
        cursor: pointer;
    }
</style>
