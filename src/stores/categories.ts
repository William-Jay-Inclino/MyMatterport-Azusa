import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Category, Role, User } from './types'
import { colors } from "./config";
import { useSpaceStore } from './space';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import localForage from "localforage";

// axios API
// const apiURL = "http://localhost:5173/api";
const apiURL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: apiURL,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
})

export const useCategoryStore = defineStore('category', () => {

  // ============================ STATE =========================== //
  const spaceStore = useSpaceStore()
  const categories = ref<Array<Category>>([])
  // const owner = ref({} as User)

  // ============================ END STATE =========================== //

  // ============================ COMPUTED =========================== //

  // const categoriesByOwnerId = computed( () => {
  //   if(!owner.value) return []
  //   if(categories.value.length === 0) return [] 

  //   // temporary add random color since no color column in db
  //   return categories.value.filter(i => i.owner_uuid === owner.value.uuid).map(i => {
  //     const rand = Math.floor(Math.random() * colors.length)
  //     const color = {name: colors[rand].name, rgb: colors[rand].rgb}
  //     return {...i, color}
  //   })

  // })

  // ============================ END COMPUTED =========================== //

  // ============================ METHODS =========================== //
  const categoryBuilder = (params: Array<Category>): Array<Category> => {
    //This is a temporary function that we use to add other properties the role since the db
    //does not have a color column yet
    const categories = params.map(param => {
      const c = {} as Category
      const rand = Math.floor(Math.random() * colors.length);
      c.uuid = param.uuid
      c.name = param.name
      c.color = colors[rand]
      c.folder_uuid = param.folder_uuid
      return c
    })
    return categories
  }

    const validateSubCategoryForm = () => {
      const sub_category = spaceStore.subCategoryFormData.tag_category
      const errors = {
        name: 0,
        icon: 0
      }

      if (spaceStore.subCategoryFormData.tag_category.json_data?.icon === "") {
        spaceStore.subCategoryFormData.tag_category.json_data.icon = "button.png"
      }

      spaceStore.subCategoryFormData.tag_category.name === "" ? errors.name = 1 : errors.name = 0
      spaceStore.subCategoryFormData.tag_category.json_data?.icon === "" ? errors.icon = 1 : errors.icon = 0

      return errors
    }

  // ============================ METHODS =========================== //

  // ============================ API REQUESTS =========================== //
    const addCategory = async (payload:Category) => {
      let uuid:string = ''
      //Post the category
      if (payload) {
        const data = {
          name: payload.name,
          folder_uuid: spaceStore.currentNode?.id,
          color: JSON.stringify(payload.color),
          json_data: JSON.stringify({
            color: payload.color
          }),
          parent_uuid: payload.parent_uuid ? payload.parent_uuid : null
        }
        try {
            const response = await api.post('/v1/categories',data)
            categories.value = response.data.data
            const categeory =  response.data.data
            uuid = categeory.uuid
            console.log("Parent uuid"+ uuid)
          //If there are subcategories included in the object and we have the uuid of the category. Perform bulk add
          if (payload.subcategories.length !== 0 && uuid !== '') {
            const postRequests = payload.subcategories.map(sub => {
              sub.folder_uuid = spaceStore.currentNode?.id
              //@ts-ignore
              sub.color = JSON.stringify(payload.color)
              //@ts-ignore
              sub.json_data = JSON.stringify({
                color: payload.color,
                icon: sub.icon
              })
              sub.parent_uuid = uuid
              return api.post('/v1/categories', sub)
            });

          try {
            const response = await axios.all(postRequests)
            console.log("Post request add subcategory:" + JSON.stringify(response))
          } catch (error) {
            console.log("Post request fail:" + error)
          }
          uuid = ''
        }
      } catch (error) {
        console.log("Category add failed" + error)
      }
    }

  }

  const bulkAddSubcategories = async (payload: Array<Category>, id: string) => {
    const postRequests = payload.map(sub => {
      sub.folder_uuid = spaceStore.currentNode?.id
      sub.parent_uuid = id
      return api.post('/v1/categories', sub)
    });

    try {
      const response = await axios.all(postRequests)
      console.log("Post request add subcategory:" + JSON.stringify(response))
    } catch (error) {
      console.log("Post request fail:" + error)
    }
  }

  const getCategories = async () => {
    try {
      const response = await api.get('/v1/categories')
      categories.value = categoryBuilder(response.data.data)
      // await localForage.setItem("categories", JSON.stringify(categories.value)); 
    } catch (error) {
      console.log(error)
    }
  }

  const getCategoriesByUnitId = async (payload: string) => {
    if (payload) {
      try {
        const response = await api.get(`/v1/categories/folder_uuid/${payload}`)
        return response.data.data
      } catch (error) {
        console.log(error)
      }
    }
  }

  const getSubcategoriesByUnitId = async (payload: string) => {
    if (payload) {
      try {
        const response = await api.get(`/v1/categories/owner_uuid/${payload}`)
        return response.data.data
      } catch (error) {
        console.log(error)
      }
    }
  }

    const updateCategory = async (payload:Category) => {
      if (payload) {
        const data = {
          name: payload.name,
          color: payload.color
        }
        try {
          console.log("Updating category")
            const response = await api.put(`/v1/categories/${payload.uuid}`,data)
            return response.data.data
        } catch (error) {
            console.log("Category update error "+error)
        }
      }
    }

  const bulkUpdateSubcategory = async (payload: Array<Category>) => {
    const postRequests = payload.map(sub => {
      const data = {
        name: sub.name,
        icon: sub.icon
      }
      return api.put(`/v1/categories/${sub.uuid}`, data)
    })

    try {
      const response = await axios.all(postRequests)
      console.log("PUT request update subcategories:" + JSON.stringify(response))
    } catch (error) {
      console.log("PUT request fail:" + error)
    }
  }

  const deleteCategory = async (payload:Category) => {
    //Delete subcategories first if there are any
    if (payload.subcategories.length !== 0) {
      const deleteRequests = payload.subcategories.map(sub => {
        return api.delete(`/v1/categories/${sub.uuid}`)
      })

      try {
        const response = await axios.all(deleteRequests)
        console.log("DELETE request delete subcategories:"+ JSON.stringify(response))
      } catch (error) {
        console.log("delete request fail:"+ error)
      }
    }
    //Delete category
    try {
      const response = await api.delete(`/v1/categories/${payload.uuid}`)
      return response.data.data
    } catch (error) {
        console.log(error)
    }
  }

  // ============================ END API REQUESTS =========================== //

  return {
    //state
    categories,
    // owner,

    //getters,
    // categoriesByOwnerId,

    //methods
    getCategories,
    getCategoriesByUnitId,
    addCategory,
    bulkAddSubcategories,
    bulkUpdateSubcategory,
    getSubcategoriesByUnitId,
    updateCategory,
    deleteCategory,
    validateSubCategoryForm
  }
})

// export const categoryStore = useCategoryStore()