<template>
  <div class="columns pattern-background">
    <div class="column is-2 menu-width">
      <TheLeftSidebar />
    </div>
    <UserList @add-user="addUser" @delete-user="deleteUser" />
  </div>
</template>

<script setup lang="ts">
import UserList from "@/components/user/UserList.vue";
import UserAdminModal from "@/components/user/UserAdminModal.vue";
import { useUserStore } from "@/stores/user";
import { useProgrammatic } from "@oruga-ui/oruga-next";
import { computed } from "vue";
import { User } from "@/stores/types";
import TheLeftSidebar from "@/components/TheLeftSidebar.vue";

const { oruga } = useProgrammatic();
const userStore = useUserStore();

// Opens modal to add Admin
const addUser = (payload: { action: string; User }) => {
  userStore.showUserForm = true;
  oruga.modal.open({
    component: UserAdminModal,
    trapFocus: true,
  }),
    console.log("Adds User", payload.User);
};

// Gets number of Checked User
const checkedUserLength = computed(() => {
  return userStore.checkedUsers.length;
});

// Deletes checked Users
const deleteUser = (payload: { action: string; user: User }) => {
  for (let i = 0; i < checkedUserLength.value; i++) {
    userStore.selectedUser = payload.user[i];
    userStore.deleteUser(userStore.selectedUser);
    userStore.selectedUser = {};
  }
  console.log("Successfully Deleted Checked Users", payload.user);
};
</script>

<style scoped>
.pattern-background {
  margin-top: 0px;
  max-width: 100%;
  height: 100vh;
}
</style>
