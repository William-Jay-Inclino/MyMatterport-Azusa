import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Category, Role } from './types'
import { colors } from "./config"
import axios from 'axios'
import { useCategoryStore } from './categories'
import { useSpaceStore } from './space'
import { faker } from '@faker-js/faker';
import { categories } from './localization'

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

export const useRoleStore = defineStore('role', () => {

  // ============================ STATE =========================== //
  const spaceStore = useSpaceStore()
  const categoryStore = useCategoryStore()
  const roles = ref<Array<Role>>([])

  // ============================ END STATE =========================== //

  // ============================ METHODS =========================== //
  const roleBuilder = async (params: Array<Role>) => {
    await categoryStore.getCategories()
    //This is a temporary function that we use to add other properties the role since the db
    //does not have a color column yet
    const roles = params.map(param => {
      if (typeof param.color === 'string' && param.color !== null) {
        param.color = JSON.parse(param.color)
      }
      param.categories = []
      return param
    })
    return roles
  }

  // ============================ METHODS =========================== //

  // ============================ API REQUESTS =========================== //

  const addRole = async (payload: Role) => {
    const data = {
      name: payload.name,
      folder_uuid: spaceStore.currentNode?.id ? spaceStore.currentNode.id : '',
      color: JSON.stringify(payload.color)
    }
    try {
      const response = await api.post('/v1/roles', data)
      // const role = await roleBuilder(response.data.data)
      // roles.value.push(role[0])
      console.log("Role add sucess" + JSON.stringify(response.data.data))
    } catch (error) {
      console.log("Role add failed" + error)
    }
  }

  const getRoles = async () => {
    try {
      const response = await api.get('/v1/roles')
      console.log("Roles before building " + JSON.stringify(response.data.data))
      roles.value = await roleBuilder(response.data.data)
      console.log("Roles after building " + JSON.stringify(roles.value))
    } catch (error) {
      console.log(error)
    }
  }

  const getRolesByUnitId = async (payload: string) => {
    if (payload) {
      try {
        const response = await api.get(`/v1/roles/folder_uuid/${payload}`)
        return response.data.data
      } catch (error) {
        console.log(error)
      }
    }
  }

  const updateRole = async (payload: Role) => {
    try {
      const response = await api.put(`/v1/roles/${payload.uuid}`, payload)
      const role = await roleBuilder(response.data.data)

      console.log("Role update sucess" + JSON.stringify(response.data.data))
    } catch (error) {
      console.log("Role update failed" + error)
    }
  }

  const deleteRole = async (payload: string) => {
    if (payload) {
      try {
        const response = await api.delete(`/v1/roles/${payload}`)
        return response.data.data
      } catch (error) {
        console.log(error)
      }
    }
  }

  // ============================ END API REQUESTS =========================== //

  return {
    //state
    roles,

    //methods
    getRoles,
    addRole,
    getRolesByUnitId,
    updateRole,
    deleteRole,
  }
})

//export const roleStore = useRoleStore()