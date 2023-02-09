import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { User, Role } from "@/stores/types";
import { colors } from "./config";
import { faker } from "@faker-js/faker";

export const useUserStore = defineStore("user", () => {
  faker.setLocale('de')

  // flags
  const mode = ref("edit");

  // state data
  const users = ref<Array<User>>([]);
  const selectedUser = ref<User | null>(null);
  const checkedUsers = ref([] as User);
  const userInfo = ref({} as User);
  const roles = ref<Array<Role>>([]);
  const isAddAdminConfirmed = ref(false);

  const showUserForm = ref(false);

  const getRoles = () => {
    const collection: Array<Role> = [];

    for (let k = 0; k < 8; k++) {
      const r = {} as Role;
      const rand = Math.floor(Math.random() * colors.length);

      r.uuid = faker.datatype.uuid();
      r.color = colors[rand];
      r.name = faker.name.jobArea();
      collection.push(r);
    }

    roles.value = collection;
  };

  const getUsers = (count = 20) => {
    console.log("=== STORE: getUsers ===");
    // faker or axios

    getRoles();

    for (let i = 0; i < count; i++) {
      const user = {} as User;
      //let roleList:Array<Role> = []

      const collection: Array<Role> = [];
      //Get random number of roles
      let nRoles = Math.floor(Math.random() * 3);

      user.uuid = faker.datatype.uuid();
      user.first_name = faker.name.firstName();
      user.last_name = faker.name.lastName();
      user.middle_name = faker.name.middleName();
      user.company_name = faker.company.companyName();
      user.email = faker.internet.email();
      user.mobile = faker.phone.number();
      user.city = faker.address.cityName();
      user.password = "password";
      for (let j = 0; j <= nRoles; j++) {
        collection.push(
          roles.value[Math.floor(Math.random() * roles.value.length)]
        );
      }

      //user.roles = roleList
      user.roles = collection;

      users.value.push(user);
    }
  };

  const addUser = () => {
    console.log("=== STORE: addUser ===", userInfo.value);
    userInfo.value.uuid = faker.datatype.uuid();
    users.value.unshift(userInfo.value);
    resetForm();
  };

  const updateUser = (payload: User) => {
    console.log("=== STORE: updateUser ===", userInfo.value);

    // get the user record to update
    const userNdx = users.value.findIndex(
      (item) => item.uuid === userInfo.value?.uuid
    );

    console.log("=== userNdx ===", userNdx);
    if (userNdx > -1) {
      users.value.splice(userNdx, 1, userInfo.value);
    }
    // resetForm()
  };

  const deleteUser = (payload: User) => {
    console.log(
      "=== STORE: deleteUser ===",
      JSON.stringify(selectedUser.value)
    );

    // find the user that we wanted to delete
    const userNdx = users.value.findIndex(
      (item) => item.uuid === selectedUser.value?.uuid
    );

    console.log("=== userNdx ===", userNdx);
    if (userNdx > -1) {
      users.value.splice(userNdx, 1);
    }
    resetForm();
  };

  const resetForm = () => {
    selectedUser.value = null;
    userInfo.value = {} as User;
    showUserForm.value = false;
  };

  const setSelectedUser = (payload: User) => {
    selectedUser.value = payload;
  };

  // ======================== COMPUTED ======================== //
  const getRandomUser = computed(() => {
    const index = faker.datatype.number({ min: 0, max: 19 });
    return users.value[index];
  });

  return {
    // flags
    mode,
    //state
    users,
    selectedUser,
    checkedUsers,
    userInfo,
    roles,
    isAddAdminConfirmed,

    // computed
    showUserForm,
    getRandomUser,

    // actions
    getUsers,
    addUser,
    updateUser,
    deleteUser,
    resetForm,

    //method
    setSelectedUser,

    getRoles,

    // getters
  };
});
