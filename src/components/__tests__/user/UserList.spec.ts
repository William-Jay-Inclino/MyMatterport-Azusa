import { describe, it, expect, beforeEach } from "vitest" 
import type WrapperLike from "@vue/test-utils/dist/interfaces/wrapperLike"
import { createPinia, setActivePinia } from "pinia"
import { shallowMount } from "@vue/test-utils"
import { createTestingPinia } from '@pinia/testing'

import UserListView from "@/views/UserListView.vue"
import UserForm from "@/components/user/UserForm.vue"
import type { User } from "@/stores/types";
import { useUserStore } from "@/stores/user";
import { faker } from "@faker-js/faker";
 
describe("=== Components ===", () => {
    let wrapper: WrapperLike
    
    setActivePinia(createPinia())
    wrapper = shallowMount(UserListView, {
        global: {
            plugins: [
                createTestingPinia({ 
                    stubActions: false,
                })
            ],
        }
    })

    it("Should Mount UserListView.vue", () => {
        expect(wrapper).toBeTruthy()
    })

    it("Should Mount Child UserForm.vue", () => {
        expect(wrapper.findComponent(UserForm).exists()).toBe(true)
    })

    it("Should addClick()", async() => {
        const userStore = useUserStore()
        //@ts-ignore
        wrapper.vm.addClick()
        expect(userStore.mode).toBe('add')
        expect(userStore.showUserForm).toBe(true)
    })

    it("Should editClick()", async() => {
        const userStore = useUserStore()
        //@ts-ignore
        wrapper.vm.editClick()
        expect(userStore.mode).toBe('edit')
        expect(userStore.showUserForm).toBe(true)

        const user = {} as User 
        user.uuid = faker.datatype.uuid()
        user.first_name = faker.name.firstName()
        user.last_name = faker.name.lastName()
        user.email = faker.internet.email()
        user.mobile = faker.phone.number()
        user.city = faker.address.cityName()
        
        //@ts-ignore
        wrapper.vm.editClick(user)
        expect(userStore.userForm).toStrictEqual(user)
    })
    
})
