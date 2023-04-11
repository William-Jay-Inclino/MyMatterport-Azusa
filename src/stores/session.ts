import { useUserStore } from "@/stores/user";
import { defineStore } from "pinia";
import { useSpaceStore } from "@/stores/space";
import type { Nodes, User, Node, USER_GROUP, ISession } from "./types";
import { ref, computed } from "vue";
import { faker } from "@faker-js/faker";
import localForage from "localforage";
import axios from "axios";

// const auth = ref({})

// axios API
// const apiURL = "http://localhost:5173/api" + "/cas";
const apiURL = import.meta.env.VITE_API_URL + "/cas"
// const apiENV = import.meta.env;
console.log("apiURL...", apiURL);

const api = axios.create({
  baseURL: apiURL,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
});

export const useSessionStore = defineStore("session", () => {
  // faker.setLocale("de");
  faker.setLocale(import.meta.env.VITE_APP_LANG)
  // ==============================        FLAGS        ==============================

  // ==============================        STATE        ==============================


  const spaceStore = useSpaceStore();
  const userStore = useUserStore();
  const thisUser = ref<User | null>(null);
  const authErrorMessage = ref("");
  const session = ref<ISession>();

  // @ts-ignore
  // const tempAuthUser = ref<User>()

  // ==============================      END STATE      ===============================

  // ==============================       GETTERS       ===============================

  const isLoggedIn = computed(() => session.value);
  const authUser = computed( () : User | null => session.value ? session.value.auth.user : null)

  const userRole = computed( () => {
    if(session.value){
      // @ts-ignore
      return Object.values(session.value.auth.user_groups)[0]
    }
  })

  const sessionTicket = computed( () => {
    if(session.value){
      return session.value.ticket
    }
  })

  

  // ==============================     END GETTERS     ===============================

  // ==============================       METHODS       ================================

  // if localstorage is not set properly then get again the space tree from api

  const init = async () => {
    console.log("sessionStore.init()");

    try {
      const treeNodesLocal = await localForage.getItem("treeNodes")
      const currentNodeLocal = await localForage.getItem("currentNode");
      
      // treeNodes or currentNode is not set in local storage
      if (!treeNodesLocal || !currentNodeLocal) {
        console.log('treeNodesLocal or currentNodeLocal or categories is not set in localForage')
        // await localForage.clear() 
        await localForage.removeItem('treeNodes')
        await localForage.removeItem('currentNode')
        if(authUser.value){
          // await removeUsers()
          await spaceStore.init(authUser.value)
        }
        return
      }

      if (!spaceStore.treeNodes) {
        // @ts-ignore
        spaceStore.treeNodes = JSON.parse(treeNodesLocal) as Nodes;
      }

      if (!spaceStore.currentNode) {
        // @ts-ignore
        spaceStore.currentNode = JSON.parse(currentNodeLocal) as Node;
      }



    } catch (error) {
      console.error('Error in init(): ', error)
    }

  };

  // remove users that are created from test 
  const removeUsers = async () => {

    try {

      for (let user of userStore.users) {
        if (user.id === 1 || user.id === 2) continue // dont delete admin and the user you added; only delete users that are created during test automation
        const res = await api.delete("/users/", { params: { uuid: user.uuid } })
        console.log('res', res)
        if (res.status === 200) {
          console.log('Successfully deleted user in db')
          const indx = userStore.users.findIndex(i => i.id === user.id)
          if (indx) {
            userStore.users.splice(indx, 1)
            console.log('Deleted user from userStore.users array')
          }
        } else {
          console.log('Error: user not deleted in db')
        }
      }

    } catch (error) {
      console.error('Error: ' + error)
    }

  }

  // use this during navigation and not during login
  const validateSession = async (payload: any) => {
    console.log("Ticket Payload", payload)
    const session = await (await api.get("/validate/", payload));
    console.log("Ticket Validated: ", session)
  }

  const deleteSession = async (payload: any) => {
    console.log("Ticket", payload.value)
    const session = await (await api.delete("/tickets/" + payload.value)).data;
    console.log("Delete Validated Ticket: ", session)
  }

  const loginUser = async (payload: User) => {
    authErrorMessage.value = "";
    console.log("Finding User", payload);

    const response = await (await api.post("/tickets", payload)).data;

    console.log("response", response)
    if (response.status === "success") {
      session.value = response.data
      await localForage.setItem("session", JSON.stringify(session.value))
      return true
    } else {
      console.log("Incorrect Email/Password, please try again");
      authErrorMessage.value = "Invalid Email or Password, please try again";
      return false 
    }

    
  };


  const logoutUser = async() => {
    console.log("User Logging Out");
    await deleteSession(sessionTicket)
    thisUser.value = {} as User;
    session.value = undefined;
    await localForage.clear()
    // localStorage.removeItem("session")
    // localStorage.removeItem("thisUser")
    console.log("User Logged Out");
  };

  // ==============================     END METHODS    ===============================

  return {
    // Getter
    isLoggedIn,
    authErrorMessage,
    userRole,

    // State
    authUser,
    thisUser,
    session,
    sessionTicket,

    // Method
    loginUser,
    init,
    logoutUser,
    deleteSession,

    // tempUsers
  };
});
