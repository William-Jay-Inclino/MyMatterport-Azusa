<template>
  <main>
    <h1 class="has-text-primary">User Detail</h1>

    <o-field label="Firstname" style="width: 300px">
      <o-input v-model="userStore.userForm.first_name" data-test="input-first-name">
      </o-input>
    </o-field>

    <o-field label="Lastname">
      <o-input v-model="userStore.userForm.last_name" data-test="input-last-name">
      </o-input>
    </o-field>

    <o-field label="Email">
      <o-input v-model="userStore.userForm.email" data-test="input-email"> </o-input>
    </o-field>

    <o-field label="Mobile">
      <o-input v-model="userStore.userForm.mobile" data-test="input-mobile"> </o-input>
    </o-field>

    <o-button @click="saveClick()" data-test="button-save">Save</o-button>
    <o-button @click="cancelClick()" data-test="button-cancel">Cancel</o-button>
    <o-button
      v-show="userStore.mode === 'edit'"
      @click="deleteClick()"
      data-test="button-delete"
      >Delete</o-button
    >
  </main>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { onMounted, onUnmounted, onBeforeUpdate } from "vue";

// reactive data

// const table = ref();
const userStore = useUserStore();

// event handlers
const saveClick = () => {
  console.log("== DISPATCH: saveClick ===", userStore.mode);
  if (userStore.mode == "add") {
    userStore.addUser();
  } else {
    userStore.updateUser();
  }
};

const deleteClick = () => {
  console.log("== DISPATCH: deleteClick ===");
  userStore.deleteUser();
};

const cancelClick = () => {
  console.log("== DISPATCH: cancelClick ===");
  userStore.resetForm();
};

// lifecycle hooks function
onMounted(() => {
  console.log("=== onMounted === ");
});

onBeforeUpdate(() => {
  console.log("=== beforeUpdate === ");
});

onUnmounted(() => {
  console.log("=== onUnmounted === ");
});
</script>
