import { defineStore } from "pinia"
import { ref, computed, watch } from "vue"
import type { MpSdk, ConnectOptions } from "../../public/bundle/sdk"

import type { _Tag, SpaceUnit, Facility, Category, SubCategory, EmbedlyData, Space } from '@/stores/types'
import { SPACE3D_SIDEBAR_VIEW } from '@/stores/types'
import { faker } from "@faker-js/faker/locale/ja";
import { useSpaceStore } from "@/stores/space"
import { config, fakeTagPositions, colors } from "./config"
import { TagPlacer } from './tagPlacer'
import axios from 'axios'
import { validURL } from '@/utils/validate'
// import { extractRGBValues } from "@/utils/color"

const spaceStore = useSpaceStore()

export const useMpStore = defineStore("mp", () => {
    // faker.setLocale('de')

    // ==============================        TYPES        ==============================

    interface TagDataError{
        relocation: boolean
        category: boolean 
        subCategory: boolean 
        name: boolean 
        description: boolean 
        invalid_url: boolean
    }

    interface ListFilter{
        category: Category | null,
        sub_category: SubCategory | null,
    }


    // ==============================      END TYPES      ==============================


    // ==============================        FLAGS        ==============================

    const sidebarView = ref(SPACE3D_SIDEBAR_VIEW.LIST) // for displaying tag list or tag form in template
    const isAddingTag = ref(false) // if true tag Form is add state otherwise update state
    const isCheckingMedia = ref(false) // loading state for getting embedly data
    const isSaving = ref(false) // loading state for saving/updating a tag
    const isRelocating = ref(false) // checker for tag is relocating 

    // ==============================      END FLAGS      ==============================



    // ==============================        STATE        ==============================
    const appKey = config.appKeyMp as unknown as ConnectOptions
    const mpSdk = ref<MpSdk>()
    const tags = ref<Array<_Tag>>([]) // tag list
    const tagData = ref<_Tag | null>(null) // used in tag form
    const mediaLink = ref('') // web media url
    const formLabel = ref('') // tag form label the <h3> tag

    const tagDataError = ref<TagDataError>({ // used in template for displaying errors
        relocation: false,
        category: false, 
        subCategory: false, 
        name: false, 
        description: false,
        invalid_url: false
    })
    const placer = ref<TagPlacer>() // TagPlacer class; used for relocating the tag
    const mediaInfo = ref<EmbedlyData>() // to dispay web media data in template via embedly

    const listFilter = ref<ListFilter>({ // for filtering tag list via category and/or subcategory
        category: null,
        sub_category: null,
    })

    // ==============================      END STATE      ===============================
    


    // ==============================       GETTERS       ===============================

    // returns the categories of the parent node data
    const categories = computed( () :Array<Category> | null => { 
        
        if(!spaceStore.parentNode){
            console.log('spaceStore.parentNode is null')
            return null
        }

        const facility = spaceStore.parentNode.data as Facility 
        
        if(!facility || !facility.categories) return []
        return facility.categories
    })

    // returns sub categories by tag category; dependent on the category is selected; used in tag form
    const subCategories = computed( () :Array<SubCategory> => { 
        if(!tagData.value?.data.category) return []
        return tagData.value.data.category.sub_category
    })

    // returns the tag category in tag form; used as computed so that it can be watch
    const tagDataCategory = computed( () :Category | null => { 
        if(tagData.value?.data.category) return tagData.value.data.category 
        return null
    })

    // use as filter in tag list base on tag category and subcategory dropdowns
    const tagList = computed( () :Array<_Tag> => {
        if(!listFilter.value.category) return tags.value 

        const tagsByCategory = tags.value.filter(i => i.data.category?.uuid === listFilter.value.category?.uuid)

        if(listFilter.value.sub_category){
            return tagsByCategory.filter(i => i.data.subcategory?.uuid === listFilter.value.sub_category?.uuid)
        }
        return tagsByCategory
    })

    // ==============================     END GETTERS     ===============================



    // ==============================       WATCHERS       ===============================

    //dropdown; set tag subcategory to empty every tag categ update or leave it as is during tag update
    watch(tagDataCategory, async(payload: Category | null) => {
        console.log('tagDataCategory()')

        // if(!tagData.value) return 

        // if(tagData.value.data.mp_data.id !== ''){
        //     const color = tagData.value?.data.category?.color as RGB
        //     await mpSdk.value?.Tag.editColor(tagData.value?.data.mp_data.id, color)
        // }

        
        const indx = payload?.sub_category.findIndex(i => i.uuid === tagData.value?.data.subcategory?.uuid)
        if(indx === -1){
            // set sub category dropdown to empty if it is not on tag category
            tagData.value!.data.subcategory = null
        }
    }) 

    // ==============================     END WATCHERS     ===============================
    


    // ==============================       METHODS       ================================


    // sets the sdk and called after iframe is loaded in Space3d.vue
    const onShowcaseConnect = async(sdk: MpSdk) => {
        console.log('onShowcaseConnect()')

        if(!sdk){
            console.error('sdk is undefined')
            return 
        }

        mpSdk.value = sdk
        console.log('Hello Bundle SDK', mpSdk.value)
        await removeMPTags() // remove matterport default tags

        // getParentNodeData({parent_uuid: spaceStore.selectedTreeItem?.parent_uuid}) 
        placer.value = new TagPlacer(mpSdk.value) // for tag placer class
        getTags()

        try {
            const modelData = await mpSdk.value.Model.getData()
            console.log('Model sid:' + modelData.sid)

            mpSdk.value?.App.state.subscribe( async(appState) => {
                console.log('appState', appState)
    

                if(appState.phase === mpSdk.value?.App.Phase.LOADING){
                    console.log('App is loading...')
                    
                }else if(appState.phase === mpSdk.value?.App.Phase.STARTING){
                    console.log('App is starting...')
                    await setMPTags()
                }else if(appState.phase === mpSdk.value?.App.Phase.PLAYING){
                    console.log('App is playing...')
                    setListeners()
                }
            })

            } catch (e) {
                console.error(e)
        }
    }

    // set listeners to matterport space
    const setListeners = () => {
        console.log('setListeners()')

        mpSdk.value?.Tag.data.subscribe({
            onAdded: (index, item, collection) => {
                console.log('onAdded ', item)
            },
            onUpdated: (index, item, collection) => {
                console.log('onUpdated ', item)
            },
            onRemoved: (index, item, collection) => {
                console.log('onRemoved ', item)
            },
        })
    }

    // gete tags from api
    const getTags = () => {
        console.log('getTags()')
        if(categories.value && categories.value.length > 0){
            tags.value = getFakeTags(10) // should not be greater than 10

        }
        console.log('tags', tags.value)
    }

    // set tags in space
    const setMPTags = async() => {
        tags.value.forEach(async tag => {
            const tba: MpSdk.Tag.Descriptor = tag.data.mp_data 
            const tagIds = await mpSdk.value?.Tag.add(tba) 

            if(tagIds){
                tag.data.mp_data.id = tagIds[0]
            }

        })
    }

    // remove default matterport tags in space
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

    // called when user updates a tag or add tag
    const initTagData = (tag?: _Tag) => { 
        console.log('initTagData()', tag)
        sidebarView.value = SPACE3D_SIDEBAR_VIEW.FORM 

        if(tag){
            console.log('updating...')
            isAddingTag.value = false 
            tagData.value = tag 
            formLabel.value = tag.data.mp_data.label

        }else{
            console.log('adding...')
            isAddingTag.value = true
            tagData.value = {
                uuid: '',
                parent_uuid: '',
                data: {
                    mp_data: {
                        id: '',
                        label: '',
                        description: '',
                        anchorPosition: {x:0,y:0,z:0},
                        stemVector: {x:0,y:0,z:0},
                        stemVisible: true,
                        color: {r:0, g:0, b: 0},
                        roomId: '',
                        attachments: ['']
                    },
                    category: (!!categories.value && categories.value.length) > 0 ? categories.value![0] : null,
                    subcategory: null,
                }
            }
        }
    }

    // clear tagData object
    const clearTagData = () => { 
        console.log('clearTagData()')
        sidebarView.value = SPACE3D_SIDEBAR_VIEW.LIST

        // if(tagData.value && isAddingTag.value){
        //     await removeTag(tagData.value)
        // }
        
        tagData.value = null

        tagDataError.value = {
            relocation: false,
            category: false, 
            subCategory: false, 
            name: false, 
            description: false,
            invalid_url: false,
        }

        mediaInfo.value = undefined
    }

    // user clicks the cancel button in tag form
    const revertUpdates = async() => {
        console.log('revertUpdates()')
        console.log('isAddingTag.value', isAddingTag.value)

        if(!tagData.value) return 

        if(isAddingTag.value){
            await removeTag(tagData.value)
        }else{ //
            console.log('else...')
            const tag = tags.value.find(i => i.uuid === tagData.value?.uuid)
            console.log('tag', tag)
            if(tag){
                console.log('reverting tag position')
                await mpSdk.value?.Tag.editPosition(tag.data.mp_data.id, {
                    anchorPosition: {...tag.data.mp_data.anchorPosition},
                    stemVector: {...tag.data.mp_data.stemVector},
                }) 
                // await mpSdk.value?.Tag.editColor(tagData.value.data.mp_data.id, tag.data.mp_data.color)
            }
        }

        clearTagData()
    }

    // remove in space and tags array
    const removeTag = async(tag: _Tag) => {
        console.log('removeTag', tag)
        await mpSdk.value?.Tag.remove(tag.data.mp_data.id)
        const indx = tags.value.findIndex(i => i.uuid === tag.uuid)
        if(indx !== -1){
            console.log('indx found', indx)
            console.log(tags.value[indx])
            tags.value.splice(indx, 1)
        }
    }

    // update tag in space
    const updateMPTag = async () => { 
        if(!tagData.value){
            console.error('tagData is undefined')
            return 
        }
        console.log('updateMPTag()', tagData.value)

        // https://www.youtube.com/watch?v=i43tkaTXtwI - lofi
        // https://www.youtube.com/watch?v=YSo7E8c8ujE - chill playlist
        
        try {
            // update media 
            if(mediaLink.value != ''){ // media is optional ?
                if(!(await setMedia())){ 
                    console.error('Media is not set')
                    isSaving.value = false 
                    return 
                }

                console.log('tagData.value', tagData.value)
                if(!isAddingTag.value && tagData.value?.data.media && tagData.value.data.media.id != ''){
                    console.log('detaching media...')
                    await mpSdk.value?.Tag.detach(tagData.value.data.mp_data.id, tagData.value.data.media.id)
                }

                console.log('mediaLink.value', mediaLink.value)

                const [attachmentId1] = await mpSdk.value!.Tag.registerAttachment(mediaLink.value)
                console.log('registerAttachment attachmentId1', attachmentId1)
                if(tagData.value?.data.media){
                    tagData.value.data.media.id = attachmentId1
                    console.log('tagData.value.media!.id', tagData.value.data.media.id)
                    await mpSdk.value?.Tag.attach(tagData.value.data.mp_data.id, tagData.value.data.media.id)
                    console.log('attaching media...', tagData.value.data.media)
                }

            }
            // -----------
    
            // update tag name and description
            console.log('updating billboard')
            await mpSdk.value?.Tag.editBillboard(tagData.value?.data.mp_data.id, {
                label: tagData.value.data.mp_data.label,
                description: tagData.value.data.mp_data.description
            })
            // -----------

            // update tag color 
            console.log('updating color')
            await mpSdk.value?.Tag.editColor(tagData.value?.data.mp_data.id, tagData.value?.data.category!.color.rgb)
    

            
        } catch (error) {
            console.error('Error in updateMPTag()', error)
        }

    }

    // add tag to matterport space
    const addMPTag = async() => { 
        if(!placer.value) return 
        console.log('addMPTag()')

        if(!tagData.value){
            console.error('tagData is undefined')
            return 
        }

        const tag = {} as MpSdk.Tag.Descriptor 
        tag.label = tagData.value?.data.mp_data.label 
        tag.description = tagData.value?.data.mp_data.label
        tag.anchorPosition = {x:0, y:0, z:0}
        tag.stemVector = {x:0, y:placer.value?.stemScalar, z:0}
        tag.color = tagData.value.data.category?.color.rgb

        const tagIds = await mpSdk.value?.Tag.add(tag)
        if(!tagIds){
            console.log('tagIds is not defined')
            return 
        }
        tagData.value.data.mp_data.id = tagIds[0]

        // addTag(tag)
    }

    // add tag to tags array
    const addTag = (tag: MpSdk.Tag.TagData ) => { 
        console.log('addTag()', tag)
        if(!spaceStore.selectedTreeItem?.uuid){
            console.log('spaceStore.selectedTreeItem?.uuid is undefined')
            return
        } 

        if(!tagData.value){
            console.error('tagData is undefined')
            return 
        }
        
        tag.id = tagData.value.data.mp_data.id

        if(placer.value?.anchorPosition){
            tag.anchorPosition = placer.value?.anchorPosition
        }
        if(placer.value?.stemVector){
            tag.stemVector = placer.value?.stemVector
        }

        const uuid = faker.datatype.uuid()
        tagData.value.uuid = uuid

        tags.value.push({
            uuid: uuid,
            parent_uuid: spaceStore.selectedTreeItem.uuid,
            data: {
                mp_data: tag,
                category: tagData.value.data.category,
                subcategory: tagData.value.data.subcategory,
            }
        })

    }

    // called in template for adding/updating a tag; validations also happens here
    const onSaveTag = async() => { 
        console.log('onSaveTag()')

        if(mediaLink.value.trim() === ''){
            tagDataError.value.invalid_url = false
        }

        // validations
        tagDataError.value.relocation = !tagData.value?.data.mp_data.id 
        tagDataError.value.category = !tagData.value?.data.category 
        tagDataError.value.subCategory = !tagData.value?.data.subcategory 
        tagDataError.value.name = !tagData.value?.data.mp_data.label 
        tagDataError.value.description = !tagData.value?.data.mp_data.description

        const errors = [tagDataError.value.category, tagDataError.value.subCategory, tagDataError.value.name, tagDataError.value.description, tagDataError.value.invalid_url]

        if(errors.includes(true)) return 
        // -------

        isSaving.value = true // loader for saving

        if(isAddingTag.value && tagData.value){
            addTag(tagData.value.data.mp_data) // add tag to tags array
        }else{
            updateTagIndx() // update data in tags array 
        }

        await updateMPTag() // update tags in matterport space

        clearTagData() // reset tag data and set SPACE3D_SIDEBAR_VIEW to LIST

        isSaving.value = false
    }

    // get data of the media url via embedly
    const getEmbedlyData = async (src: string) :Promise<{success: boolean, embedlyData?: EmbedlyData}> => {
        console.log('getEmbedlyData()')
        console.log('src', src)
        console.log('config.appKeyEmbedly', config.appKeyEmbedly)
        isCheckingMedia.value = true

        const res = await axios.get("https://api.embedly.com/1/oembed", {
          params: {
            url: src,
            key: config.appKeyEmbedly, 
          },
        }).catch( e => {
          console.error(`Bad request from embedly. Error: ${e}`)
          return {success: false}
        })

        isCheckingMedia.value = false

        // @ts-ignore
        const data = JSON.parse(JSON.stringify(res.data))
        console.log('Data from embedly', data)

        if(!data){
            return {success: false}
        }

        return {success: true, embedlyData: data}
    }

    // set media to template 
    const setMedia = async () :Promise<boolean> => {
        console.log('setMedia()')

        if(!tagData.value) return false 
        if(!mpSdk.value) return false 

        if(!validURL(mediaLink.value)){
            console.log('mediaLink.value invalid url', mediaLink.value)
            tagDataError.value.invalid_url = true
            return false
        }

        const {success, embedlyData} = await getEmbedlyData(mediaLink.value)
        if(!success){
            console.error('getEmbedlyData() error')
            tagDataError.value.invalid_url = true 
            return false
        }

        tagDataError.value.invalid_url = false
        mediaInfo.value = embedlyData 

        
        let type = mpSdk.value?.Tag.AttachmentType.VIDEO
        if(mediaInfo.value?.type === "photo") type = mpSdk.value?.Tag.AttachmentType.IMAGE
        else if(mediaInfo.value?.type === "rich") type = mpSdk.value?.Tag.AttachmentType.RICH
        else if(mediaInfo.value?.type === "audio") type = mpSdk.value?.Tag.AttachmentType.AUDIO

        let mediaId = ''
        if(!isAddingTag.value && tagData.value.data.media){
            mediaId = tagData.value.data.media.id
        }

        tagData.value.data.media = {
            id: mediaId,
            src: mediaLink.value,
            type: type 
        }

        console.log('setMedia success', tagData.value)

        return true 
    }

    // update selected tag on tags array
    const updateTagIndx = () => {
        console.log('updateTagIndx()')

        if(!placer.value) return 
        if(!tagData.value) return 
        
        const indx = tags.value.findIndex(tag => tag.uuid === tagData.value?.uuid)
        console.log('indx', indx)

        if(indx === -1){
            console.log('not found')
            return 
        }

        tagData.value.data.mp_data.anchorPosition = placer.value.anchorPosition
        tagData.value.data.mp_data.stemVector = placer.value.stemVector

        tags.value[indx] = tagData.value

        console.log('updated', tags.value[indx])
        
    }

    // user is relocating the tag
    const relocateTag = async() => {
        console.log('relocateTag()')

        if(!placer.value){
            console.log('placer is undefined')
            return 
        }

        if(!tagData.value) return 

        if(isAddingTag.value && tagData.value.data.mp_data.id === ''){
            await addMPTag()
        }

        isRelocating.value = true
        placer.value.tagDataId = tagData.value.data.mp_data.id
        placer.value.moveTag()
    }
    
    const navigateToTag = async(tag: _Tag) => {
        await mpSdk.value?.Mattertag.navigateToTag(tag.data.mp_data.id, mpSdk.value.Mattertag.Transition.FLY)
    }
    

    // ==============================     END METHODS    ===============================


    // ==============================      FAKE DATA    ==============================

    // Only these space model ids has anchor positions (Msfg36od5J3, qSGGhhjTYbN); you can manually add anchor positions in stores/config.ts
    const getFakeTags = (nTag: number) :Array<_Tag> => {
        console.log('getFakeTags()', nTag)
        
        const selectedSpace = spaceStore.selectedTreeItem?.data as Space 

        let hasPosition = false 
        for(let i in fakeTagPositions){
            if(i === selectedSpace.model_sid){
                hasPosition = true
                break 
            }
        }

        if(!hasPosition){
            console.info('selectedSpace has no fake anchor positions. You can add on the config file')
            return []
        }

        if(nTag > 10){
            console.error('Should not be greater than 10')
            nTag  = 10
        }
        

        const tags: Array<_Tag> = []
        
        // @ts-ignore
        const positions = fakeTagPositions[selectedSpace.model_sid]

        console.log('positions', positions)

        for(let i = 0; i < nTag; i++){
            const tag:  _Tag  = {
                uuid: faker.datatype.uuid(),
                parent_uuid: spaceStore.selectedTreeItem!.uuid,
                data: {
                    mp_data: {} as MpSdk.Tag.TagData,
                    category: null,
                    subcategory: null,
                }
            }
            let anchorPos = {x: 0, y:0, z:0}
            let stemVector = {x: 0, y:0, z:0}

            while(true){ // if random position has already exist, get again another position
                const randIndx = Math.floor(Math.random() * positions.length)
                const pos = positions[randIndx]
    
                const indx = tags.findIndex(i => i.data.mp_data.anchorPosition === pos['anchorPosition'])
                console.log('indx', indx)
                if(indx === -1){
                    anchorPos = pos['anchorPosition'] 
                    stemVector = pos['stemVector'] 
                    break
                }
            }

            let category: Category | null = null
            let sub_category: SubCategory | null = null

            if(categories.value && categories.value.length > 0){
                let randIndx = Math.floor(Math.random() * categories.value.length)
                category = categories.value[randIndx]
                randIndx = Math.floor(Math.random() * category.sub_category.length)
                sub_category = category.sub_category[randIndx]
            }



            tag.uuid = faker.datatype.uuid()
            tag.parent_uuid = spaceStore.selectedTreeItem!.uuid 

            tag.data.mp_data.anchorPosition = anchorPos 
            tag.data.mp_data.stemVector = stemVector
            tag.data.mp_data.label = `${faker.name.firstName()}'s Tag`
            tag.data.mp_data.description = `${faker.name.fullName()}'s property`
            tag.data.category = category
            tag.data.mp_data.color = category ? category.color.rgb : {r:0,g:0,b:0}
            tag.data.subcategory = sub_category

            tags.push(tag)

        }

        return tags

    }


    // ==============================    END FAKE DATA   ==============================

    return {
        // flags
        sidebarView,
        isAddingTag,
        isCheckingMedia,
        isSaving,
        isRelocating,

        // getters
        categories,
        subCategories,
        tagList,

        // state
        appKey, 
        mpSdk,
        tags,
        tagData,
        tagDataError,
        mediaInfo,
        listFilter,
        formLabel,
        mediaLink,
        

        // methods
        // init,
        onShowcaseConnect,
        initTagData,
        clearTagData,
        removeTag,
        updateMPTag,
        relocateTag,
        onSaveTag,
        setMedia,
        navigateToTag,
        revertUpdates
    }

})


/*   
    Add Tag Flow: 
        1. User clicks Add Tag button
            1A. initTagData()         - INITIALIZE TAG
        2. User clicks relocate icon  
            2A. relocateTag()         - RELOCATE TAG HANDLER
            2B. addMPTag()            - ADD TAG TO MATTERPORT SPACE
            2C. placer.moveTag()      - MOVE AND PLACE TAG ON THE SPACE
            
        3. User fill up form 
            3A. tagData is binded     - TAG FIELDS IN TAG FORM TEMPLATE IS BINDED TO tagData in store
                3A-A. Category - tagData.category
                3A-B. Sub Category - tagData.subcategory
                3A-C. Tag Name - tagData.name
                3A-D. Tag Description - tagData.description
        4. User clicks Add button     
            4A. onSaveTag()           - FUNCTION CALLED ON THE VIEW (Space3dView.vue); SAVE TO DB
            2E. AddTag()              - ADD TAG TO STORE
            4B. updateMPTag()         - UPDATE TAG IN MATTERPORT SPACE 
            4D. updateTagIndx()       - UPDATE DATA ON TAGS ARRAY FROM tagData Object
            4E. clearTagData()        - RESET tagData OBJECT AND SET SPACE3D_SIDEBAR_VIEW TO "LIST"; CLOSES THE TAG FORM IN TEMPLATE

    Update Tag Flow: 
        1. User clicks pencil icon in table row
            1A. initTagData(tag)         - INITIALIZE TAG
        2. User clicks relocate icon  
            2A. relocateTag()         - RELOCATE TAG HANDLER
            2B. placer.moveTag()      - MOVE AND PLACE TAG ON THE SPACE
        3. User update form 
            3A. tagData is binded     - TAG FIELDS IN TAG FORM TEMPLATE IS BINDED TO tagData in store
                3A-A. Category - tagData.category
                3A-B. Sub Category - tagData.subcategory
                3A-C. Tag Name - tagData.name
                3A-D. Tag Description - tagData.description
        4. User clicks Update button     
            4A. onSaveTag()           - FUNCTION CALLED ON THE VIEW (Space3dView.vue); SAVE TO DB
            4B. updateMPTag()         - UPDATE TAG IN MATTERPORT SPACE
            4D. updateTagIndx()       - UPDATE DATA ON TAGS ARRAY FROM tagData Object
            4E. clearTagData()        - RESET tagData OBJECT AND SET SPACE3D_SIDEBAR_VIEW TO "LIST"; CLOSES THE TAG FORM IN TEMPLATE


*/
