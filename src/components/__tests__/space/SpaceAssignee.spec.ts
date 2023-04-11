import { describe, it, expect, beforeEach } from "vitest" 
import { createPinia, setActivePinia } from "pinia"
import { faker } from "@faker-js/faker";

import { useSpaceStore } from "@/stores/space";
import type { Space, Role } from "@/stores/types";

describe("Space Assignee Functions",async () => {
    setActivePinia(createPinia())
    const spaceStore = useSpaceStore()
    spaceStore.getSpaceTree()

    spaceStore.spaceUnitTree = spaceStore.getFakeData({ nSection: 1, nSubSection: 1, nFacilities: 1, nSpaces: 3, nCategories: 5 })
    spaceStore.selectedTreeItem = spaceStore.spaceUnitTree?.root.children![0]
    const data = spaceStore.selectedTreeItem.users
    const selectedRows = data?.map((row, index) => {
        if (index < 3) {
            return row
        }
        return
    })
    let roles:Array<Role> = []
    let currentUserRoles:Array<string>
    let selectedCurrentRole:Array<Role>

    it("Can get users from store", async () => {
        expect(data?.length).toBeGreaterThan(1)
    })
    
    it("Can get roles from user",async () => {
        data?.forEach(user => {
            user.roles.forEach(r => {
              roles.push(r)
            })
          })
        
        expect(roles.length).toBeGreaterThan(1)
    })

    it('Can get roles from selected users', async () => {
        currentUserRoles = [];
        selectedRows?.forEach((row) => {
            row?.roles.forEach((r) => {
                currentUserRoles.push(r.uuid);
            })
        })

        expect(currentUserRoles.length).toBeGreaterThan(1)
    })

    it('Can get current roles of selected users', async () => {
        selectedCurrentRole = []
        selectedRows?.forEach((row) => {
            row?.roles.forEach((r) => {
                selectedCurrentRole.push(r)
            })
        })

        expect(selectedCurrentRole.length).toBeGreaterThan(1)
    })

})