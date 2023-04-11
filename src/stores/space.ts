import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import {
  TABLE_VIEW,
  // SPACE_UNIT_TYPE,
  type Facility,
  type TagColor,
  COLOR,
  type Node,
  type Role,
  type AlertModalDetail,
  THEME,
} from "@/stores/types";
import {
  type Space,
  type Folder,
  type Folders,
  FOLDER_TYPE,
  // SpaceUnit,
  type SpaceUnitUser,
  type Nodes,
  type Category,
  // type SubCategory,
  type Section,
  type CategoryForm,
  // type SubCategoryForm,
  type RoleForm,
  type User,
} from "@/stores/types";
// import { faker } from "@faker-js/faker/locale/ja";
import { faker, Sex } from '@faker-js/faker';
import dayjs from "dayjs";
import { validURL } from "../utils/validate";
import type { ConnectOptions } from "public/bundle/sdk";
import { config, model_sids, colors } from "./config";
import { convertToCssRgb } from "@/utils/color";
import { useUserStore } from "./user";
import { useRoleStore } from "./roles";
import { useSessionStore } from "./session";
import localForage from "localforage";
import axios from "axios";
import { useCategoryStore } from "./categories";

// axios API
const apiURL = import.meta.env.VITE_API_URL + "/v1";
// const apiENV = import.meta.env;
console.log("apiURL...", apiURL);

const api = axios.create({
  baseURL: apiURL,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
});

// console.log('import.meta.env.VITE_APP_LANG', import.meta.env.VITE_APP_LANG)
faker.setLocale(import.meta.env.VITE_APP_LANG)

export const useSpaceStore = defineStore("space", () => {
  // ==============================        TYPES        ==============================
  interface SpaceUnitFormError {
    error_name: boolean;
    error_showcase_url: boolean;
  }

  // ==============================      END TYPES      ==============================

  // ==============================        FLAGS        ==============================

  const tableView = ref(TABLE_VIEW.LIST); // table or card view
  const isCardModalActive = ref(false); // SpaceSettingDetailMain.vue
  const isSpaceUnitModalActive = ref(false); // SpaceUnitModalView.vue
  const isAlertModalActive = ref(false); // CommonAlertModal.vue
  // const now = dayjs();
  const userStore = useUserStore()
  const categoryStore = useCategoryStore()
  const roleStore = useRoleStore()
  const sessionStore = useSessionStore()
  // ==============================      END FLAGS      ==============================

  // ==============================        STATE        ==============================

  const appKey = config.appKeyMp as unknown as ConnectOptions;

  const owner = ref({} as User)

  const folders = ref<Folders>()
  // const spaces = ref<Array<Space>>([])

  const treeConfig = ref({
    roots: ["root"],
  });
  const treeNodes = ref<Nodes>();
  const currentNode = ref<Node>();
  // const spaceUnitTree = ref<{ root: Folder }>(); // SpaceTree.vue
  const nodeChildrenList = ref<Array<string>>([]);
  const spaceUnitForm = ref<Folder>({
    // SpaceUnitDetail.vue
    owner_uuid: '',
    parent_uuid: '',
    type_: FOLDER_TYPE.SECTION,
    uuid: "",
    name: "",
    children: [],
    users: []
    // created_on: now.format("YYYY/MM/DD"),
  });

  const categoryFormData = ref<CategoryForm>({
    action: "",
    tag_category: {
      uuid: "",
      name: "",
      color: { name: COLOR.MAROON, rgb: { r: 0.5, g: 0, b: 0 } },
      subcategories: []
    },
  });
  const subCategoryFormData = ref<CategoryForm>({
    action: "",
    tag_category: {
      uuid: "",
      name: "",
      color: { name: COLOR.MAROON, rgb: { r: 0.5, g: 0, b: 0 } },
      subcategories: []
    },
  });
  const roleFormData = ref<RoleForm>({
    action: "",
    role: {
      uuid: "",
      name: "",
      color: { name: COLOR.MAROON, rgb: { r: 0.5, g: 0, b: 0 } },
      categories: [],
    },
  });

  const spaceUnitFormError = ref<SpaceUnitFormError>({
    error_name: false,
    error_showcase_url: false,
  });
  const spaceUnitUserList = ref<Array<SpaceUnitUser>>([]); // SpaceUnitUsers.vue
  const spaceUnitUser = ref<SpaceUnitUser>({
    uuid: "",
    email: "",
    name: "",
    first_name: "",
    last_name: "",
    roles: [],
  }); // SpaceUnitAddUsers.vue
  const spaceAlertModalDetail = ref<AlertModalDetail>({
    message: "",
    theme: THEME.INFO,
    can_confirm: false
  })
  const selectedColor = ref<TagColor>()
  const spaceUnitImportedList = ref<Array<SpaceUnitUser>>([]);
  const isMobileSidebarActive = ref(false);
  const isSpaceAddAssigneeActive = ref(false);
  const isSpaceAddTagActive = ref(false);
  const isSpaceAddSubcategoryActive = ref(false);
  const isSpaceAddRoleActive = ref(false);
  const isEditingSpaceNode = ref(false);

  // ==============================      END STATE      ==============================

  // ==============================       COMPUTED      ==============================

  const currentNodeUuid = computed(() => currentNode.value?.id);

  const nodeChildren = computed((): Array<Node> => {
    // table and card items
    if (!currentNode.value || !currentNode.value.children) return [];

    const children: Array<Node> = [];
    currentNode.value.children.forEach((i) =>
      children.push(treeNodes.value![i])
    );
    return children;
  });

  const spaceUnitFormType = computed(
    (): FOLDER_TYPE => spaceUnitForm.value.type_
  ); 
  
  const modelSid = computed(() => {
    if (currentNode.value && currentNode.value.type_ === FOLDER_TYPE.SPACE) {
      const space = currentNode.value.data as Space;
      return space.space_sid;
    }
    return null;
  });

  const parentNode = computed((): Node | null => {
    if (!treeNodes.value) {
      console.log("treeNodes.value is undefined");
      return null;
    }

    if (!currentNode.value) {
      console.log("currentNode.value is undefined");
      return null;
    }

    if (!currentNode.value.parent) {
      console.log("currentNode.value.parent_uuid is undefined");
      return null;
    }

    return treeNodes.value[currentNode.value.parent];
  });

  const spaceUnitLabel = computed( () => spaceUnitForm.value.type_.charAt(0).toUpperCase() + spaceUnitForm.value.type_.slice(1))
    //@ts-ignore
  const spaceUnitEditLabel = computed( () => currentNode.value.type_.charAt(0).toUpperCase() + currentNode.value?.type_.slice(1))

  // ==============================     END COMPUTED     ==============================

  // ==============================        WATCH        ==============================

  // update localstorage selectedTreeItem and treeNodes
  watch(currentNodeUuid, async (payload) => {

    /* 
    problem:
      -if selected node's state is closed, it will not update the class state (active-node = red text), otherwise it will update
      -if the parent / ancestor of the selected node is closed, current node is hidden. It will not also update the class state

    solution: 
      -should also open the state of the node after setting the currentNode
      -open node state from child to root. In other words, open all parent/ancestor if you are a descendant

    algorithm:
      0. set current node state to open if it is closed
      1. get the parent id of the selected node 
      2. find the parent node in treeNodes array
      3. set the (x = parent) node state to open
      4. Go to step 1 if x's parent id is not null. If parent id is null meaning it is the root
      5. end
    */

    if (!currentNode.value || !treeNodes.value) return

    if (currentNode.value.state && !currentNode.value.state.opened) {
      currentNode.value.state.opened = true
    }

    let parentId = currentNode.value.parent
    while (parentId) {
      console.log('__parentId', parentId)
      let parent = treeNodes.value[parentId]
      parent.state = { opened: true }
      parentId = treeNodes.value[parentId].parent
    }

    await localForage.setItem("currentNode", JSON.stringify(currentNode.value));
    await localForage.setItem("treeNodes", JSON.stringify(treeNodes.value));
  });

  // dynamically add data prop base on space unit type in <SpaceUnitDetail>
  watch(spaceUnitFormType, (payload: FOLDER_TYPE) => {
    if (payload === FOLDER_TYPE.SPACE) {
      const space = {} as Space;
      space.space_url = "";
      spaceUnitForm.value.json_data = space;
    }
  });
  // reset space unit modal when it is close
  watch(isSpaceUnitModalActive, (payload: boolean) => {
    if (!payload) {
      resetSpaceUnitModal();
    }
  });

  // ==============================      END WATCH      ==============================

  // ==============================       METHODS      ==============================

  const init = async (authUser: User) => {
    owner.value = authUser
    console.log("spaceStore.init()", authUser);
    await generateTree();
    await getSpaceTree();
    setTreeNodes();
  };

  const getSpaceTree = async () => {
    console.log("getSpaceTree()");
    const data = await (await api.get(`/trees/${owner.value.uuid}`)).data.data;
    console.log('spaceTree', data)
    folders.value = data
  };

  const generateTree = async () => {
    const root_uuid = await checkIfOnlyRootExists()
    if (root_uuid !== "") {
      const model_urls = ["https://my.matterport.com/show/?m=f58wynh3kDh","https://my.matterport.com/show/?m=oFndTgraRhM","https://my.matterport.com/show/?m=Msfg36od5J3"]
      const section_uuids = []
      const facility_uuids = []
      const userId = owner.value.uuid

      const user = await sessionStore.authUser
      //Add Section
      //@ts-ignore
      const section:Folder = {
        name: faker.address.cityName(),
        type_: FOLDER_TYPE.SECTION,
        parent_uuid: root_uuid,
        owner_uuid: userId
      }

      const section_id = await addFolder(section)
      section_uuids.push(section_id)

      //Add Facilities
      if (section_uuids.length !== 0) {
        for (let j = 0; j < section_uuids.length; j++) {
          for (let m = 0; m < 2; m++) {
            //@ts-ignore
            const facility:Folder = {
              name: faker.address.cityName(),
              type_: FOLDER_TYPE.FACILITY,
              parent_uuid: section_uuids[j],
              owner_uuid: userId
            }
      
            const facility_id = await addFolder(facility)
            facility_uuids.push(facility_id)
          }
        }
      }

      if (facility_uuids.length !== 0) {
        for (let k = 0; k < facility_uuids.length; k++) {
          for (let n = 0; n < 2; n++) {
            const url = model_urls[Math.floor(Math.random() * model_urls.length)]
            const model = url.split("/?m=")
            //@ts-ignore
            const space:Space = {
              folder_uuid: facility_uuids[k],
              owner_uuid: userId,
              space_url: url,
              space_sid: model[1],
              space_image: faker.image.imageUrl(640, 480, "city", true),
              space_name: faker.address.city()
            }
  
            try {
              const data = await (await api.post("/spaces.json/", space)).data.data;
              console.log("response: ", JSON.stringify(data));
            } catch (error) {
              console.error('saveSpace() Error: ' + error)      
            }
          }
        } 
      }
    }
  }

  const checkIfOnlyRootExists = async () => {
    try {
      const response = await api.get('/folders')
      //Check if there is only one folder in the db. If yes, check if it is the root folder
      if (response.data.data.length === 1) {
        if (response.data.data[0].type_ === "ROOT") {
          console.log("Only ROOT folder remains"+ JSON.stringify(response.data.data[0].type_))
          return response.data.data[0].uuid
        }
      }else{
        console.log("There are already folders in the db"+ JSON.stringify(response.data.data[0].type_))
        return ""
      }
      
    } catch (error) {
      console.error("Failed to fetch folders "+ error)
    }
  }

  // === API CALLS ===
  const getFoldersByOwnerId = async (ownerId: string) => {
    console.log("getFoldersByOwnerId()");
    const data = await (await api.get("/folders.json")).data.data;
    console.log('data', data)
    console.log("response: ", JSON.stringify(data));

    folders.value = data;
  };

  const addFolder = async (payload: Folder) => {
    console.log("addFolder", payload);
    const data = await (await api.post("/folders.json/", payload)).data.data;
    console.log("response: ", JSON.stringify(data));
    return data.uuid
    // folders.value.unshift(data);
  };

  const updateFolder = async (payload: Folder) => {
    console.log("updateFolder", payload);
    const data = await (
      await api.put("/folders/" + payload.uuid + ".json/", payload)
    ).data.data;
    console.log("response: ", JSON.stringify(data));
    return data.uuid
  };


  const saveFolder = async (payload: Folder) => {
    console.log("saveFolder()");

    const folderData = { ...payload }
    if (folderData.json_data) {
      // @ts-ignore
      folderData.json_data = JSON.stringify(folderData.json_data)
    }

    if (folderData.uuid === '') {
      // @ts-ignore
      delete folderData.uuid
    }

    // UPDATE if uuid is passed
    if (folderData.uuid) {
      return updateFolder(folderData)
    } else {
      return addFolder(folderData)
    }
  };

  const saveSpace = async (payload: Folder) => {
    console.log("saveSpace", payload)

    const spaceData = payload.json_data as Space

    const space = {
      folder_uuid: payload.parent_uuid,
      space_sid: spaceData.space_sid,
      space_name: payload.name,
      space_url: spaceData.space_url,
      owner_uuid: payload.owner_uuid
    }

    try {
      const data = await (await api.post("/spaces.json/", space)).data.data;
      console.log("response: ", JSON.stringify(data));
      return data.uuid
    } catch (error) {
      console.error('saveSpace() Error: ' + error)
    }

  };

  const deleteAllFolders = async () => {
    for (let x in treeNodes.value) {
      if (x === 'root') continue
      console.log('x', x)
      const data = await (await api.delete("/folders.json/", { params: { uuid: x } })).data.data;
      console.log("response: ", JSON.stringify(data));
    }
    await init(owner.value)
  }

  const deleteFolder = async (uuid: string) => {
    console.log(`Folder uuid is: ${uuid}`)
    if(currentNode.value?.children?.length === 0){
      const cats = await categoryStore.getCategoriesByUnitId(uuid)
      if (cats.length > 0) {
        console.log(`Cannot delete. Has categories: ${cats.length}`)
        spaceAlertModalDetail.value = {
          message: "Cannot delete folder! Folder still contains important data",
          theme: THEME.INFO,
          can_confirm: false
        }
        isAlertModalActive.value = true
      } else {
        console.log(`Cannot delete. Has categories: ${cats.length}`)
        spaceAlertModalDetail.value = {
          message: "Are you sure you want to delete this folder? This action cannot be reversed!",
          theme: THEME.DANGER,
          can_confirm: true,
          action: async function () {
            if (currentNode.value?.type_ === FOLDER_TYPE.SPACE) {
              const data = await (await api.delete("/spaces.json/", {params: {uuid: uuid}})).data.data;
              console.log("Deleted space: ", JSON.stringify(data));
            }else{
              const data = await (await api.delete("/folders.json/", {params: {uuid: uuid}})).data.data;
              console.log("response: ", JSON.stringify(data));
            }
            console.log("You deleted this folder!")
            isAlertModalActive.value = false
            isSpaceUnitModalActive.value = false
            isCardModalActive.value = false
            await init(owner.value)
          }
        }
        isAlertModalActive.value = true
      }
    }else{
      console.log(`Cannot delete. Has Children`)
      spaceAlertModalDetail.value = {
        message: "Cannot delete folder! Folder has Sections and Facilities",
        theme: THEME.DANGER,
        can_confirm: false
      }
      isAlertModalActive.value = true
    }
  }

  const setCurrentNode = (payload: Node) => {
    console.log('setCurrentNode()')

    currentNode.value = payload
  };

  const saveSpaceUnitUser = async () => {
    console.log("saveSpaceUnitUser()", spaceUnitUser.value);

    const email = spaceUnitUser.value.email.split("@");
    const name = email[0].split(".")
    spaceUnitUser.value.first_name = name[0];
    spaceUnitUser.value.last_name = name[1];
    spaceUnitUser.value.roles = [];


    spaceUnitUser.value.uuid = faker.datatype.uuid();
    spaceUnitUser.value.password = faker.company.bsNoun()

    const user = { ...spaceUnitUser.value };
    spaceUnitUserList.value.push(user);
    spaceUnitImportedList.value.push(user);

    spaceUnitUser.value.uuid = "";
    spaceUnitUser.value.email = "";
    spaceUnitUser.value.first_name = "";
    spaceUnitUser.value.last_name = "";
    spaceUnitUser.value.password = "";

    console.log("spaceUnitUserList", spaceUnitUserList.value);
  };

  const saveSpaceUnit = async () => {
    console.log("saveSpaceUnit()");
    await roleStore.getRoles()

    if (!currentNode.value) {
      console.log("currentNode is undefined");
      return;
    }

    if (!canSaveSpaceUnit()) {
      console.log("Can't Save Space Unit");
      return;
    }
    console.log("Can Save Space Unit");

    if (!treeNodes.value) {
      console.log("treeNodes.value is undefined");
      return;
    }

    if (currentNode.value.type_ !== FOLDER_TYPE.ROOT && currentNode.value.id) {
      // open node
      treeNodes.value[currentNode.value.id].state = { opened: true };
    } else {
      treeNodes.value["root"].state = { opened: true };
    }

    spaceUnitForm.value.parent_uuid = currentNode.value.folder_uuid;
    spaceUnitForm.value.children = [];

    if (spaceUnitForm.value.type_ === FOLDER_TYPE.SPACE) {
      const space = spaceUnitForm.value.json_data as Space;
      const showcase_url = space.space_url.split("/?m=");
      space.space_sid = showcase_url[1];
      space.space_image = faker.image.imageUrl(640, 480, "city", true);
      spaceUnitForm.value.json_data = space;
    }

    //NOTE: The Users table must have a folder_uuid otherwise this data will not stay after the user
    //exits the browser.
    const userList: Array<User> = spaceUnitImportedList.value.map(usr => {
      const list = {} as User
      list.uuid = usr.uuid
      list.first_name = usr.first_name
      list.last_name = usr.last_name
      list.email = usr.email
      list.password = usr.password ? usr.password : 'password'
      return list
    })
    //API call to bulk add users
    userStore.bulkAddUsers(userList)
    spaceUnitImportedList.value = [];
    spaceUnitUserList.value = []

    console.log("spaceUnitForm.value", spaceUnitForm.value);

    let folderId = ''

    if (spaceUnitForm.value.type_ === FOLDER_TYPE.SPACE) {
      folderId = await saveSpace(spaceUnitForm.value)
    } else {
      folderId = await saveFolder(spaceUnitForm.value)
    }


    if (!currentNode.value.children) {
      console.log(
        "🚀 ~ file: space.ts:319 ~ saveSpaceUnit ~ currentNode.value.children is undefined",
        currentNode.value.children
      );
      return;
    }
    spaceUnitForm.value.uuid = folderId

    //Temporary solution while waiting for sir Neil to add this column in users/assignee tables
    spaceUnitForm.value.users = spaceUnitImportedList.value.map(u => {
      u.folder_uuid = spaceUnitForm.value.uuid
      return u
    })
    currentNode.value.children.unshift(spaceUnitForm.value.uuid);
    addToTreeNodes({
      parent: currentNode.value,
      space_unit: spaceUnitForm.value,
    });

    isSpaceUnitModalActive.value = false;
  };

  // insert the newly added space unit to children array under it's parent node
  const addToTreeNodes = async (payload: { parent: Node, space_unit: Folder }) => {
    console.log("addToNode()", payload);
    if (!treeNodes.value) {
      console.log("treeNodes is undefined");
      return;
    }

    console.log("currentNode.value", currentNode.value);

    if (payload.parent.type_ === FOLDER_TYPE.ROOT) {
      console.log("payload.parent.type is ", FOLDER_TYPE.ROOT);
      // selected item is Root
      console.log("Node added to root children");
      treeNodes.value[payload.space_unit.uuid] = {
        text: "",
        folder_uuid: payload.space_unit.uuid,
        parent_uuid: payload.space_unit.parent_uuid,
        owner_uuid: payload.space_unit.owner_uuid,
        name: `${payload.space_unit.name}`,
        children: [],
        type_: payload.space_unit.type_,
        // created_on: payload.space_unit.created_on,
        data: payload.space_unit.json_data,
        users: payload.space_unit.users,
        state: {
          opened: true,
        },
      };
      return;
    }

    for (const key in treeNodes.value) {
      console.log("key", key);
      if (key === payload.parent.id) {
        console.log("Added to treeNodes", payload.space_unit);

        treeNodes.value[payload.space_unit.uuid] = {
          text: "",
          folder_uuid: payload.space_unit.uuid,
          parent_uuid: payload.space_unit.parent_uuid,
          owner_uuid: payload.space_unit.owner_uuid,
          name: `${payload.space_unit.name}`,
          children: [],
          type_: payload.space_unit.type_,
          // created_on: payload.space_unit.created_on,
          data: payload.space_unit.json_data,
          users: payload.space_unit.users,
          state: {
            opened: true,
          },
        };

        break;
      }
    }

    await localForage.setItem("treeNodes", JSON.stringify(treeNodes.value));
  };

  // validation before saving spacec unit
  const canSaveSpaceUnit = () => {
    let canSave = true;
    if (spaceUnitForm.value.name.trim() === "") {
      // no space unit name
      console.log("No space unit name");
      spaceUnitFormError.value.error_name = true;
      canSave = false;
    } else {
      spaceUnitFormError.value.error_name = false;
    }

    if (spaceUnitForm.value.type_ === FOLDER_TYPE.SPACE) {
      const space = spaceUnitForm.value.json_data as Space;
      if (space.space_url.trim() === "" || !validURL(space.space_url)) {
        // no showcase url; invalid URL
        console.log("No showcase url");
        spaceUnitFormError.value.error_showcase_url = true;
        canSave = false;
      } else {
        spaceUnitFormError.value.error_showcase_url = false;
      }
    }

    return canSave;
  };

  const resetSpaceUnitModal = () => {
    console.log("resetSpaceUnitModal()");

    spaceUnitUserList.value = [];

    // reset spaceUnitForm
    const x = {} as Folder;
    x.name = "";
    x.children = [];
    x.type_ = FOLDER_TYPE.SECTION;
    x.uuid = "";
    x.owner_uuid = ''
    spaceUnitForm.value = x

    spaceUnitFormError.value = {} as SpaceUnitFormError;

    // ------
  };

  const setTreeNodes = () => {
    console.log("setTreeNodes()");

    if (!folders.value) {
      console.log('folders is undefined')
      return
    }

    if (!folders.value[FOLDER_TYPE.ROOT]) {
      console.log(`${FOLDER_TYPE.ROOT} is undefined`)
      return
    }

    console.log('folders.value[FOLDER_TYPE.ROOT]', folders.value[FOLDER_TYPE.ROOT])

    const rootJsonData = getJsonData(folders.value[FOLDER_TYPE.ROOT].data.json_data)
    let nodes: Nodes = {
      root: {
        text: '',
        folder_uuid: folders.value[FOLDER_TYPE.ROOT].data.uuid,
        parent_uuid: folders.value[FOLDER_TYPE.ROOT].data.parent_uuid,
        owner_uuid: folders.value[FOLDER_TYPE.ROOT].data.owner_uuid,
        name: folders.value[FOLDER_TYPE.ROOT].data.name,
        children: [],
        type_: FOLDER_TYPE.ROOT,
        data: rootJsonData,
        state: { opened: false }
      }
    }
    // ------------- 

    // insert children in root
    const children = folders.value[FOLDER_TYPE.ROOT].children

    if (children && children.length > 0) {
      const childrenIds: Array<string> = []

      for (let child of children) {
        for (let k in child) {
          childrenIds.push(child[k].data.uuid)
        }
      }
      nodes['root'].children = childrenIds
    }

    // -------------

    // build nodes for tree component
    nodes = buildNodes(folders.value[FOLDER_TYPE.ROOT].children, nodes);
    treeNodes.value = nodes;
    currentNode.value = treeNodes.value['root']
    console.log('nodes', nodes)

    // recursive 
    function buildNodes(folders: Array<Folders>, nodes: Nodes): Nodes {
      if (!folders) {
        return nodes;
      }

      for (let folder of folders) {
        for (let k in folder) {
          console.log('k', folder[k])

          const jsonData = getJsonData(folder[k].data.json_data)

          nodes[folder[k].data.uuid] = {
            text: "",
            folder_uuid: folder[k].data.uuid,
            parent_uuid: folder[k].data.parent_uuid,
            owner_uuid: folder[k].data.owner_uuid,
            name: folder[k].data.name,
            children: [],
            parent: folder[k].data.parent_uuid,
            id: folder[k].data.uuid,
            type_: folder[k].data.type_,
            // @ts-ignore
            data: jsonData,
            categories: folder[k].data.categories,
            roles: folder[k].data.roles,
            users: folder[k].data.users,
            state: { opened: false },
          }

          if (folder[k].data.type_ === FOLDER_TYPE.SECTION && !folder[k].children) continue
          console.log('folder[k].children', folder[k].children)

          if (folder[k].data.type_ === FOLDER_TYPE.SECTION) {
            for (let child of folder[k].children) {
              for (let kk in child) {
                console.log('child[k].data.uuid', child[kk].data.uuid)
                nodes[folder[k].data.uuid].children?.push(child[kk].data.uuid)
              }
            }
          } else if (folder[k].data.type_ === FOLDER_TYPE.FACILITY) {
            console.log('getSpaces')

            const spaces = folder[k].data.spaces

            if (spaces && spaces.length > 0) {
              spaces.forEach(space => {
                nodes[folder[k].data.uuid].children?.push(space.uuid)

                nodes[space.uuid] = {
                  text: "",
                  folder_uuid: space.uuid,
                  parent_uuid: folder[k].data.uuid,
                  owner_uuid: folder[k].data.owner_uuid,
                  name: space.space_name,
                  parent: folder[k].data.uuid,
                  id: space.uuid,
                  type_: FOLDER_TYPE.SPACE,
                  data: {
                    space_url: space.space_url,
                    space_sid: space.space_sid
                  } as Space,
                  state: { opened: false },
                }
              })
            }

          }

          buildNodes(folder[k].children, nodes)

        }
      }

      return nodes;
    }

    function getJsonData(json_data: any) {
      let data = null
      try {
        data = JSON.parse(json_data)
      } catch (error) {
        console.log('Error: ', error)
      }
      return data
    };
  }

  const categoryForm = (tag: CategoryForm) => {
    categoryFormData.value.action = tag.action;
    categoryFormData.value.tag_category = tag.tag_category;
    if (tag.action === "Add") {
      categoryFormData.value.tag_category = {
        uuid: "",
        name: "",
        color: { name: COLOR.MAROON, rgb: { r: 0.5, g: 0, b: 0 } },
        //@ts-ignore
        json_data: { icon: '' },
        parent_uuid: "",
        subcategories: []
      };
    }
    selectedColor.value = categoryFormData.value.tag_category.color
    isSpaceAddTagActive.value = true;
  };

  const subCategoryForm = (tag: CategoryForm) => {
    subCategoryFormData.value.action = tag.action;
    subCategoryFormData.value.tag_category = tag.tag_category;
    if (tag.action === "Add") {
      subCategoryFormData.value.tag_category = {
        uuid: "",
        name: "",
        color: { name: COLOR.MAROON, rgb: { r: 0.5, g: 0, b: 0 } },
        //@ts-ignore
        json_data: { icon: '' },
        parent_uuid: "",
        subcategories: []
      };
    }

    isSpaceAddSubcategoryActive.value = true;
  };

  const roleForm = (role: RoleForm) => {
    roleFormData.value.action = role.action;
    if (role.action === 'Edit') {
      roleFormData.value.role = role.role;
    }
    roleFormData.value.role = { uuid: '', name: '', color: { name: COLOR.MAROON, rgb: { r: 0.5, g: 0, b: 0 } }, categories: [] }
    console.log("Role Form Data is" + JSON.stringify(roleFormData.value));
    isSpaceAddRoleActive.value = true;
  };

  /* const inheretUsers = async (spaceUsers: Array<SpaceUnitUser>) => {
    //Clear the current list when invoking the function
    nodeChildrenList.value = []

    if (currentNode.value) {
      currentNode.value.users = spaceUsers
    }

    if (currentNode.value?.children) {
      getAllChildrenOfNodes(currentNode.value?.children);

      if (treeNodes.value) {
        //Pass users to children
        const filteredTree = Object.keys(treeNodes.value)
          .filter(
            //@ts-ignore
            (key) => nodeChildrenList.value.includes(treeNodes.value[key].id)
          )
          .reduce((obj: any, key: any) => {
            //@ts-ignore
            obj[key] = treeNodes.value[key];
            return obj;
          }, {});

        const nodeKey = Object.keys(filteredTree).map((k) => {
          return k;
        });

        for (let i = 0; i < nodeKey.length; i++) {
          treeNodes.value[nodeKey[i]].users = spaceUsers;
        }
      }
    }
    return;
  };

  const getAllChildrenOfNodes = (children: Array<string>) => {
    console.log("Passed children: " + children);
    if (children.length !== 0) {
      let facilityChildren: Array<string> = []
      if (treeNodes.value) {
        const filteredNodes = Object.keys(treeNodes.value)
          .filter(
            //@ts-ignore
            key => children.includes(treeNodes.value[key].id)
          )
        facilityChildren = Object.keys(treeNodes.value).filter(k => {
          //@ts-ignore
          if (filteredNodes.includes(treeNodes.value[k].id)) {
            //@ts-ignore
            if (treeNodes.value[k].type === SPACE_UNIT_TYPE.FACILITY) {
              //@ts-ignore
              return treeNodes.value[k].children
            }
          }
        }
        )
        // console.log("Filtered tree items list:"+ JSON.stringify(filteredNodes))
        // console.log("Number of filtered list:"+ filteredNodes.length)
        nodeChildrenList.value = [...nodeChildrenList.value, ...filteredNodes, ...facilityChildren]
        console.log("Filtered tree items list:" + JSON.stringify(nodeChildrenList.value))
        console.log("Number of filtered list:" + nodeChildrenList.value.length)


      }
      //getAllChildrenOfNodes(currentChildren)
    }
    return;
  }; */

  const filterSubcategoriesByParent = (parent_uuid: string) => {
    const rawCategories = currentNode.value?.categories ? currentNode.value?.categories : []
    if (rawCategories.length !== 0) {
      const category = rawCategories.filter((cat: Category) => {
        return cat.uuid === parent_uuid
      })
      const subcategories = category[0].subcategories.map(sub => {
        sub.json_data = {
          color: { name: COLOR.MAROON, rgb: { r: 0.5, g: 0, b: 0 } },
          icon: "antenna.png"
        }
        return sub
      })
      return subcategories
    }
    return []
  }

  // ==============================     END METHODS    ==============================

  // ==============================      FAKE DATA    ==============================

  // const getFakeData = (payload: {
  //   nSection: number;
  //   nSubSection: number;
  //   nFacilities: number;
  //   nSpaces: number;
  //   nCategories: number;
  //   nSubCategories: number;
  // }): { root: Folder } => {
  //   let now = dayjs();
  //   userStore.getUsers();

  //   if (payload.nCategories > categories.length) {
  //     payload.nCategories = categories.length;
  //   }

  //   if (payload.nSubCategories > subcategories.length) {
  //     payload.nSubCategories = subcategories.length;
  //   }

  //   console.log("getFakeData()", payload);

  //   const sections = [];
  //   const iconNames = [
  //     "antenna.png",
  //     "cctv.png",
  //     "computer.png",
  //     "customer.png",
  //     "fan.png",
  //     "mop.png",
  //     "padlock.png",
  //     "telephone.png",
  //   ]; //This is for testing only

  //   const root_uuid = faker.datatype.uuid();

  //   for (let i = 0; i < payload.nSection; i++) {
  //     const spaceUnitSection = {} as Folder;
  //     const section = {} as Section;

  //     const tagCategories: Array<Category> = [];
  //     const sectionUsers = ref<Array<User>>(userStore.users);

  //     for (let ii = 0; ii < payload.nCategories; ii++) {
  //       let color = {} as TagColor;

  //       while (true) {
  //         const randIndx3 = Math.floor(Math.random() * colors.length);
  //         color = colors[randIndx3];
  //         const indx = tagCategories.findIndex(
  //           (i) => i.color.rgb === color.rgb
  //         );
  //         if (indx === -1) {
  //           color = color;
  //           break;
  //         }
  //       }

  //       const tagCategory = {} as Category;
  //       tagCategory.uuid = faker.datatype.uuid();
  //       tagCategory.name = getUniqueCategoryName(tagCategories, categories);
  //       // tagCategory.name = categories[Math.floor(Math.random() * categories.length)]
  //       tagCategory.color = color;

  //       const tagSubCategories: Array<SubCategory> = [];
  //       for (let jj = 0; jj < payload.nSubCategories; jj++) {
  //         const tagSubCategory = {} as SubCategory;
  //         tagSubCategory.uuid = faker.datatype.uuid();
  //         tagSubCategory.name = getUniqueCategoryName(
  //           tagSubCategories,
  //           subcategories
  //         );
  //         // tagSubCategory.name = subcategories[Math.floor(Math.random() * subcategories.length)]
  //         tagSubCategory.color = convertToCssRgb(color.rgb);
  //         tagSubCategory.icon =
  //           iconNames[Math.floor(Math.random() * iconNames.length)];
  //         tagSubCategories.push(tagSubCategory);
  //       }

  //       tagCategory.sub_category = tagSubCategories;

  //       tagCategories.push(tagCategory);
  //     }

  //     section.categories = tagCategories;

  //     section.belonging_club = faker.company.name();

  //     // spaceUnitSection.created_on = now.format("YYYY/MM/DD");
  //     spaceUnitSection.name =
  //       jaFirstSections[Math.floor(Math.random() * jaFirstSections.length)];
  //     spaceUnitSection.type_ = FOLDER_TYPE.SECTION;
  //     spaceUnitSection.uuid = faker.datatype.uuid();
  //     spaceUnitSection.parent_uuid = "root";
  //     spaceUnitSection.json_data = section;

  //     const sectionUser: Array<SpaceUnitUser> = [];
  //     for (let u = 0; u < 5; u++) {
  //       const unitUser = {} as SpaceUnitUser;
  //       const randUsr = Math.floor(Math.random() * sectionUsers.value.length);
  //       unitUser.uuid = sectionUsers.value[randUsr].uuid;
  //       unitUser.name = sectionUsers.value[randUsr].first_name;
  //       unitUser.email = sectionUsers.value[randUsr].email;
  //       unitUser.owner = spaceUnitSection.uuid;
  //       unitUser.roles = sectionUsers.value[randUsr].roles;
  //       sectionUser.push(unitUser);
  //     }

  //     spaceUnitSection.users = sectionUser;

  //     const subSections = [] as Array<Folder>;

  //     for (let j = 0; j < payload.nSubSection; j++) {
  //       const spaceUnitSubSection = {} as Folder;
  //       const subSection = {} as Section;

  //       const tagCategories2: Array<Category> = [];

  //       for (let ii2 = 0; ii2 < payload.nCategories; ii2++) {
  //         let color = {} as TagColor;

  //         while (true) {
  //           const randIndx3 = Math.floor(Math.random() * colors.length);
  //           color = colors[randIndx3];
  //           const indx = tagCategories2.findIndex(
  //             (i) => i.color.rgb === color.rgb
  //           );
  //           if (indx === -1) {
  //             color = color;
  //             break;
  //           }
  //         }

  //         const tagCategory2 = {} as Category;
  //         tagCategory2.uuid = faker.datatype.uuid();
  //         tagCategory2.name = getUniqueCategoryName(tagCategories2, categories);
  //         // tagCategory2.name = categories[Math.floor(Math.random() * categories.length)]
  //         tagCategory2.color = color;

  //         const tagSubCategories2: Array<SubCategory> = [];
  //         for (let jj2 = 0; jj2 < payload.nSubCategories; jj2++) {
  //           const tagSubCategory = {} as SubCategory;
  //           tagSubCategory.uuid = faker.datatype.uuid();
  //           tagSubCategory.name = getUniqueCategoryName(
  //             tagSubCategories2,
  //             subcategories
  //           );
  //           // tagSubCategory.name = subcategories[Math.floor(Math.random() * subcategories.length)]
  //           tagSubCategory.color = faker.color.rgb({ format: "css" });
  //           tagSubCategory.icon =
  //             iconNames[Math.floor(Math.random() * iconNames.length)];
  //           tagSubCategories2.push(tagSubCategory);
  //         }

  //         tagCategory2.sub_category = tagSubCategories2;

  //         tagCategories2.push(tagCategory2);
  //       }

  //       subSection.categories = tagCategories2;
  //       subSection.belonging_club = faker.company.name();

  //       // spaceUnitSubSection.created_on = now.format("YYYY/MM/DD");
  //       spaceUnitSubSection.name =
  //         jaSecondSections[Math.floor(Math.random() * jaSecondSections.length)];
  //       spaceUnitSubSection.type_ = FOLDER_TYPE.SECTION;
  //       spaceUnitSubSection.uuid = faker.datatype.uuid();
  //       spaceUnitSubSection.parent_uuid = spaceUnitSection.uuid;
  //       spaceUnitSubSection.json_data = subSection;
  //       spaceUnitSubSection.users = sectionUser;

  //       const facilities = [] as Array<Folder>;

  //       for (let k = 0; k < payload.nFacilities; k++) {
  //         const spaceUnitFacility = {} as Folder;
  //         const facility = {} as Facility;

  //         const tagCategories3: Array<Category> = [];

  //         for (let ii3 = 0; ii3 < payload.nCategories; ii3++) {
  //           let color = {} as TagColor;

  //           while (true) {
  //             const randIndx3 = Math.floor(Math.random() * colors.length);
  //             color = colors[randIndx3];
  //             const indx = tagCategories3.findIndex((i) => i.color === color);
  //             if (indx === -1) {
  //               color = color;
  //               break;
  //             }
  //           }

  //           const tagCategory3 = {} as Category;
  //           tagCategory3.uuid = faker.datatype.uuid();
  //           tagCategory3.name = getUniqueCategoryName(
  //             tagCategories3,
  //             categories
  //           );
  //           // tagCategory3.name = categories[Math.floor(Math.random() * categories.length)]
  //           tagCategory3.color = color;

  //           const tagSubCategories3: Array<SubCategory> = [];
  //           for (let jj3 = 0; jj3 < payload.nSubCategories; jj3++) {
  //             const tagSubCategory = {} as SubCategory;
  //             tagSubCategory.uuid = faker.datatype.uuid();
  //             tagSubCategory.name = getUniqueCategoryName(
  //               tagSubCategories3,
  //               subcategories
  //             );
  //             // tagSubCategory.name = subcategories[Math.floor(Math.random() * subcategories.length)]
  //             tagSubCategory.color = faker.color.rgb({ format: "css" });
  //             tagSubCategory.icon =
  //               iconNames[Math.floor(Math.random() * iconNames.length)];
  //             tagSubCategories3.push(tagSubCategory);
  //           }

  //           tagCategory3.sub_category = tagSubCategories3;

  //           tagCategories3.push(tagCategory3);
  //         }

  //         facility.categories = tagCategories3;
  //         facility.belonging_club = faker.company.name();

  //         // spaceUnitFacility.created_on = now.format("YYYY/MM/DD");
  //         spaceUnitFacility.name =
  //           jaFacilities[Math.floor(Math.random() * jaFacilities.length)];
  //         spaceUnitFacility.type_ = FOLDER_TYPE.FACILITY;
  //         spaceUnitFacility.uuid = faker.datatype.uuid();
  //         spaceUnitFacility.parent_uuid = spaceUnitSubSection.uuid;
  //         spaceUnitFacility.json_data = facility;
  //         spaceUnitFacility.users = sectionUser;

  //         const spaces = [] as Array<Folder>;

  //         for (let l = 0; l < payload.nSpaces; l++) {
  //           const spaceUnitSpace = {} as Folder;
  //           const space = {} as Space;

  //           space.space_image = faker.image.imageUrl(640, 480, "city", true);
  //           space.showcase_url = faker.internet.url();

  //           const randIndx = Math.floor(Math.random() * model_sids.length);

  //           space.model_sid = model_sids[randIndx];

  // spaceUnitSpace.created_on = now.format("YYYY/MM/DD");
  // spaceUnitSpace.name = `${l + 1} 階`;
  // spaceUnitSpace.type = SPACE_UNIT_TYPE.SPACE;
  // spaceUnitSpace.uuid = faker.datatype.uuid();
  // spaceUnitSpace.parent_uuid = spaceUnitFacility.uuid;
  // spaceUnitSpace.data = space;
  // spaceUnitSpace.users = sectionUser

  //           spaces.push(spaceUnitSpace);
  //         }

  //         facilities.push(spaceUnitFacility);
  //         spaceUnitFacility.children = spaces;
  //       }
  //       spaceUnitSubSection.children = facilities;

  //       subSections?.push(spaceUnitSubSection);
  //     }

  //     spaceUnitSection.children = subSections;

  //     sections.push(spaceUnitSection);
  //   }

  //   return {
  //     root: {
  //       uuid: root_uuid,
  //       owner_uuid: null,
  //       type_: FOLDER_TYPE.ROOT,
  //       // created_on: now.format("YYYY/MM/DD"),
  //       name: "ROOT",
  //       children: sections,
  //     },
  //   };
  // };

  // const getUniqueCategoryName = (
  //   tagCategories: Array<Category>,
  //   options: Array<any>
  // ): string => {
  //   let name = "";
  //   while (true) {
  //     name = options[Math.floor(Math.random() * options.length)];
  //     const isFound = tagCategories.find((i) => i.name === name);
  //     if (!isFound) break;
  //   }
  //   return name;
  // };

  // ==============================    END FAKE DATA   ==============================

  return {
    // flags
    tableView,
    isCardModalActive,
    isMobileSidebarActive,
    isSpaceUnitModalActive,
    isSpaceAddAssigneeActive,
    isSpaceAddTagActive,
    isSpaceAddSubcategoryActive,
    isSpaceAddRoleActive,
    isEditingSpaceNode,
    isAlertModalActive,

    //state
    owner,
    folders,
    appKey,
    treeConfig,
    treeNodes,
    // spaceUnitTree,
    currentNode,
    nodeChildren,
    // selectedTreeItem,
    spaceUnitForm,
    spaceUnitFormError,
    spaceUnitUserList,
    spaceUnitUser,
    modelSid,
    categoryFormData,
    subCategoryFormData,
    roleFormData,
    spaceUnitImportedList,
    spaceUnitLabel,
    selectedColor,
    spaceAlertModalDetail,
    spaceUnitEditLabel,

    // getters

    getFoldersByOwnerId,
    // spaceUnitChildren,
    parentNode,

    // methods
    init,
    getSpaceTree,
    setCurrentNode,
    // setSelectedTreeItem,
    saveSpaceUnit,
    saveSpaceUnitUser,
    // getFakeData,
    categoryForm,
    subCategoryForm,
    roleForm,
    //inheretUsers,
    deleteAllFolders,
    deleteFolder
    // for testing
  };
});

//export const spaceStore = useSpaceStore()
