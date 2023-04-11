import { ref, computed, nextTick } from "vue";
import { defineStore } from "pinia";
import type { User, Role, Node } from "@/stores/types";
import { USER_GROUP } from "@/stores/types";
import { faker } from "@faker-js/faker/locale/ja";
import { useRoleStore } from "./roles";
import { useSpaceStore } from "./space";
import axios from "axios";

// axios API
// const apiURL = "http://localhost:5173/api";
// const apiENV = import.meta.env;
const apiURL = import.meta.env.VITE_API_URL;

console.log("apiURL...", apiURL);

const api = axios.create({
  baseURL: apiURL,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
})

export const useUserStore = defineStore("user", () => {

  const spaceStore = useSpaceStore()
  // ================================= FLAGS ======================== //
  const mode = ref("edit");
  const showUserForm = ref(false);
  const roleStore = useRoleStore()
  // ================================= END FLAGS ======================== //

  // ================================= STATE ======================== //
  const users = ref<Array<User>>([]);
  const assignees = ref<Array<User>>([]);
  const selectedUser = ref<User | null>(null);
  const checkedUsers = ref<Array<User>>([]);
  const userInfo = ref({} as User);
  const isAddAdminConfirmed = ref(false);
  const searchUserOption = ref("" || 1); //used to contain options selected for searching for a User
  const searchUser = ref("");
  // const thisUser = ref<User | null>(null)

  // ================================= END STATE ======================== //

  // ================================= METHODS ======================== //

  const addRolesToAssignees = async (param: Array<User>) => {
    await roleStore.getRoles()
    const users = param.map(usr => {
      /* const rand = faker.datatype.number({ min: 0, max: 2 })
      const collection: Array<Role> = [];
      for (let i = 0; i < rand; i++) {
        collection.push(
          roleStore.roles[Math.floor(Math.random() * roleStore.roles.length)]
        );
      } */
      usr.roles = []
      return usr
    })
    return users
  }

  const getUsers = async () => {
    console.log("=== STORE: getUsers ===");

    try {
      const response = await api.get('/v1/users')
      users.value = await addRolesToAssignees(response.data.data)
    } catch (error) {
      console.log("Success fetch" + JSON.stringify(error))
    }
  };
  const resetForm = () => {
    selectedUser.value = null;
    userInfo.value = {} as User;
    showUserForm.value = false;
  };
  const setSelectedUser = (payload: User) => {
    selectedUser.value = payload;
  };

  // ========================== API REQUESTS ==============================================//

  const addUser = async (payload: User) => {
    const email = payload.email.split("@");
    payload.first_name = email[0];
    payload.last_name = email[0];
    payload.password = "password";

    const user = await (await api.post("/cas/users", payload)).data;

    users.value.unshift(user.data);
    console.log("User added:", user.data);
  }

  const bulkAddUsers = async (payload: Array<User>) => {
    const ids: Array<string> = []
    const postRequests = payload.map(user => {
      const usr = {} as User
      usr.uuid = user.uuid
      usr.first_name = user.first_name
      usr.last_name = user.last_name
      usr.email = user.email
      usr.folder_uuid = spaceStore.currentNode?.id
      usr.password = "temp1234"
      return api.post('/cas/users', usr)
    });
    try {
      const response = await axios.all(postRequests)
      response.forEach(res => ids.push(res.data.data.id))
      await assignToFolder(ids)
    } catch (error) {
      console.log("Post request fail:" + error);
    }
  };

  const updateUser = async (payload: User) => {
    console.log("=== STORE: updateUser ===", payload);
    payload.group_id = 1;
    const user = await (
      await api.put("/v1/users/" + payload.uuid + "/", payload)
    ).data;

    console.log("=== userNdx ===", user);
  }

  const deleteUser = async (payload: User) => {
    // finds selected User in user array to be removed
    const userIndex = users.value.findIndex(
      (item) => item.uuid === payload.uuid
    );
    console.log("User Index", userIndex, payload);

    console.log("User response ", payload);
    if (userIndex > -1) {
      const user = await (
        await api.delete("/v1/users", { params: { uuid: payload.uuid } })
      ).data.data;

      // removes deleted user from checkedUsers array
      users.value.splice(userIndex, 1);
      // checkedUsers.value.splice(response, 1);
      console.log("Successfully Deleted User");
    }
  };


  const bulkDeleteUsers = async (payload: Array<string>) => {
    const deleteRequests = payload.map(user => api.delete(`/v1/users/${user}`));
    try {
      const response = await axios.all(deleteRequests);
      console.log("Delete request users:" + JSON.stringify(response));
    } catch (error) {
      console.log("Delete request fail:" + error);
    }
  };

  const assignToFolder = async (ids: Array<string>) => {
    const postRequests = ids.map((id) => {
      const data = {
        user_id: id,
        folder_uuid: spaceStore.currentNode?.id ? spaceStore.currentNode.id : ''
      }
      return api.post(`/v1/folder_users`, data)
    });
    try {
      const response = await axios.all(postRequests);
      console.log("Assigned to folder:" + JSON.stringify(response));
    } catch (error) {
      console.log("Assignment failed:" + error);
    }
  };

  // const getUserByUuid = async(user: User) => {
  //   console.log('getUserByUuid()', user)
  //   try {
      
  //     const res = await api.get(`/users/${user.uuid}`)
  //     console.log('res', res)

  //     if(res.status === 200){
  //       thisUser.value = res.data.data[0]
  //       console.log('thisUser.value', thisUser.value)

  //     }else{
  //       console.error('Error in getting user by uuid')
  //     }

  //   } catch (error) {
  //     console.error('Error ' + error)
  //   }
  // }

  // ========================== END OF API REQUESTS ==============================================//

  // ========================== GETTERS ========================== //

  const filteredUsers = computed(() => {
    if (searchUser.value !== "") {
      return users.value.filter((user) => {
        if (searchUserOption.value === 1) {
          return (
            user.first_name === searchUser.value ||
            user.last_name === searchUser.value
          );
        } else if (searchUserOption.value === 2) {
          return user.company_name === searchUser.value;
        }
      });
    } else {
      return users.value;
    }
  });
  // ========================== END OF GETTERS ========================== //

  return {
    // flags
    mode,

    //state
    users,
    // thisUser,
    selectedUser,
    checkedUsers,
    userInfo,
    isAddAdminConfirmed,
    searchUserOption,
    searchUser,

    // computed
    showUserForm,

    // actions
    getUsers,
    // getUserByUuid,
    addUser,
    bulkAddUsers,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    resetForm,

    //method
    setSelectedUser,
    filteredUsers,

    // getters
  };
});

//export const userStore = useUserStore()