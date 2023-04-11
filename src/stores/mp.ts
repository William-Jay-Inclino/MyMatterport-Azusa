import { defineStore } from "pinia"
import { ref, computed, watch } from "vue"
import type { MpSdk, ConnectOptions } from "../../public/bundle/sdk"
import type { _Tag, Facility, Category, EmbedlyData, Space, COLOR, TagColor } from '@/stores/types'
import { SPACE3D_SIDEBAR_VIEW, ACTIVITY_TYPE } from '@/stores/types'
import { faker } from '@faker-js/faker';
import { useSpaceStore } from "@/stores/space"
import { config, fakeTagPositions, colors } from "./config"
import { TagPlacer } from './tagPlacer'
import axios from 'axios'
import { validURL } from '@/utils/validate'
import dayjs from "dayjs"
import { useActivityStore } from "./activity"

// axios API
// const apiURL = "http://localhost:5173/api" + "/v1";
const apiURL = import.meta.env.VITE_API_URL + "/v1"

console.log("apiURL...", apiURL);

const api = axios.create({
    baseURL: apiURL,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
    },
});


const spaceStore = useSpaceStore()
const activityStore = useActivityStore()

faker.setLocale(import.meta.env.VITE_APP_LANG)

export const useMpStore = defineStore("mp", () => {
    let now = dayjs()
    // ==============================        TYPES        ==============================

    interface TagDataError {
        relocation: boolean
        category: boolean
        subCategory: boolean
        name: boolean
        description: boolean
        invalid_url: boolean
        embedly: boolean
    }

    interface ListFilter {
        category: Category | null,
        sub_category: Category | null,
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
        invalid_url: false,
        embedly: false,
    })
    const placer = ref<TagPlacer>() // TagPlacer class; used for relocating the tag
    const mediaInfo = ref<EmbedlyData | null>(null) // to dispay web media data in template via embedly

    const listFilter = ref<ListFilter>({ // for filtering tag list via category and/or subcategory
        category: null,
        sub_category: null,
    })

    const allCategories = ref<Array<Category>>([])

    const category = ref<Category | null>() // tag form category select 
    const subCategory = ref<Category | null>(null) // tag form subcategory select 

    // ==============================      END STATE      ===============================



    // ==============================       GETTERS       ===============================

    const categories = computed((): Array<Category> => {

        if (allCategories.value.length === 0) return []

        return allCategories.value.filter(i => !i.parent_uuid)

    })

    const subCategories = computed((): Array<Category> => {
        console.log('Computed - subCategories')

        if (categories.value?.length === 0 || allCategories.value.length === 0) return []

        let categorySelected: Category

        if (sidebarView.value === SPACE3D_SIDEBAR_VIEW.LIST) {
            if (!listFilter.value.category) return []
            categorySelected = listFilter.value.category
        } else {

            if (!category.value) return []
            categorySelected = category.value
        }

        const subCategs = allCategories.value.filter(i => i.parent_uuid === categorySelected.uuid)

        if (subCategs.length > 0) return subCategs
        return []

    })

    // use as filter in tag list base on tag category and subcategory dropdowns
    const tagList = computed((): Array<_Tag> => {
        if (!listFilter.value.category) return tags.value

        const tagsByCategory = tags.value.filter(i => {

            console.log('__i', i.category_uuid)

            const subCateg = subCategories.value.find(j => j.uuid === i.category_uuid)
            console.log('__subCateg')

            if (subCateg && subCateg.parent_uuid === listFilter.value.category?.uuid) {
                return i
            }
            // i.category_uuid === listFilter.value.category?.uuid 


            // return i
        })

        console.log('__tagsByCategory', tagsByCategory)

        if (listFilter.value.sub_category) {
            return tagsByCategory.filter(i => i.category_uuid === listFilter.value.sub_category?.uuid)
        }
        return tagsByCategory
    })

    // ==============================     END GETTERS     ===============================



    // ==============================       WATCHERS       ===============================

    //dropdown; set tag subcategory to empty every tag categ update or leave it as is during tag update
    watch(category, async () => {
        console.log('tagDataCategory()')

        const indx = subCategories.value.findIndex(i => i.uuid === subCategory.value?.uuid)
        if (indx === -1) {
            // set sub category dropdown to empty if it is not on tag category
            subCategory.value = null
        }
    })

    // ==============================     END WATCHERS     ===============================



    // ==============================       METHODS       ================================


    // sets the sdk and called after iframe is loaded in Space3d.vue
    const onShowcaseConnect = async (sdk: MpSdk) => {
        console.log('onShowcaseConnect()')

        if (!sdk) {
            console.error('sdk is undefined')
            return
        }

        await getCategoriesByFolderId()

        mpSdk.value = sdk
        console.log('Hello Bundle SDK', mpSdk.value)
        await removeMPTags() // remove matterport default tags

        // getParentNodeData({parent_uuid: spaceStore.selectedTreeItem?.parent_uuid}) 
        placer.value = new TagPlacer(mpSdk.value) // for tag placer class
        await getTags()

        try {
            const modelData = await mpSdk.value.Model.getData()
            console.log('Model sid:' + modelData.sid)

            mpSdk.value?.App.state.subscribe(async (appState) => {
                console.log('appState', appState)


                if (appState.phase === mpSdk.value?.App.Phase.LOADING) {
                    console.log('App is loading...')

                } else if (appState.phase === mpSdk.value?.App.Phase.STARTING) {
                    console.log('App is starting...')
                    await setMPTags()
                } else if (appState.phase === mpSdk.value?.App.Phase.PLAYING) {
                    console.log('App is playing...')
                    // setListeners()
                }
            })

        } catch (e) {
            console.error(e)
        }
    }

    // set tags in space
    const setMPTags = async () => {

        if (tags.value.length === 0) return
        if (!mpSdk.value) {
            console.error('mpSdk.value is undefined')
            return
        }

        tags.value.forEach(async tag => {
            const tba: MpSdk.Tag.Descriptor = tag.json_data.mp_data

            // if(spaceStore.parentNode && spaceStore.parentNode.categories && spaceStore.parentNode.categories.length > 0){

            //     const parentCateg = spaceStore.parentNode.categories.find(i => i.uuid === tag.category_uuid)

            //     console.log('__parentCateg', parentCateg)

            //     if(parentCateg){
            //         const color = colors.find(c => c.name === (parentCateg.color.name as unknown as COLOR) )

            //         console.log('__color', color)
            //         if(color){
            //             tba.color = color.rgb
            //         }
            //     }

            // }

            const subCateg = allCategories.value.find(i => i.uuid === tag.category_uuid)

            if (subCateg) {
                const parentCateg = allCategories.value.find(i => i.uuid === subCateg.parent_uuid)
                if (parentCateg && parentCateg.json_data) {
                    tba.color = parentCateg.json_data.color.rgb
                }
            }



            // remove attachment/media; attachment ID will be renewed
            if (tba.attachments && tba.attachments.length > 0) {
                delete tba.attachments
            }

            console.log('__tba', tba)

            const tagIds = await mpSdk.value?.Tag.add(tba)

            if (tagIds) {
                tag.json_data.mp_data.id = tagIds[0]

                // set attachment/media; renew attachment ID 
                if (tag.json_data.media) {
                    const [attachmentId1] = await mpSdk.value!.Tag.registerAttachment(tag.json_data.media.src)
                    tag.json_data.media.id = attachmentId1
                    tag.json_data.mp_data.attachments = [attachmentId1]
                    await mpSdk.value!.Tag.attach(tag.json_data.mp_data.id, attachmentId1)
                }

            }

        })
    }

    // remove default matterport tags in space
    const removeMPTags = async () => {
        if (!mpSdk.value) {
            console.error('mpSdk.value is undefined')
            return
        }
        console.log('removeMPTags()')
        const tags = await mpSdk.value?.Mattertag.getData()
        const tagIds = tags?.map((i: MpSdk.Mattertag.MattertagData) => i.sid)
        await mpSdk.value.Mattertag.remove(tagIds)
    }

    // called when user updates a tag or add tag
    const initTagData = async (tag?: _Tag) => {
        console.log('initTagData()', tag)
        sidebarView.value = SPACE3D_SIDEBAR_VIEW.FORM

        if (tag) {
            console.log('updating...')
            isAddingTag.value = false
            tagData.value = tag

            if (!categories.value) {
                console.error('categories.value is undefined')
                return
            }

            // category.value = allCategories.value.find(i => i.uuid === tag.category_uuid)
            // category.value = getCategory(tag.category_uuid)

            if (category.value && subCategories.value && subCategories.value.length > 0) {
                const subCateg = subCategories.value.find(i => i.uuid === tag.category_uuid)
                if (subCateg) {
                    subCategory.value = subCateg
                    if (subCategory.value.parent_uuid) {
                        category.value = allCategories.value.find(i => i.uuid === subCategory.value?.parent_uuid)
                    } else {
                        console.error('subCategory has no parent_uuid')
                    }
                }
            }

            placer.value!.anchorPosition = tag.json_data.mp_data.anchorPosition
            placer.value!.stemVector = tag.json_data.mp_data.stemVector

            formLabel.value = tag.json_data.mp_data.label
            if (tagData.value.json_data.media) {
                mediaLink.value = tagData.value.json_data.media.src
                await setMedia()
            }

        } else {
            console.log('adding...')
            isAddingTag.value = true

            if (categories.value && categories.value.length > 0) {
                category.value = categories.value[0]
            }

            tagData.value = {
                uuid: '',
                name: '',
                space_uuid: '',
                category_uuid: '',
                json_data: {
                    mp_data: {
                        id: '',
                        label: '',
                        description: '',
                        anchorPosition: { x: 0, y: 0, z: 0 },
                        stemVector: { x: 0, y: 0, z: 0 },
                        stemVisible: true,
                        color: { r: 0, g: 0, b: 0 },
                        roomId: '',
                        attachments: ['']
                    },
                    // category: (!!categories.value && categories.value.length) > 0 ? categories.value![0] : null,
                    // subcategory: null,
                }
            }
        }
    }

    // clear tagData object
    const clearTagData = () => {
        console.log('clearTagData()')
        sidebarView.value = SPACE3D_SIDEBAR_VIEW.LIST

        tagData.value = null
        subCategory.value = null

        tagDataError.value = {
            relocation: false,
            category: false,
            subCategory: false,
            name: false,
            description: false,
            invalid_url: false,
            embedly: false,
        }

        mediaInfo.value = null
        mediaLink.value = ''
    }

    // user clicks the cancel button in tag form
    const revertUpdates = async () => {
        console.log('revertUpdates()')
        console.log('isAddingTag.value', isAddingTag.value)

        if (!tagData.value) return

        if (isAddingTag.value) {
            if (tagData.value.json_data.mp_data.id !== '') {
                await removeTag(tagData.value)
            }
        } else { //
            console.log('else...')
            const tag = tags.value.find(i => i.uuid === tagData.value?.uuid)
            console.log('tag', tag)
            if (tag) {
                console.log('reverting tag position')
                await mpSdk.value?.Tag.editPosition(tag.json_data.mp_data.id, {
                    anchorPosition: { ...tag.json_data.mp_data.anchorPosition },
                    stemVector: { ...tag.json_data.mp_data.stemVector },
                })
                // await mpSdk.value?.Tag.editColor(tagData.value.data.mp_data.id, tag.data.mp_data.color)
            }
        }

        clearTagData()
    }

    // update tag in space
    const updateMPTag = async () => {
        if (!tagData.value) {
            console.error('tagData is undefined')
            return
        }
        console.log('updateMPTag()', tagData.value)

        // https://www.youtube.com/watch?v=i43tkaTXtwI - lofi
        // https://www.youtube.com/watch?v=YSo7E8c8ujE - chill playlist

        try {
            // update media 
            if (mediaLink.value != '') { // media is optional ?
                console.log('has media link')
                if (!(await setMedia())) {
                    console.error('Media is not set')
                    isSaving.value = false
                    return
                }

                console.log('tagData.value', tagData.value)
                if (!isAddingTag.value && tagData.value?.json_data.media && tagData.value.json_data.media.id != '') {
                    console.log('detaching media...')
                    await mpSdk.value?.Tag.detach(tagData.value.json_data.mp_data.id, tagData.value.json_data.media.id)
                }

                console.log('mediaLink.value', mediaLink.value)

                const [attachmentId1] = await mpSdk.value!.Tag.registerAttachment(mediaLink.value)
                console.log('registerAttachment attachmentId1', attachmentId1)
                if (tagData.value?.json_data.media) {
                    tagData.value.json_data.media.id = attachmentId1
                    console.log('tagData.value.media!.id', tagData.value.json_data.media.id)
                    await mpSdk.value?.Tag.attach(tagData.value.json_data.mp_data.id, tagData.value.json_data.media.id)
                    console.log('attaching media...', tagData.value)
                }

            }
            // -----------

            // update tag name and description
            console.log('updating billboard')
            await mpSdk.value?.Tag.editBillboard(tagData.value?.json_data.mp_data.id, {
                label: tagData.value.json_data.mp_data.label,
                description: tagData.value.json_data.mp_data.description
            })
            // -----------

            // update tag color 
            console.log('updating color')
            if (category.value && category.value.json_data) {
                await mpSdk.value?.Tag.editColor(tagData.value?.json_data.mp_data.id, category.value.json_data.color.rgb as MpSdk.Color)
            }

            updateTagIndx()

        } catch (error) {
            console.error('Error in updateMPTag()', error)
        }

    }

    // add tag to matterport space
    const addMPTag = async () => {
        if (!placer.value) return
        console.log('addMPTag()')

        if (!tagData.value) {
            console.error('tagData is undefined')
            return
        }

        if (!category.value) {
            console.error('category.value is undefined')
            return
        }

        if (!category.value.json_data) {
            console.error('category.value.json_data is undefined')
            return
        }

        const tag = {} as MpSdk.Tag.Descriptor
        tag.label = tagData.value.json_data.mp_data.label
        tag.description = tagData.value.json_data.mp_data.label
        tag.anchorPosition = { x: 0, y: 0, z: 0 }
        tag.stemVector = { x: 0, y: placer.value?.stemScalar, z: 0 }
        tag.color = category.value.json_data.color.rgb
        // tag.color = tagData.value.json_data.category?.color.rgb

        const tagIds = await mpSdk.value?.Tag.add(tag)
        if (!tagIds) {
            console.log('tagIds is not defined')
            return
        }
        tagData.value.json_data.mp_data.id = tagIds[0]

        // addTag(tag)
    }

    // called in template for adding/updating a tag; validations also happens here
    const onSaveTag = async () => {
        console.log('onSaveTag()')

        if (!tagData.value || !category.value) return

        if (!canSave()) return
        isSaving.value = true // loader for saving

        await updateMPTag() // update tags in matterport space

        // set neccessary values
        if (category.value && category.value.json_data) {
            tagData.value.json_data.mp_data.color = category.value.json_data.color.rgb
        } else {
            console.error('category.value or category.value.json_data is undefined')
        }

        if (placer.value?.anchorPosition) {
            tagData.value.json_data.mp_data.anchorPosition = placer.value?.anchorPosition
        }
        if (placer.value?.stemVector) {
            tagData.value.json_data.mp_data.stemVector = placer.value?.stemVector
        }

        if (!tagData.value.json_data.media) {
            // @ts-ignore
            delete tagData.value.json_data.mp_data.attachments
        }
        // ------------------------

        const uuid = await saveToDb()

        if (isAddingTag.value && uuid) {
            tagData.value.uuid = uuid
            tags.value.push(tagData.value)
        }

        clearTagData()

        isSaving.value = false
    }

    const canSave = (): boolean => {
        console.log('canSave()')

        if (mediaLink.value.trim() === '') {
            tagDataError.value.invalid_url = false
        } else {
            tagDataError.value.invalid_url = !validURL(mediaLink.value)
            if (!tagDataError.value.invalid_url) {
                // check if media is checked using embedly 
                tagDataError.value.embedly = !mediaInfo.value
            }
        }


        // validations
        tagDataError.value.relocation = !tagData.value?.json_data.mp_data.id
        tagDataError.value.category = !category.value
        tagDataError.value.subCategory = !subCategory.value
        tagDataError.value.name = !tagData.value?.json_data.mp_data.label
        tagDataError.value.description = !tagData.value?.json_data.mp_data.description

        const errors = [tagDataError.value.relocation, tagDataError.value.category, tagDataError.value.subCategory, tagDataError.value.name, tagDataError.value.description, tagDataError.value.invalid_url, tagDataError.value.embedly]

        if (errors.includes(true)) {
            console.log('has error; cannot proceed saving')
            return false
        }

        return true

    }

    // get data of the media url via embedly
    const getEmbedlyData = async (src: string): Promise<{ success: boolean, embedlyData?: EmbedlyData }> => {
        console.log('getEmbedlyData()')
        console.log('src', src)
        console.log('config.appKeyEmbedly', config.appKeyEmbedly)
        isCheckingMedia.value = true

        const res = await axios.get("https://api.embedly.com/1/oembed", {
            params: {
                url: src,
                key: config.appKeyEmbedly,
            },
        }).catch(e => {
            console.error(`Bad request from embedly. Error: ${e}`)
            return { success: false }
        })

        isCheckingMedia.value = false

        // @ts-ignore
        const data = JSON.parse(JSON.stringify(res.data))
        console.log('Data from embedly', data)

        if (!data) {
            return { success: false }
        }

        return { success: true, embedlyData: data }
    }

    // set media to template 
    const setMedia = async (): Promise<boolean> => {
        console.log('setMedia()')

        if (!tagData.value) return false
        if (!mpSdk.value) return false

        if (!validURL(mediaLink.value)) {
            console.log('mediaLink.value invalid url', mediaLink.value)
            tagDataError.value.invalid_url = true
            return false
        }

        const { success, embedlyData } = await getEmbedlyData(mediaLink.value)
        if (!success) {
            console.error('getEmbedlyData() error')
            tagDataError.value.invalid_url = true
            return false
        }

        tagDataError.value.invalid_url = false
        mediaInfo.value = embedlyData || null


        let type = mpSdk.value?.Tag.AttachmentType.VIDEO
        if (mediaInfo.value?.type === "photo") type = mpSdk.value?.Tag.AttachmentType.IMAGE
        else if (mediaInfo.value?.type === "rich") type = mpSdk.value?.Tag.AttachmentType.RICH
        else if (mediaInfo.value?.type === "audio") type = mpSdk.value?.Tag.AttachmentType.AUDIO

        let mediaId = ''
        if (!isAddingTag.value && tagData.value.json_data.media) {
            mediaId = tagData.value.json_data.media.id
        }

        tagData.value.json_data.media = {
            id: mediaId,
            src: mediaLink.value,
            type: type
        }

        console.log('setMedia success', tagData.value)

        return true
    }

    const removeMedia = async () => {
        console.log("🚀 ~ file: mp.ts:580 ~ removeMedia ~ removeMedia():")

        if (!tagData.value || !tagData.value.json_data.media) return
        mediaInfo.value = null
        mediaLink.value = ''


        if (tagData.value.json_data.mp_data.id !== '' && tagData.value.json_data.media) {
            console.log('detaching media...', tagData.value)
            await mpSdk.value?.Tag.detach(tagData.value.json_data.mp_data.id, tagData.value.json_data.media.id)
        }
        tagData.value.json_data.media = undefined
    }

    // update selected tag on tags array
    const updateTagIndx = () => {
        console.log('updateTagIndx()')

        if (!placer.value) return
        if (!tagData.value) return

        const indx = tags.value.findIndex(tag => tag.uuid === tagData.value?.uuid)
        console.log('indx', indx)

        if (indx === -1) {
            console.log('not found')
            return
        }

        tagData.value.json_data.mp_data.anchorPosition = placer.value.anchorPosition
        tagData.value.json_data.mp_data.stemVector = placer.value.stemVector

        // @ts-ignore
        tagData.value.json_data.mp_data.color = tagData.value.json_data.category?.color.rgb
        if (tagData.value.json_data.media && tagData.value.json_data.media.id) {
            console.log('has media')
            tagData.value.json_data.mp_data.attachments = [tagData.value.json_data.media.id]
        }

        tags.value[indx] = tagData.value

        console.log('updated', tags.value[indx])

    }

    // user is relocating the tag
    const relocateTag = async () => {
        console.log('relocateTag()')

        if (!placer.value) {
            console.log('placer is undefined')
            return
        }

        if (!tagData.value) return

        if (isAddingTag.value && tagData.value.json_data.mp_data.id === '') {
            await addMPTag()
        }

        isRelocating.value = true
        placer.value.tagDataId = tagData.value.json_data.mp_data.id
        placer.value.moveTag()
    }

    const navigateToTag = async (tag: _Tag) => {
        await mpSdk.value?.Mattertag.navigateToTag(tag.json_data.mp_data.id, mpSdk.value.Mattertag.Transition.FLY)

        if(!spaceStore.currentNode || !spaceStore.currentNode.id) return 

        activityStore.addActivity(
            //@ts-ignore
            {
                space_uuid: spaceStore.currentNode.id,
                created_on: now.format("YYYY/MM/DD"),
                type: ACTIVITY_TYPE.TAG_CLICK
            }
        )
    }

    const renderTagsInSpace = async () => {
        console.log('renderTagsInSpace()')
        // remove all tags in space 
        const idsRemoved = tags.value.map(i => i.json_data.mp_data.id)
        await mpSdk.value?.Tag.remove(...idsRemoved)

        if (tagList.value.length === 0) return

        // render all filtered tags and update corresponding mp_data ids
        tagList.value.forEach(async (tag) => {
            console.log('__render tag', tag)
            if (tag.json_data.media) {
                tag.json_data.mp_data.attachments = [tag.json_data.media.id]
            }
            const idsArray = await mpSdk.value?.Tag.add(tag.json_data.mp_data)
            console.log('idsArray', idsArray)
            if (idsArray) {
                tag.json_data.mp_data.id = idsArray[0]
            }
        })
    }




    // API REQUESTS 

    const getTags = async () => {
        console.log('getTags()')
        console.log('categories.value', categories.value)

        if (!spaceStore.currentNode) {
            console.error('spaceStore.currentNode is undefined')
            return
        }

        if (categories.value && categories.value.length > 0) {

            try {

                interface Response {
                    created_by: string | null,
                    created_on: string,
                    ip: string,
                    json_data: string,
                    modified_by: string | null,
                    modified_on: string,
                    owner_uuid: string | null,
                    space_uuid: string,
                    category_uuid: string,
                    tag_uuid: string | null,
                    uuid: string,
                    name: string,
                }

                const data = await (await api.get("/tags/space_uuid/" + spaceStore.currentNode.folder_uuid)).data.data as Array<Response>
                console.log('data', data)
                tags.value = data.map(i => {
                    let json_data = JSON.parse(i.json_data)
                    console.log('json_data', json_data)
                    const tag = {} as _Tag
                    tag.uuid = i.uuid
                    tag.space_uuid = i.space_uuid
                    tag.json_data = json_data
                    tag.category_uuid = i.category_uuid
                    tag.name = i.name

                    return tag
                })


            } catch (error) {
                console.error('Error getTags() ' + error)
                return null
            }


            // should not be greater than 10
            // tags.value = getFakeTags(10) 

        }
        console.log('tags', tags.value)
    }

    const saveToDb = async () => {

        console.log('saveToDb()')

        if (!tagData.value) {
            console.error('tagData.value is undefined')
            return
        }

        if (!spaceStore.currentNode) {
            console.error('spaceStore.currentNode is undefined')
            return
        }

        if (!subCategory.value) {
            console.error('subCategory.value is undefined')
            return
        }

        // tagData.value.category_uuid = category.value ? category.value.uuid : ''
        tagData.value.category_uuid = subCategory.value.uuid
        tagData.value.space_uuid = spaceStore.currentNode?.folder_uuid
        tagData.value.name = tagData.value.json_data.mp_data.label

        if (isAddingTag.value) {
            delete tagData.value.uuid
        }


        console.log('tagData.value', tagData.value)

        let tag = JSON.parse(JSON.stringify(tagData.value)) as {
            uuid?: string,
            name: string,
            space_uuid: string,
            category_uuid: string,
            json_data: string,
        }

        tag.json_data = JSON.stringify(tag.json_data)

        console.log('__tag', tag)

        try {

            let response

            if (tag.uuid) {
                // response = await api.put("/tags/", {params: tag})
                // response = await api.put("/tags.json", {params: tag})
                response = await api.put("/tags/" + tag.uuid + ".json/", tag)
                // response = await api.put("/tags.json/", tag)
            } else {
                response = await api.post("/tags.json/", tag)
            }

            console.log('response', response)

            if (response.status === 200) {
                console.log('successfully saved to api')
                const data = response.data.data as _Tag
                return data.uuid
            } else {
                console.error(`Error: ` + response.data)
            }

        } catch (error) {
            console.error('Error addTag() ' + error)
            return null
        }
    }

    const deleteAllTags = async () => {

        tags.value.forEach(async (i) => {

            try {
                await mpSdk.value?.Tag.remove(i.json_data.mp_data.id)
                const res = await api.delete("/tags.json/", { params: { uuid: i.uuid } });
                console.log('res', res)
                if (res.status === 200 && res.data.deleted) {
                    console.log('successfully deleted from api')
                }
            } catch (error) {
                console.error('Error deleteAllTags() ' + error)
            }

        })

        tags.value = []

    }

    // remove in space and tags array
    const removeTag = async (tag: _Tag) => {
        console.log('removeTag()', tag)

        try {
            await mpSdk.value?.Tag.remove(tag.json_data.mp_data.id)
            const indx = tags.value.findIndex(i => i.uuid === tag.uuid)
            if (indx !== -1) {
                console.log('indx found', indx)
                console.log(tags.value[indx])
                tags.value.splice(indx, 1)
            }

            const res = await api.delete("/tags.json/", { params: { uuid: tag.uuid } })
            console.log('res', res)
            if (res.status === 200 && res.data.deleted) {
                console.log('successfully deleted from api')
            }

        } catch (error) {
            console.error('Error deleteAllTags() ' + error)
        }

    }

    const getCategoriesByFolderId = async () => {
        if (!spaceStore.parentNode) return

        console.log('getCategoriesByFolderId()')

        try {
            const res = await api.get("/categories/folder_uuid/" + spaceStore.parentNode.folder_uuid)
            if (res.status === 200) {
                console.log('successfully get categories by folder_uuid in api', res.data.data)
                const categories: Array<Category> = res.data.data
                allCategories.value = categories.map(i => {
                    if (i.json_data) {
                        // @ts-ignore
                        i.json_data = JSON.parse(i.json_data)
                    }
                    return i
                })
            } else {
                console.error(`Error: ${res}`)
            }
        } catch (error) {
            console.error('Error in getCategoriesByFolderId()' + error)
        }

    }

    // ==============================     END METHODS    ===============================


    // ==============================      FAKE DATA    ==============================

    // Only these space model ids has anchor positions (Msfg36od5J3, qSGGhhjTYbN); you can manually add anchor positions in stores/config.ts
    // const getFakeTags = (nTag: number) :Array<_Tag> => {
    //     console.log('getFakeTags()', nTag)

    //     const selectedSpace = spaceStore.currentNode?.data as Space 

    //     let hasPosition = false 
    //     for(let i in fakeTagPositions){
    //         if(i === selectedSpace.space_sid){
    //             hasPosition = true
    //             break 
    //         }
    //     }

    //     if(!hasPosition){
    //         console.info('selectedSpace has no fake anchor positions. You can add on the config file')
    //         return []
    //     }

    //     if(nTag > 10){
    //         console.error('Should not be greater than 10')
    //         nTag  = 10
    //     }


    //     const tags: Array<_Tag> = []

    //     // @ts-ignore
    //     const positions = fakeTagPositions[selectedSpace.model_sid]

    //     console.log('positions', positions)

    //     for(let i = 0; i < nTag; i++){
    //         const tag:  _Tag  = {
    //             uuid: faker.datatype.uuid(),
    //             space_uuid: spaceStore.currentNode!.id!,
    //             json_data: {
    //                 mp_data: {} as MpSdk.Tag.TagData,
    //                 category: null,
    //                 subcategory: null,
    //             }
    //         }
    //         let anchorPos = {x: 0, y:0, z:0}
    //         let stemVector = {x: 0, y:0, z:0}

    //         while(true){ // if random position has already exist, get again another position
    //             const randIndx = Math.floor(Math.random() * positions.length)
    //             const pos = positions[randIndx]

    //             const indx = tags.findIndex(i => i.json_data.mp_data.anchorPosition === pos['anchorPosition'])
    //             console.log('indx', indx)
    //             if(indx === -1){
    //                 anchorPos = pos['anchorPosition'] 
    //                 stemVector = pos['stemVector'] 
    //                 break
    //             }
    //         }

    //         let category: Category | null = null
    //         let sub_category: SubCategory | null = null

    //         if(categories.value && categories.value.length > 0){
    //             let randIndx = Math.floor(Math.random() * categories.value.length)
    //             category = categories.value[randIndx]
    //             randIndx = Math.floor(Math.random() * category.subcategories.length)
    //             sub_category = category.subcategories[randIndx]
    //         }



    //         tag.uuid = faker.datatype.uuid()
    //         tag.space_uuid = spaceStore.currentNode!.id! 

    //         tag.json_data.mp_data.anchorPosition = anchorPos 
    //         tag.json_data.mp_data.stemVector = stemVector
    //         tag.json_data.mp_data.label = `${faker.name.firstName()} タグ`
    //         tag.json_data.mp_data.description = `${faker.name.fullName()} 財産`
    //         tag.json_data.category = category
    //         tag.json_data.mp_data.color = category ? category.color.rgb : {r:0,g:0,b:0}
    //         tag.json_data.subcategory = sub_category

    //         tags.push(tag)

    //     }

    //     return tags

    // }


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
        category,
        subCategory,
        allCategories,


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
        removeMedia,
        navigateToTag,
        revertUpdates,
        deleteAllTags,
        renderTagsInSpace,
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
