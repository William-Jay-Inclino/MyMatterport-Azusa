<template>
  <div class="container">
    <div class="m-6">
      <h3 class="title is-1">{{ $t("UserList") }}</h3>
      <o-field class="is-grouped">
        <o-input
          :placeholder="$t('<Search Input>')"
          class="search-input"
          data-cy="input-search-user"
          v-model="userStore.searchUser"
        />
        <span class="mx-3">by</span>
        <select
          class="search-input has-text-centered"
          v-model="userStore.searchUserOption"
          data-cy="select-search-user"
        >
          <option :value="1" selected>{{ $t("Name") }}</option>
          <option :value="2">{{ $t("Company") }}</option>
        </select>
      </o-field>
      <o-field class="add-icon is-block-absolute" v-if="!userStore.showUserForm">
        <button
          class="button is-ghost"
          data-cy="add-admin-user"
          @click="emit('add-user', { action: addUser, User: (userStore.userInfo = {}) })"
        >
          <o-icon pack="mdi" icon="plus-circle-outline" size="small" class="button-icon">
          </o-icon>
        </button>
      </o-field>
      <div class="column m-6">
        <o-table
          :data="userStore.filteredUsers"
          v-model:checked-rows="userStore.checkedUsers"
          v-model:selected="userStore.selectedUser"
          focusable
          checkable
          sticky-header="stickyHeaders"
          :checkbox-position="checkboxPosition"
          :paginated="true"
          :per-page="8"
          :pagination-simple="true"
        >
          <o-table-column
            field="Name"
            width="150"
            :label="$t('Name')"
            sortable
            :sticky="true"
            #default="props"
            data-cy="table-user-name"
            >{{ props.row.first_name + " " + props.row.last_name }}
          </o-table-column>
          <o-table-column
            field="Email"
            width="250"
            :label="$t('Email')"
            sortable
            :sticky="true"
            #default="props"
            >{{ props.row.email }}
          </o-table-column>
          <o-table-column
            field="Company"
            width="250"
            :label="$t('Company')"
            sortable
            :sticky="true"
            #default="props"
            >{{ props.row.company_name }}
          </o-table-column>
        </o-table>
      </div>
      <div class="has-text-centered">
        <button
          class="button is-rounded add-user"
          data-cy="delete-users"
          @click="emit('delete-user', { action: deleteUser })"
        >
          <span class="menu-text">{{ $t("Delete selected user") }}</span
          ><o-icon pack="mdi" icon="account-minus-outline" class="mr-0"></o-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Stores
import { ref, onUnmounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useSessionStore } from "@/stores/session";
import { useI18n } from "vue-i18n";

const userStore = useUserStore();
const checkboxPosition = ref("right");
const { t } = useI18n();
const emit = defineEmits(["add-user, delete-user"]);

userStore.getUsers();
const sessionStore = useSessionStore();
const stickyHeaders = ref(true);

sessionStore.init();

onUnmounted(() => {
  userStore.searchUser = "";
});
</script>

<style scoped>
.search-input {
  width: 80px !important;
  margin-top: 2px;
  position: relative;
}

.is-grouped {
  position: absolute !important;
  right: 50px;
  top: 26px;
}

.menu-width {
  margin-top: 0px;
}

.menu-text {
  margin-right: 10px;
}

.add-user {
  top: 0 !important;
  right: 50px;
}
</style>
