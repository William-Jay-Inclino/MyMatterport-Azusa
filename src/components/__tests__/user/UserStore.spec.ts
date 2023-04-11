import { describe, it, expect, beforeEach } from "vitest" 
import { createPinia, setActivePinia } from "pinia"
import { faker } from "@faker-js/faker";

import type { User } from "@/stores/types";
import { useUserStore } from "@/stores/user";


describe("User Store", async() => {
    faker.locale='ja'

    setActivePinia(createPinia())
    const userStore = useUserStore()

    it("Should getUsers()", async() => {
        userStore.getUsers()
        expect(userStore.users.length).toBeGreaterThan(0)
    })

    it("Should addUser()", async() => {
        const totalUsersBefore = userStore.users.length
        const user = {} as User 
        user.uuid = faker.datatype.uuid()
        user.first_name = faker.name.firstName()
        user.last_name = faker.name.lastName()
        user.email = faker.internet.email()
        user.mobile = faker.phone.number()
        user.city = faker.address.cityName()
        userStore.userForm = user

        userStore.addUser()

        expect(userStore.users.length).toBe(totalUsersBefore + 1) 
        const userAdded = userStore.users.find( (u: User) => (u.first_name == user.first_name && u.last_name == user.last_name && u.email == user.email && u.mobile == user.mobile)) 
        expect(userAdded).not.toBe(null)
    })

    it("Should updateUser()", async() => {
        const total_users_before = userStore.users.length
        // select random user from users
        const random = Math.floor(Math.random() * userStore.users.length)
        const randUser = userStore.users[random]

        // update user
        const newUser = {
            uuid: randUser.uuid, // remain the uuid
            first_name: `${randUser.first_name}u`,
            last_name: `${randUser.last_name}u`,
            email: `u_${randUser.email}`,
            mobile: faker.phone.number(),
            city: randUser.city // still no city input field so remain value
        } as User

        userStore.userForm = newUser
        // end

        expect(userStore.users.length).toBe(total_users_before) // expect current no. of users to be equal to no. of users previously
        
        const user_updated = userStore.users.find( (u: User) => (u.first_name == newUser.first_name && u.last_name == newUser.last_name && u.email == newUser.email && u.mobile == newUser.mobile)) 
        expect(user_updated).not.toBe(null)
    })

    it("Should deleteUser()", async() => {
        const totalUsersBefore = userStore.users.length
        
        // select random user from users
        const random = Math.floor(Math.random() * userStore.users.length)
        const randUser = userStore.users[random]
        userStore.selectedUser = randUser

        userStore.deleteUser()

        expect(userStore.users.length).toBe(totalUsersBefore - 1)

        const userDeleted = userStore.users.find( (u: User) => (u.first_name == randUser.first_name && u.last_name == randUser.last_name && u.email == randUser.email && u.mobile == randUser.mobile)) 
        expect(userDeleted).toBe(undefined)
    })

    it("Should resetForm()", async() => {
        const user = {} as User 
        user.uuid = faker.datatype.uuid()
        user.first_name = faker.name.firstName()
        user.last_name = faker.name.lastName()
        user.email = faker.internet.email()
        user.mobile = faker.phone.number()
        user.city = faker.address.cityName()
        userStore.selectedUser = user
        userStore.userForm = {...user}
        userStore.showUserForm = true 

        userStore.resetForm()

        expect(userStore.selectedUser).toBe(null)
        expect(userStore.userForm).toStrictEqual({} as User)
        expect(userStore.showUserForm).toBe(false)

    })

})
