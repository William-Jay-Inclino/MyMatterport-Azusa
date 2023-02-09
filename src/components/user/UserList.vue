<template>
  <div class="container">
    <div class="m-6">
      <h3 class="title is-1">UserList</h3>
      <o-field class="is-grouped">
        <o-input placeholder="<Search Input>" class="search-input" />

        <span class="mx-3">by</span>
        <select class="search-input">
          <option></option>
        </select>
      </o-field>
      <o-field class="add-icon is-block-absolute" v-if="!userStore.showUserForm">
        <button
          class="button is-ghost"
          @click="emit('add-user', { action: addUser, User: (userStore.userForm = {}) })"
        >
          <o-icon pack="mdi" icon="plus-circle-outline" size="small" class="button-icon">
          </o-icon></button
      ></o-field>
      <div class="column m-6">
        <o-table
          :data="userStore.users"
          v-model:checked-rows="userStore.checkedUsers"
          v-model:selected="userStore.selectedUser"
          focusable
          checkable
          :checkbox-position="checkboxPosition"
          :paginated="true"
          :per-page="8"
          :pagination-simple="true"
        >
          <o-table-column field="Name" width="150" label="Name" sortable #default="props"
            >{{ props.row.first_name + " " + props.row.last_name }}
          </o-table-column>
          <o-table-column
            field="Email"
            width="250"
            label="Email"
            sortable
            #default="props"
            >{{ props.row.email }}
          </o-table-column>
          <o-table-column
            field="Company"
            width="250"
            label="Company"
            sortable
            #default="props"
            >{{ props.row.company_name }}
          </o-table-column>
        </o-table>
      </div>
      <div class="has-text-centered">
        <button
          class="button is-rounded add-user"
          @click="
            emit('delete-user', { action: deleteUser, user: userStore.checkedUsers })
          "
        >
          <span class="menu-text">選択ユーザーを削除する</span
          ><o-icon pack="mdi" icon="account-minus-outline" class="mr-0"></o-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Stores
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useSessionStore } from "@/stores/session";

// Components
import TheLeftSidebar from "@/components/TheLeftSidebar.vue";

const userStore = useUserStore();
const checkboxPosition = ref("right");
const emit = defineEmits("add-user, delete-user");

userStore.getUsers();
const sessionStore = useSessionStore();

sessionStore.init();

onMounted(() => {
  console.log("UserList is mounted");
});
</script>

<style scoped>
.search-input {
  width: 66px !important;
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
