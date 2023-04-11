<template>
  <div class="columns pattern-background">
    <DragCol leftPercent="20" :sliderWidth="8" width="100%" height="100vh" sliderColor="#FFFFF"
      sliderBgColor="rgba(255, 255, 255, 0.018)" sliderBgHoverColor="rgba(255, 255, 255, 0.06)">
      <template #left>
        <TheLeftSidebar />
        <MobileLeftSidebarView />
      </template>
      <template #right>
        <UserList @add-user="addUser" @delete-user="deleteUser" />
      </template>
    </DragCol>
  </div>
</template>

<script setup lang="ts">
import UserList from "@/components/user/UserList.vue";
import UserAdminModal from "@/components/user/UserAdminModal.vue";
import { useUserStore } from "@/stores/user";
import { useProgrammatic } from "@oruga-ui/oruga-next";
import { User } from "@/stores/types";
import TheLeftSidebar from "@/components/TheLeftSidebar.vue";

//@ts-ignore
import { DragCol } from 'vue-resizer' //Ignore linting error

const { oruga } = useProgrammatic();
const userStore = useUserStore();

// Opens modal to add Admin
const addUser = (payload: { action: string; User }) => {
  userStore.showUserForm = true;
  userStore.userInfo = {};
  console.log("Add User", payload.User)
  oruga.modal.open({
    component: UserAdminModal,
    trapFocus: true,
  }),
    console.log("Adds User", payload.User);
};

// Deletes checked Users
const deleteUser = async (payload: { action: string }) => {
  for (let item of userStore.checkedUsers) {
    console.log("Deleting", item)
    await userStore.deleteUser(item);
  }
  userStore.checkedUsers = []
  console.log("Successfully Deleted Checked Users");
};
</script>

<style scoped>
.pattern-background {
  margin-top: 0px;
  max-width: 100%;
  height: 100vh;
}
</style>
