import axios from "axios";
import { defineStore } from "pinia";
import type { ConnectOptions, MpSdk } from "public/bundle/sdk";
import { computed, ref } from "vue";
import { config } from "./config";
import type { Space } from "./types";

const apiURL = import.meta.env.VITE_API_URL + "/v1";
console.log("apiURL...", apiURL);

const api = axios.create({
  baseURL: apiURL,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
});

export const usePublicSpace = defineStore("publicSpace", () => {

  const appKey = config.appKeyMp as unknown as ConnectOptions
  const mpSdk = ref<MpSdk>()
  const space = ref<Space>()

  const modelSid = computed( () => {
    if(!space.value)return 
     
    return space.value.space_sid
  })

  const getSpace = async(spaceId: string) :Promise<Space | null> => {
    console.log('getSpace()')

    console.log('spaceId', spaceId)

    try {
      const res = await api.get(`/spaces/${spaceId}`)

      if(res.status === 200){

        const responseData: Array<Space> = res.data.data
        console.log('responseData', responseData)

        return responseData[0]

      }else{
        console.error('Error status: ', res.status)
        console.error('Error statusText: ', res.statusText)
      }

    } catch (error) {
      console.log('Error ' + error)
    }

    return null

  }

  const setSpace = (payload: Space) => {
    console.log('setSpace()')
    console.log('payload', payload)
    space.value = payload
  }

  const onShowcaseConnect = async(sdk: MpSdk) => {
    console.log('onShowcaseConnect()')

    if(!sdk){
        console.error('sdk is undefined')
        return 
    }

    mpSdk.value = sdk
    console.log('Hello Bundle SDK', mpSdk.value)
    await removeMPTags() 

    try {
      const modelData = await mpSdk.value.Model.getData()
      console.log('Model sid:' + modelData.sid)

      } catch (e) {
          console.error(e)
    }
  }

  const removeMPTags = async() => {
    if(!mpSdk.value){
        console.error('mpSdk.value is undefined')
        return 
    }
    console.log('removeMPTags()')
    const tags = await mpSdk.value?.Mattertag.getData()
    const tagIds = tags?.map( (i: MpSdk.Mattertag.MattertagData) => i.sid )
    await mpSdk.value.Mattertag.remove(tagIds) 
  } 

  return {
    appKey,
    modelSid,
    space,
    onShowcaseConnect,
    getSpace,
    setSpace,
  };
});

