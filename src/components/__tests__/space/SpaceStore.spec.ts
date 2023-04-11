import { describe, it, expect, beforeEach } from "vitest" 
import { createPinia, setActivePinia } from "pinia"
import { faker } from "@faker-js/faker";

import { useSpaceStore } from "@/stores/space";
import { SPACE_UNIT_TYPE, type Space } from "@/stores/types";


describe("Space Store", async() => {
  
    
    setActivePinia(createPinia())
    const spaceStore = useSpaceStore()
    spaceStore.getSpaceTree()

    it("getSpaceTree()", async() => {
        spaceStore.getSpaceTree()
        expect(spaceStore.spaceUnitTree).not.toBe(undefined)
        expect(spaceStore.spaceUnitTree?.root).not.toBe(undefined)
    })

    it("saveSpaceUnit() - ROOT", async() => {
        spaceStore.spaceUnitTree = spaceStore.getFakeData({nSection: 1, nSubSection: 1, nFacilities: 1, nSpaces: 3, nCategories:5})
        spaceStore.selectedTreeItem = spaceStore.spaceUnitTree?.root
        const countChildren = spaceStore.selectedTreeItem.children?.length

        spaceStore.spaceUnitForm.name = faker.address.streetAddress() 
        spaceStore.spaceUnitForm.type = SPACE_UNIT_TYPE.SECTION

        spaceStore.saveSpaceUnit() 
        expect(spaceStore.selectedTreeItem.children?.length).toBe(countChildren! + 1)
    })

    it("saveSpaceUnit() - SECTION", async() => {
        spaceStore.spaceUnitTree = spaceStore.getFakeData({nSection: 1, nSubSection: 1, nFacilities: 1, nSpaces: 3, nCategories:5})
        spaceStore.selectedTreeItem = spaceStore.spaceUnitTree?.root.children![0]
        const countChildren = spaceStore.selectedTreeItem.children?.length

        spaceStore.spaceUnitForm.name = faker.address.streetAddress() 
        spaceStore.spaceUnitForm.type = SPACE_UNIT_TYPE.FACILITY

        spaceStore.saveSpaceUnit() 
        expect(spaceStore.selectedTreeItem.children?.length).toBe(countChildren! + 1)
    })

    it("saveSpaceUnit() - FACILITY", async() => {
        spaceStore.spaceUnitTree = spaceStore.getFakeData({nSection: 1, nSubSection: 1, nFacilities: 1, nSpaces: 3, nCategories:5})
        spaceStore.selectedTreeItem = spaceStore.spaceUnitTree?.root.children![0].children![0]
        const countChildren = spaceStore.selectedTreeItem.children?.length

        spaceStore.spaceUnitForm.name = faker.address.streetAddress() 
        spaceStore.spaceUnitForm.type = SPACE_UNIT_TYPE.SPACE
        const space = {} as Space
        space.showcase_url = faker.internet.url()
        spaceStore.spaceUnitForm.data = space
        
        spaceStore.saveSpaceUnit() 
        expect(spaceStore.selectedTreeItem.children?.length).toBe(countChildren! + 1)
    })

    it("saveSpaceUnitUser()", async() => {
        const email = faker.internet.email()
        spaceStore.spaceUnitUser.email = email
        const countUsers = spaceStore.spaceUnitUserList.length 
        spaceStore.saveSpaceUnitUser()
        expect(spaceStore.spaceUnitUserList.length).toBe(countUsers + 1)
    })

})
