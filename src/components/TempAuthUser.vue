<template>
    <div class="columns">
        <div class="column">
            <o-dropdown aria-role="list" v-model="sessionStore.authUser">
                <template #trigger="{ active }">
                    <o-button variant="primary" size="small">
                        <span v-if="sessionStore.authUser"> {{ sessionStore.authUser.first_name }} </span>
                        <span v-else> Select AuthUser </span>
                        <o-icon pack="mdi" :icon="active ? 'account-arrow-down' : 'account-arrow-up'" size="small"> </o-icon>
                    </o-button>
                </template>
    
                <o-dropdown-item v-for="user in userStore.users" aria-role="listitem" :value="user">
                    {{ user.first_name }}
                </o-dropdown-item>
            </o-dropdown>
        </div>
        <!-- <div class="column">
            <button @click="spaceStore.deleteAllFolders()" class="button is-white is-small">
                <o-icon pack="mdi" icon="trash-can" class="has-text-danger"> </o-icon>
            </button>
        </div> -->
    </div>
</template>

<script lang="ts" setup>
    import { useSessionStore } from '@/stores/session';
    import { useSpaceStore } from '@/stores/space';
    import { useUserStore } from '@/stores/user';

    const userStore = useUserStore()
    const sessionStore = useSessionStore()
    const spaceStore = useSpaceStore()

</script>