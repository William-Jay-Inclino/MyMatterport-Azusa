import { useUserStore } from "@/stores/user";
import { defineStore } from "pinia";
import { useSpaceStore } from "@/stores/space";
import type { Nodes, SpaceUnit, User } from "./types";
import { ref, computed } from "vue";
import { faker } from "@faker-js/faker";


const spaceStore = useSpaceStore();
const userStore = useUserStore();

export const useSessionStore = defineStore("session", () => {
    faker.setLocale('de')
    // ==============================        FLAGS        ==============================

  // ==============================        STATE        ==============================
  const authUser = ref({} as User);
  const authErrorMessage = ref("");

  // ==============================      END STATE      ===============================

  // ==============================       GETTERS       ===============================

  const isLoggedIn = computed(() => {
    console.log("Store Getter", authUser.value);
    return authUser.value?.uuid !== undefined;
  });

  // ==============================     END GETTERS     ===============================

  // ==============================       WATCHERS       ===============================

  // ==============================     END WATCHERS     ===============================

  // ==============================       METHODS       ================================

  // if localstorage is not set properly then get again the space tree from api

  const init = () => {
    console.log("sessionStore.init()");

    const selectedTreeItemLocal = localStorage.getItem("selectedTreeItem");
    const treeNodesLocal = localStorage.getItem("treeNodes");
    const spaceUnitTreeLocal = localStorage.getItem("spaceUnitTree");

    if (!selectedTreeItemLocal || !treeNodesLocal || !spaceUnitTreeLocal) {
      emptyLocalStorage();
      spaceStore.init();
      return;
    }

    if (
      !isJsonString(selectedTreeItemLocal) ||
      !isJsonString(treeNodesLocal) ||
      !isJsonString(spaceUnitTreeLocal)
    ) {
      emptyLocalStorage();
      spaceStore.init();
      return;
    }

    // if local storage is properly set
    console.log("local storage is properly set");
    const selectedTreeItem = JSON.parse(selectedTreeItemLocal);
    const treeNodes = JSON.parse(treeNodesLocal);
    const spaceUnitTree = JSON.parse(spaceUnitTreeLocal);

    if (!spaceStore.selectedTreeItem) {
      spaceStore.selectedTreeItem = selectedTreeItem;
    }

    if (!spaceStore.treeNodes) {
      spaceStore.treeNodes = treeNodes;
    }

    if (!spaceStore.spaceUnitTree) {
      spaceStore.spaceUnitTree = spaceUnitTree;
    }
  };

  const isJsonString = (str: any) => {
    try {
      JSON.parse(str);
    } catch (error) {
      return false;
    }
    return true;
  };

  const emptyLocalStorage = () => {
    console.log("emptyLocalStorage()");

    localStorage.removeItem("selectedTreeItem");
    localStorage.removeItem("treeNodes");
    localStorage.removeItem("spaceUnitTree");
  };

  const loginUser = (payload: User) => {
    authErrorMessage.value = "";
    console.log("Finding User", payload);
    const user = userStore.users.find(
      (item) =>
        item.email === payload.email && item.password === payload.password
    );
    console.log("Found User", user);
    if (user) {
      authUser.value = user;
    } else {
      console.log("Incorrect Email/Password, please try again");
      authErrorMessage.value = "Invalid Email or Password, please try again";
    }
  };

  const logoutUser = () => {
    console.log("User Logging Out", authUser);
    authUser.value = {};
    userStore.userInfo = {};
    console.log("User Logged Out");
  };

  // ==============================     END METHODS    ===============================

  return {
    // Getter
    isLoggedIn,
    authErrorMessage,

    // State
    authUser,

    // Method
    loginUser,
    init,
    logoutUser,
  };
});
