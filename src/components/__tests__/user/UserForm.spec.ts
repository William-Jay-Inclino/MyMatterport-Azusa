import { describe, it, expect, beforeEach, vi } from "vitest" 
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
    wrapper = shallowMount(UserForm, {
        global: {
            plugins: [createTestingPinia()],
        }
    })

    it("Should Mount UserForm.vue", () => {
        expect(wrapper).toBeTruthy()
    })

    it("Should saveClick() mode = add", async() => {
        const userStore = useUserStore()
        userStore.mode = 'add'
        const addUserSpy = vi.spyOn(userStore, 'addUser') //spy addUser() function in store
        //@ts-ignore
        await wrapper.vm.saveClick() //call saveClick() function in component 
        expect(addUserSpy).toHaveBeenCalledOnce() 
    })

    it("Should saveClick() mode = edit", async() => {
        const userStore = useUserStore()
        userStore.mode = 'edit'
        const updateUserSpy = vi.spyOn(userStore, 'updateUser')
        //@ts-ignore
        await wrapper.vm.saveClick()
        expect(updateUserSpy).toHaveBeenCalledOnce()
    })

    it("Should deleteClick()", async() => {
        const userStore = useUserStore()
        const deleteUserSpy = vi.spyOn(userStore, 'deleteUser')
        //@ts-ignore
        await wrapper.vm.deleteClick()
        expect(deleteUserSpy).toHaveBeenCalledOnce()
    })

    it("Should cancelClick()", async() => {
        const userStore = useUserStore()
        const resetFormSpy = vi.spyOn(userStore, 'resetForm')
        //@ts-ignore
        await wrapper.vm.cancelClick()
        expect(resetFormSpy).toHaveBeenCalledOnce()
    })
    
})


// it("Should add user", async() => {
//     const user_store = useUserStore() 
//     user_store.mode = 'add'
//     const total_users_before = user_store.users.length

//     // faker user
//     const user = {} as User 
//     user.uuid = faker.datatype.uuid()
//     user.first_name = faker.name.firstName()
//     user.last_name = faker.name.lastName()
//     user.email = faker.internet.email()
//     user.mobile = faker.phone.number()
//     user.city = faker.address.cityName()
//     user_store.userForm = user
//     // end

//     // get element wrapper
//     const first_name_wrapper = wrapper.get(`[data-test="input-first-name"]`)
//     const last_name_wrapper = wrapper.get(`[data-test="input-last-name"]`)
//     const email_wrapper = wrapper.get(`[data-test="input-email"]`)
//     const mobile_wrapper = wrapper.get(`[data-test="input-mobile"]`)
//     // end

//     // populate input fields
//     await first_name_wrapper.trigger('input')
//     await last_name_wrapper.trigger('input')
//     await email_wrapper.trigger('input')
//     await mobile_wrapper.trigger('input')
//     // end

//     const btn_save = wrapper.get(`[data-test="button-save"]`)
//     await btn_save.trigger("click")

//     expect(user_store.users.length).toBe(total_users_before + 1) // expect current no. of users to be greater than no. of users previously

//     // expect user added to be in users array
//     console.log('users', user_store.users)
//     const user_added = user_store.users.find( (u: User) => (u.first_name == user.first_name && u.last_name == user.last_name && u.email == user.email && u.mobile == user.mobile)) 
//     console.log('user_added', user_added)
//     expect(user_added).not.toBe(null)
//     // end
// })