import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import { TABLE_VIEW, SPACE_UNIT_TYPE, type Facility, type TagColor, COLOR, type Node } from "@/stores/types";
import type { Space, SpaceUnit, SpaceUnitUser, Nodes, Category, SubCategory, Section, CategoryForm,SubCategoryForm, RoleForm, User } from "@/stores/types";
import { faker } from "@faker-js/faker/locale/ja";
import dayjs from "dayjs"
import { validURL } from '../utils/validate'
import type { ConnectOptions } from "public/bundle/sdk";
import { config, model_sids, colors} from './config'
import { extractRGBValues,convertToCssRgb } from "@/utils/color";
import { useUserStore } from "./user";


export const useSpaceStore = defineStore("space", () => {
  // faker.setLocale('de')

  // ==============================        TYPES        ==============================
  interface SpaceUnitFormError{
    error_name: boolean,
    error_showcase_url: boolean
  }

  // ==============================      END TYPES      ==============================



  // ==============================        FLAGS        ==============================

  const tableView = ref(TABLE_VIEW.LIST) // table or card view
  const isCardModalActive = ref(false) // SpaceSettingDetailMain.vue
  const isSpaceUnitModalActive = ref(false)  // SpaceUnitModalView.vue
  const now = dayjs()

  // ==============================      END FLAGS      ==============================



  // ==============================        STATE        ==============================

  const appKey = config.appKeyMp as unknown as ConnectOptions
  const treeConfig = ref({
    roots: ["root"]
  })
  const treeNodes = ref<Nodes>()
  const spaceUnitTree = ref<{root: SpaceUnit}>() // SpaceTree.vue
  const selectedTreeItem = ref<SpaceUnit>()
  const userStore = useUserStore()  
  const spaceUnitForm = ref<SpaceUnit>({ // SpaceUnitDetail.vue
    type: SPACE_UNIT_TYPE.SECTION,
    uuid: '',
    name: '',
    children: [],
    created_on: now.format("YYYY/MM/DD")

  })
  
  const categoryFormData = ref<CategoryForm>({
    action: '',
    tag_category: {uuid:'',name:'',color:{name: COLOR.MAROON,rgb: { r: 0.5, g: 0, b: 0 }},sub_category: []}
  })
  const subCategoryFormData = ref<SubCategoryForm>({
    action: '',
    tag_subcategory: {uuid:'',name:'',color:'',icon:''}
  })
  const roleFormData = ref<RoleForm>({
    action: '',
    role: {uuid: '',name: '',color:{name: COLOR.MAROON,rgb: { r: 0.5, g: 0, b: 0 }},categories:[]}
  })

  const spaceUnitFormError = ref<SpaceUnitFormError>({
    error_name: false,
    error_showcase_url: false
  })
  const spaceUnitUserList = ref<Array<SpaceUnitUser>>([]) // SpaceUnitUsers.vue 
  const spaceUnitUser = ref<SpaceUnitUser>({uuid: '', email: '', name: '',roles: []}) // SpaceUnitAddUsers.vue
  const isMobileSidebarActive = ref(false)
  const isSpaceAddAssigneeActive = ref(false)
  const isSpaceAddTagActive = ref(false)
  const isSpaceAddSubcategoryActive = ref(false)
  const isSpaceAddRoleActive = ref(false)

  // ==============================      END STATE      ==============================



  // ==============================       COMPUTED      ==============================

  const selectedTreeItemUuid = computed( () => selectedTreeItem.value?.uuid)

  const spaceUnitChildren = computed( () :Array<SpaceUnit> => { // table and card items
    if(!selectedTreeItem.value || !selectedTreeItem.value.children) return []
    return selectedTreeItem.value.children
  })

  const spaceUnitFormType = computed( () :SPACE_UNIT_TYPE => spaceUnitForm.value.type) // need to be computed to be watch

  const modelSid = computed( () => {
    if(selectedTreeItem.value && selectedTreeItem.value.type === SPACE_UNIT_TYPE.SPACE){
      const space = selectedTreeItem.value.data as Space 
      return space.model_sid
    }
    return null
  })

  const parentNode = computed( () :Node | null => {

    if(!treeNodes.value){
      console.log('treeNodes.value is undefined')
      return null 
    }

    if(!selectedTreeItem.value){
      console.log('selectedTreeItem.value is undefined')
      return null
    }

    if(!selectedTreeItem.value.parent_uuid){
      console.log('selectedTreeItem.value.parent_uuid is undefined')
      return null
    }

    return treeNodes.value[selectedTreeItem.value.parent_uuid]
  })

  // ==============================     END COMPUTED     ==============================



  // ==============================        WATCH        ==============================

  // update localstorage selectedTreeItem and treeNodes
  watch(selectedTreeItemUuid, (payload) => {
    localStorage.setItem('selectedTreeItem', JSON.stringify(selectedTreeItem.value)) // display selectedTreeItem on page every refresh
    localStorage.setItem('treeNodes', JSON.stringify(treeNodes.value)) // update this one so that when user refresh the page the opened nodes will remain
    localStorage.setItem('spaceUnitTree', JSON.stringify(spaceUnitTree.value)) // update this one so that when user refresh the page the opened nodes will remain
  })

  // dynamically add data prop base on space unit type in <SpaceUnitDetail>
  watch(spaceUnitFormType, (payload: SPACE_UNIT_TYPE) => {  
    if(payload === SPACE_UNIT_TYPE.SPACE){
      const space = {} as Space
      space.showcase_url = ''
      spaceUnitForm.value.data = space
    }
  })
  // reset space unit modal when it is close
  watch(isSpaceUnitModalActive, (payload: boolean) => {
    if(!payload){
      resetSpaceUnitModal()
    }
  })

  // ==============================      END WATCH      ==============================



  // ==============================       METHODS      ==============================

  const init = () => {
    console.log('spaceStore.init()')
    getSpaceTree()
    setTreeNodes()
    selectedTreeItem.value = spaceUnitTree.value?.root

    // localStorage.setItem('selectedTreeItem', JSON.stringify(selectedTreeItem.value))
    // localStorage.setItem('treeNodes', JSON.stringify(treeNodes.value))
    // localStorage.setItem('spaceUnitTree', JSON.stringify(spaceUnitTree.value))
  }

  const getSpaceTree = () => {
    console.log('getSpaceTree()')
    spaceUnitTree.value = getFakeData({nSection: 3, nSubSection: 1, nFacilities: 1, nSpaces: 3, nCategories: 5})
  }

  // execute when there is a selection on space tree component
  const setSelectedTreeItem = (payload: {uuid: string, parent_uuid?: string}) => {
    console.log('setSelectedTreeItem()', payload)
    if(!spaceUnitTree.value?.root){
      console.log('spaceUnitTree.value?.root is undefined')
      return 
    }
    
    if(!payload.parent_uuid){ // selected tree item is root
      selectedTreeItem.value = spaceUnitTree.value.root 
      return 
    }

    const recurse = (node: SpaceUnit, uuid: string, parent_uuid?: string) => {
      console.log('recurse()')
      if(!node.children){
        console.log('children is undefined')
        return
      }
  
      for(let i = 0, count = node.children.length; i < count; i++){
        
        if(node.children[i].uuid === uuid){
          console.log('uuid found', node.children[i])
          selectedTreeItem.value = node.children[i]
          selectedTreeItem.value.parent_uuid = parent_uuid
          return
        }
  
        recurse(node.children[i], uuid, parent_uuid)
      }
  
    }

    recurse(spaceUnitTree.value?.root, payload.uuid, payload.parent_uuid)

  }

  const saveSpaceUnitUser = async() => {
    console.log('saveSpaceUnitUser()', spaceUnitUser.value)

    const email = spaceUnitUser.value.email.split("@")
    spaceUnitUser.value.name = email[0]

    spaceUnitUser.value.uuid = faker.datatype.uuid()

    const user = {...spaceUnitUser.value}
    spaceUnitUserList.value.push(user)

    spaceUnitUser.value.uuid = ''
    spaceUnitUser.value.email = ''
    spaceUnitUser.value.name = ''

    console.log('spaceUnitUserList', spaceUnitUserList.value)
  }

  const saveSpaceUnit = () => {
    console.log('saveSpaceUnit()')

    if(!selectedTreeItem.value){
      console.log('selectedTreeItem is undefined')
      return 
    }

    if(!canSaveSpaceUnit()){
      console.log(`Can't Save Space Unit`)
      return 
    }
    console.log('Can Save Space Unit')

    if(!treeNodes.value){
      console.log('treeNodes.value is undefined')
      return 
    }

    if(selectedTreeItem.value.type !== SPACE_UNIT_TYPE.ROOT){ // open node
      treeNodes.value[selectedTreeItem.value.uuid].state = {opened: true}
    }else{
      treeNodes.value['root'].state = {opened: true}
    }

    spaceUnitForm.value.uuid = faker.datatype.uuid()
    spaceUnitForm.value.parent_uuid = selectedTreeItem.value.uuid
    spaceUnitForm.value.created_on = now.format("YYYY/MM/DD")
    spaceUnitForm.value.children = []

    if(spaceUnitForm.value.type === SPACE_UNIT_TYPE.SPACE){
      const space = spaceUnitForm.value.data as Space  
      const showcase_url = space.showcase_url.split('/?m=')
      space.model_sid = showcase_url[1]
      space.space_image = faker.image.imageUrl(640, 480, 'city', true)
      spaceUnitForm.value.data = space
    }

    spaceUnitForm.value.users = {...spaceUnitUserList.value}
    
    if(!selectedTreeItem.value.children){
      console.log('selectedTreeItem has no children')
      return 
    }
    console.log('spaceUnitForm.value', spaceUnitForm.value)
    selectedTreeItem.value.children.push(spaceUnitForm.value) // add to spaceUnitTree object
    addToTreeNodes({parent: selectedTreeItem.value, space_unit: spaceUnitForm.value})
    
    isSpaceUnitModalActive.value = false

    localStorage.setItem('treeNodes', JSON.stringify(treeNodes.value))
    localStorage.setItem('spaceUnitTree', JSON.stringify(spaceUnitTree.value))    
  }

  // insert the newly added space unit to children array under it's parent node 
  const addToTreeNodes = (payload: {parent: SpaceUnit, space_unit: SpaceUnit}) => {
    console.log('addToNode()', payload)
    if(!treeNodes.value){
      console.log('treeNodes is undefined')
      return 
    }

    console.log('selectedTreeItem.value', selectedTreeItem.value)

    if(payload.parent.type === SPACE_UNIT_TYPE.ROOT){ // selected item is Root
      treeNodes.value['root'].children?.push(payload.space_unit.uuid)
      console.log('Node added to root children')
      treeNodes.value[payload.space_unit.uuid] = {
        text: `${payload.space_unit.name}`,
        children: [],
        type: payload.space_unit.type,
        created_on: payload.space_unit.created_on,
        data: payload.space_unit.data,
        users: payload.space_unit.users,
        state: {
          opened: true
        }
      }
      return 
    }
    
    for(const key in treeNodes.value){
      console.log('key', key)
      if(key === payload.parent.uuid){
        treeNodes.value[key].children?.push(payload.space_unit.uuid)
        console.log('Added to treeNodes', payload.space_unit)

        treeNodes.value[payload.space_unit.uuid] = {
          text: `${payload.space_unit.name}`,
          children: [],
          type: payload.space_unit.type,
          created_on: payload.space_unit.created_on,
          data: payload.space_unit.data,
          users: payload.space_unit.users,
          state: {
            opened: true
          }
        }
        
        break
      }
    }

  }

  // validation before saving spacec unit
  const canSaveSpaceUnit = () => {
    let canSave = true 
    if(spaceUnitForm.value.name.trim() === ''){ // no space unit name
      console.log('No space unit name')
      spaceUnitFormError.value.error_name = true 
      canSave = false
    }else{
      spaceUnitFormError.value.error_name = false 
    }


    if(spaceUnitForm.value.type === SPACE_UNIT_TYPE.SPACE){
      const space = spaceUnitForm.value.data as Space 
      if(space.showcase_url.trim() === '' || !(validURL(space.showcase_url) )){ // no showcase url; invalid URL
        console.log('No showcase url')
        spaceUnitFormError.value.error_showcase_url = true 
        canSave = false
      }else{
        spaceUnitFormError.value.error_showcase_url = false 
      }
    }


    return canSave

  }

  const resetSpaceUnitModal = () => {
    console.log('resetSpaceUnitModal()')
    
    spaceUnitUserList.value = []

    // reset spaceUnitForm
    spaceUnitForm.value = {} as SpaceUnit 
    spaceUnitForm.value.name = ''
    spaceUnitForm.value.children = []
    spaceUnitForm.value.created_on = now.format("YYYY/MM/DD")
    spaceUnitForm.value.type = SPACE_UNIT_TYPE.SECTION
    spaceUnitForm.value.uuid = ''
    
    spaceUnitFormError.value = {} as SpaceUnitFormError

    // ------
  }

  const setTreeNodes = () => {
    console.log('setTreeNodes()')

    if(!spaceUnitTree.value){
        console.log('spaceUnitTree is undefined')
        return 
    }

    let nodes: Nodes = {
        root: {
            text: spaceUnitTree.value.root.name,
            children: [],
            type: spaceUnitTree.value.root.type,
            created_on: spaceUnitTree.value.root.created_on,
            data: spaceUnitTree.value.root.data,
            users: spaceUnitTree.value.root.users,
            state: {
                opened: true
            }
        },
    }

    let spaceUnit = spaceUnitTree.value.root
    spaceUnit.children?.forEach(child => nodes.root.children?.push(child.uuid))
    
    nodes = buildNodes(spaceUnit, nodes) // build nodes for tree component
    treeNodes.value = nodes

    console.log('nodes', JSON.stringify(nodes))

    function buildNodes(node: SpaceUnit, nodes: Nodes) :Nodes {
      if(!node.children){
        return nodes
      }

      for(let i = 0, count = node.children.length; i < count; i++){

        nodes[node.children[i].uuid] = {
            text: `${node.children[i].name}`,
            children: [],
            parent: node.parent_uuid,
            id: node.uuid,
            type: node.children[i].type,
            created_on: node.children[i].created_on,
            data: node.children[i].data,
            users: node.children[i].users,
            state: {opened: false}
        }

        node.children[i].children?.forEach( j => nodes[node.children![i].uuid].children?.push(j.uuid))

        buildNodes(node.children[i], nodes)
      }

      return nodes
    }

  }

  const categoryForm = (tag: CategoryForm) => {
    categoryFormData.value.action = tag.action
    categoryFormData.value.tag_category = tag.tag_category
    isSpaceAddTagActive.value = true
  }

  const subCategoryForm = (tag: SubCategoryForm) => {
    subCategoryFormData.value.action = tag.action
    subCategoryFormData.value.tag_subcategory = tag.tag_subcategory
    console.log("Edit Subcategory: "+ JSON.stringify(subCategoryFormData.value))
    isSpaceAddSubcategoryActive.value = true
  }

  const roleForm = (role:RoleForm) => {
    roleFormData.value.action = role.action
    roleFormData.value.role = role.role
    console.log("Selected color is"+roleFormData.value.role.color.rgb)
    isSpaceAddRoleActive.value = true
  }

  const inheretUsers = (treeNode:SpaceUnit,spaceUsers:Array<SpaceUnitUser>) => {
    if (treeNode.children?.length !== 0) {
      //Used to persist newly added users to currenty selected tree item
      if (treeNode.uuid === selectedTreeItem.value?.uuid) {
        treeNode.users = spaceUsers
      }
      //Used to inheret users to all children of currnenly selected tree
      treeNode.children?.forEach(child => {
        if (child.children !== undefined) {
          child.users = spaceUsers
          inheretUsers(child,spaceUsers) 
        }
        return
      })
    }else{
      return
    }
  }

  // ==============================     END METHODS    ==============================



  // ==============================      FAKE DATA    ==============================

  const getFakeData = (payload: {nSection: number, nSubSection: number, nFacilities: number, nSpaces: number, nCategories: number}) :{root: SpaceUnit} => {
    
    // faker.setLocale('de')
    let now = dayjs()
    userStore.getUsers()

    if(payload.nCategories > 10){
      payload.nCategories = 10
    }

    console.log('getFakeData()', payload)
    
    const sections = []
    const iconNames = ['antenna.png','cctv.png','computer.png','customer.png',
    'fan.png','mop.png','padlock.png','telephone.png'] //This is for testing only
    
    const root_uuid = faker.datatype.uuid()

    for (let i = 0; i < payload.nSection; i++) {
      const spaceUnitSection = {} as SpaceUnit 
      const section = {} as Section

      const tagCategories: Array<Category> = []
      const sectionUsers = ref<Array<User>>(userStore.users)

      for(let ii = 0; ii < payload.nCategories; ii++){

        let color = {} as TagColor

        while(true){
          const randIndx3 = Math.floor(Math.random() * colors.length)
          color = colors[randIndx3]
          const indx = tagCategories.findIndex(i => i.color.rgb === color.rgb)
          if(indx === -1){
            color = color
            break 
          }
        }


        const tagCategory = {} as Category
        tagCategory.uuid = faker.datatype.uuid()
        // tagCategory.name = faker.name.jobDescriptor()
        tagCategory.name = 'Cat: ' + faker.company.bsNoun()
        tagCategory.color = color

        const tagSubCategories: Array<SubCategory> = []
        for(let jj = 0; jj < 2; jj++){
          const tagSubCategory = {} as SubCategory
          tagSubCategory.uuid = faker.datatype.uuid()
          tagSubCategory.name = faker.name.jobType()
          tagSubCategory.color = convertToCssRgb(color.rgb)
          tagSubCategory.icon = iconNames[Math.floor(Math.random() * iconNames.length)]
          tagSubCategories.push(tagSubCategory)
        }

        tagCategory.sub_category = tagSubCategories

        tagCategories.push(tagCategory)
      }
      
      section.categories = tagCategories 

      /* const sectionUser: Array<SpaceUnitUser> = []
      for (let u = 0; u < 5; u++) {
        const unitUser = {} as SpaceUnitUser
        const randUsr = Math.floor(Math.random() * sectionUsers.value.length)
        unitUser.uuid = sectionUsers.value[randUsr].uuid
        unitUser.name = sectionUsers.value[randUsr].first_name
        unitUser.email = sectionUsers.value[randUsr].email
        unitUser.owner = SPACE_UNIT_TYPE.SECTION
        unitUser.roles = sectionUsers.value[randUsr].roles
        sectionUser.push(unitUser)
      } */

      section.belonging_club = faker.company.name()

      spaceUnitSection.created_on = now.format("YYYY/MM/DD")
      spaceUnitSection.name = faker.address.streetAddress() 
      spaceUnitSection.type = SPACE_UNIT_TYPE.SECTION 
      spaceUnitSection.uuid = faker.datatype.uuid()
      spaceUnitSection.parent_uuid = 'root'
      spaceUnitSection.data = section

      const sectionUser: Array<SpaceUnitUser> = []
      for (let u = 0; u < 5; u++) {
        const unitUser = {} as SpaceUnitUser
        const randUsr = Math.floor(Math.random() * sectionUsers.value.length)
        unitUser.uuid = sectionUsers.value[randUsr].uuid
        unitUser.name = sectionUsers.value[randUsr].first_name
        unitUser.email = sectionUsers.value[randUsr].email
        unitUser.owner = spaceUnitSection.uuid
        unitUser.roles = sectionUsers.value[randUsr].roles
        sectionUser.push(unitUser)
      }

      spaceUnitSection.users = sectionUser
      
      const subSections = [] as Array<SpaceUnit>
  
      for (let j = 0; j < payload.nSubSection; j++){
        const spaceUnitSubSection = {} as SpaceUnit
        const subSection = {} as Section

        const tagCategories2: Array<Category> = []

        for(let ii2 = 0; ii2 < payload.nCategories; ii2++){

          let color = {} as TagColor

          while(true){
            const randIndx3 = Math.floor(Math.random() * colors.length)
            color = colors[randIndx3]
            const indx = tagCategories2.findIndex(i => i.color.rgb === color.rgb)
            if(indx === -1){
              color = color
              break 
            }
          }
  
          const tagCategory2 = {} as Category
          tagCategory2.uuid = faker.datatype.uuid()
          // tagCategory2.name = faker.name.jobDescriptor()
          tagCategory2.name  = 'TEST: ' + faker.word.noun()
          tagCategory2.color = color
  
          const tagSubCategories2: Array<SubCategory> = []
          for(let jj2 = 0; jj2 < 2; jj2++){
            const tagSubCategory = {} as SubCategory
            tagSubCategory.uuid = faker.datatype.uuid()
            tagSubCategory.name = faker.name.jobType()
            tagSubCategory.color = faker.color.rgb({ format: 'css' })
            tagSubCategory.icon = iconNames[Math.floor(Math.random() * iconNames.length)]
            tagSubCategories2.push(tagSubCategory)
          }
  
          tagCategory2.sub_category = tagSubCategories2
  
          tagCategories2.push(tagCategory2)
        }
        
        subSection.categories = tagCategories2
        subSection.belonging_club = faker.company.name()

        spaceUnitSubSection.created_on = now.format("YYYY/MM/DD")
        spaceUnitSubSection.name = faker.address.streetAddress() 
        spaceUnitSubSection.type = SPACE_UNIT_TYPE.SECTION 
        spaceUnitSubSection.uuid = faker.datatype.uuid()
        spaceUnitSubSection.parent_uuid = spaceUnitSection.uuid
        spaceUnitSubSection.data = subSection
        spaceUnitSubSection.users = sectionUser

        const facilities = [] as Array<SpaceUnit>
  
        for (let k = 0; k < payload.nFacilities; k++){ 
          const spaceUnitFacility = {} as SpaceUnit
          const facility = {} as Facility
          
          const tagCategories3: Array<Category> = []

          for(let ii3 = 0; ii3 < payload.nCategories; ii3++){

            let color = {} as TagColor

            while(true){
              const randIndx3 = Math.floor(Math.random() * colors.length)
              color = colors[randIndx3]
              const indx = tagCategories3.findIndex(i => i.color === color)
              if(indx === -1){
                color = color
                break 
              }
            }

    
            const tagCategory3 = {} as Category
            tagCategory3.uuid = faker.datatype.uuid()
            tagCategory3.name = faker.name.jobDescriptor()
            tagCategory3.color = color
    
            const tagSubCategories3: Array<SubCategory> = []
            for(let jj3 = 0; jj3 < 2; jj3++){
              const tagSubCategory = {} as SubCategory
              tagSubCategory.uuid = faker.datatype.uuid()
              tagSubCategory.name = faker.name.jobType()
              tagSubCategory.color = faker.color.rgb({ format: 'css' })
              tagSubCategory.icon = iconNames[Math.floor(Math.random() * iconNames.length)]
              tagSubCategories3.push(tagSubCategory)
            }
    
            tagCategory3.sub_category = tagSubCategories3
    
            tagCategories3.push(tagCategory3)
          }

          facility.categories = tagCategories3
          facility.belonging_club = faker.company.name()

          spaceUnitFacility.created_on = now.format("YYYY/MM/DD")
          spaceUnitFacility.name = faker.address.streetAddress() 
          spaceUnitFacility.type = SPACE_UNIT_TYPE.FACILITY 
          spaceUnitFacility.uuid = faker.datatype.uuid() 
          spaceUnitFacility.parent_uuid = spaceUnitSubSection.uuid 
          spaceUnitFacility.data = facility
          spaceUnitFacility.users = sectionUser

          const spaces = [] as Array<SpaceUnit>

          for (let l = 0; l < payload.nSpaces; l++){

            const spaceUnitSpace = {} as SpaceUnit
            const space = {} as Space

            space.space_image = faker.image.imageUrl(640, 480, 'city', true)
            space.showcase_url = faker.internet.url()

            const randIndx = Math.floor(Math.random() * model_sids.length)

            space.model_sid = model_sids[randIndx]

            spaceUnitSpace.created_on = now.format("YYYY/MM/DD")
            spaceUnitSpace.name = faker.address.streetAddress() 
            spaceUnitSpace.type = SPACE_UNIT_TYPE.SPACE 
            spaceUnitSpace.uuid = faker.datatype.uuid()
            spaceUnitSpace.parent_uuid = spaceUnitFacility.uuid 
            spaceUnitSpace.data = space

            spaces.push(spaceUnitSpace)
          }

          facilities.push(spaceUnitFacility)
          spaceUnitFacility.children = spaces
        }
        spaceUnitSubSection.children = facilities 
  
        subSections?.push(spaceUnitSubSection)
      }
  
      spaceUnitSection.children = subSections
  
      sections.push(spaceUnitSection)
    }

    return {
        root: {
          uuid: root_uuid,
          type: SPACE_UNIT_TYPE.ROOT,
          created_on: now.format("YYYY/MM/DD"),
          name: "ROOT",
          children: sections
      }
    }
  }

  // const getTagCategories = () => {
  //   const tagCategories: Array<TagCategory> = []
  //   const icons = ['fan','desk','monitor','tools','printer-eye','fire-extinguisher','server-security','vacuum']

  //     for(let ii = 0; ii < 5; ii++){
  //       const {red, green, blue} = extractRGBValues(faker.color.rgb({ format: 'css' }))

  //       const tagCategory = {} as TagCategory
  //       tagCategory.name = faker.name.jobDescriptor()
  //       tagCategory.color = {r:red,g:green,b:blue}
  //       /* tagCategory.color.r = 23
  //       tagCategory.color.g = 67
  //       tagCategory.color.b = 88 */

  //       const tagSubCategories: Array<TagSubCategory> = []
  //       for(let jj = 0; jj < 2; jj++){
  //         const tagSubCategory = {} as TagSubCategory
  //         tagSubCategory.name = faker.name.jobType()
  //         tagSubCategory.color = faker.color.rgb()
  //         tagSubCategory.icon = icons[Math.floor(Math.random() * icons.length)]
  //         tagSubCategories.push(tagSubCategory)
  //       }

  //       tagCategory.sub_category = tagSubCategories

  //       tagCategories.push(tagCategory)
  //     }

  //   return tagCategories
  // }
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

    //state
    appKey,
    treeConfig,
    treeNodes,
    spaceUnitTree,
    selectedTreeItem,
    spaceUnitForm,
    spaceUnitFormError,
    spaceUnitUserList,
    spaceUnitUser,
    modelSid,
    categoryFormData,
    subCategoryFormData,
    roleFormData,

    // getters
    spaceUnitChildren,
    parentNode,

    // methods
    init,
    getSpaceTree,
    setSelectedTreeItem,
    saveSpaceUnit,
    saveSpaceUnitUser,
    getFakeData,
    categoryForm,
    subCategoryForm,
    roleForm,
    inheretUsers,
     // for testing
  };
});



/*

  Tried using fake color in faker data rgb but matterport tags don't recognize some random rgb values

*/