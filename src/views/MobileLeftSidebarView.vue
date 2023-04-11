<template>
    <section>
        <o-sidebar fullheight="true"
            v-model:open="spaceStore.isMobileSidebarActive">
            <div class="container is-fluid has-background-light pt-3">
                <div class="columns space-tree-wrapper">
                    <div class="column">
                        <SpaceTree />
                    </div>
                </div>
                <div class="columns menu-bottom-wrapper">
                    <div class="column">
                        <hr>
                        <aside class="menu">
                            <ul class="menu-list">
                                <li>
                                    <a href="">
                                        <o-icon pack="mdi" icon="account-cog-outline"> </o-icon>
                                        Profile Setting
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <o-icon pack="mdi" icon="account-box-multiple-outline"> </o-icon>
                                        User List
                                    </a>
                                </li>
                            </ul>
                        </aside>
                    </div>
                </div>
            </div>
        </o-sidebar>
    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSpaceStore } from '@/stores/space';

import SpaceTree from '@/components/space/SpaceTree.vue'

const spaceStore = useSpaceStore()
</script>

<style scoped>
hr{
    margin: 20px 0 8px 0;
    color: gray;
    background-color: gray;
}

.space-tree-wrapper{
    height: 80vh
}

.menu-bottom-wrapper{
    height: auto
}

</style>