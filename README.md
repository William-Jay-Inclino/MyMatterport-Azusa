# azusa

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### CSS Framework and App Theme: Oruga (https://oruga.io/documentation/#introduction) and Bulma CSS (https://bulma.io/documentation/)

```sh
npm install @oruga-ui/oruga-next --save
````
To use Bulma theme with Oruga. import bulma-theme within main.ts source: https://github.com/oruga-ui/theme-bulma

For Bulma CSS, installation comes first

```sh
npm install bulma
```
Download the Bulma package found in the Bulma website as it contains its helpers in .sass and paste it in the asset folder
in selected Project directory
As the package has .sass, a sass loader needs to be installed as well

### sass Loader (https://bulma.io/documentation/customize/with-node-sass/#6-add-your-own-bulma-styles)
```sh
npm install node-sass --save-dev
npm install bulma --save-dev
```

### sass in Vue CLI (https://cli.vuejs.org/guide/css.html)
```sh
npm install -D sass-loader sass
```
You can rewire the Global CSS File to mystyles.sass that is provided in the asset folder after all are installations done then import
it to the main.ts

### MDI icons
```sh
npm install @mdi/font 
````
## Setup unit testing in vitest

1. Create a folder in src/components/__tests__ and name it by module. Ex. folder name: user
2. Create a spec file for every vue component inside the folder you created. Ex. UserForm.spec.ts
3. Create a spec file for every store in the same folder. Ex UserStore.spec.ts
4. Inside the spec file. Import neccessary packages or files. For ex.

```sh
import { describe, it, expect, beforeEach } from "vitest" 
import { createPinia, setActivePinia } from "pinia"
import { faker } from "@faker-js/faker";
import type { User } from "@/stores/types";
import { useUserStore } from "@/stores/user";
```
5. Sample code in unit testing 

```sh 
describe("User Store", async() => {

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

})
```

6. To run vitest ui. Use this command on the terminal 
This will run all tests
```sh 
npx vitest --ui
```
To run a specific test 
```sh 
npx vitest --ui <spec filename>
```

7. To run vitest headlessly
```sh
npx vitest watch
```
