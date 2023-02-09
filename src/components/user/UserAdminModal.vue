<template>
  <div class="admin-modal">
    <form>
      <div class="modal-card" v-if="!userStore.isAddAdminConfirmed">
        <header class="modal-card-head title is-4">Add Admin User</header>
        <o-field horizontal class="mt-5">
          <span class="label-text">Mail Address</span
          ><o-input
            type="email"
            v-model="userStore.userForm.email"
            class="login-input"
            expanded
        /></o-field>

        <footer class="modal-card-foot mt-5">
          <div class="column is-4 is-offset-2">
            <button
              class="button is-rounded is-primary"
              @click.prevent="cancelAddAdmin(), $emit('close')"
            >
              <span>Cancel</span>
            </button>
          </div>
          <div class="column is-4 is-offset-1">
            <button
              class="button is-rounded is-dark"
              :disabled="!userStore.userForm.email"
              @click.prevent="confirmAdd()"
            >
              <span>Add Admin ( Available: {{ usersLength }}) </span>
            </button>
          </div>
        </footer>
      </div>
      <div class="modal-card" v-else>
        <header class="modal-card-head title is-4">Confirm</header>
        <o-field horizontal class="mt-5 has-text-centered prompt">
          <span class="label-text"
            >If added user as admin, the user can access all other
            user/section/facility/space data. recommend to add user on section/facility
            setting as possible. do you still want to add admin user?</span
          >
        </o-field>

        <footer class="modal-card-foot mt-5">
          <div class="column is-4 is-offset-2">
            <button class="button is-rounded is-primary">
              <span @click.prevent="cancelAddAdmin(), $emit('close')">Cancel</span>
            </button>
          </div>
          <div class="column is-4 is-offset-1">
            <button
              class="button is-rounded is-dark"
              @click.prevent="addAdmin(userStore.userForm), $emit('close')"
            >
              <span>Add Admin ( Available: {{ usersLength }})</span>
            </button>
          </div>
        </footer>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { onMounted, ref, computed } from "vue";
import { User } from "@/stores/types.ts";

const userStore = useUserStore();

// Function
const confirmAdd = () => {
  userStore.isAddAdminConfirmed = true;
  console.log("Confirming Adding of Admin", userStore.isAddAdminConfirmed);
};

const addAdmin = (payload: User) => {
  console.log("Adding Admin", payload);
  userStore.addUser(payload);
  userStore.isAddAdminConfirmed = false;
};

const cancelAddAdmin = () => {
  userStore.showUserForm = false;
  console.log("Cancel Adding of Admin");
  userStore.userForm = {};
};

const usersLength = computed(() => {
  return userStore.users.length;
});

onMounted(() => {
  console.log("This is mounted");
});
</script>

<style scoped>
.prompt {
  width: 495px;
  height: 96px;
  margin-left: 4rem;
}
.modal-card {
  width: 100%;
  max-height: calc(100vh - 160px);
  overflow: auto;
  position: relative;
  background: white;
}

.modal-card-foot,
.modal-card-head {
  align-items: center;
  background-color: white;
  display: flex;
  flex-shrink: 0;
  justify-content: flex-start;
  padding: 20px;
  position: relative;
}
.modal-card-head {
  border-bottom: 1px solid white;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}
.modal-card-body {
  -webkit-overflow-scrolling: touch;
  background-color: #fff;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: auto;
  padding: 25px;
  margin-bottom: 0rem !important;
  display: inherit;
}
.modal-card-foot {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  border-top: 1px solid #dbdbdb;
  border-top: none !important;
  border-radius: 8px !important;
}
.modal-card-title {
  color: #363636;
  flex-grow: 1;
  flex-shrink: 0;
  font-size: 18px;
  line-height: 1;
  margin: 0;
  font-weight: 800;
}
.modal-card-foot .o-button:not(:last-child) {
  margin-left: 0.5em;
}
</style>
