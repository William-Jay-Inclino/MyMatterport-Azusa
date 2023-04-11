import { createApp } from "vue";
import { createPinia } from "pinia";

import Oruga from "@oruga-ui/oruga-next";
import { bulmaConfig } from "@oruga-ui/theme-bulma";
import "@oruga-ui/oruga-next/dist/oruga.css";
import "@oruga-ui/theme-bulma/dist/bulma.css";

import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";

import "./assets/bulma/main.sass";
import "./assets/oruga-bulma/oruga-bulma.css"

import "@mdi/font/css/materialdesignicons.min.css";
// To implement mdi icons in your component:
// Use o-icon syntax from https://oruga.io/components/Icon.html#examples
// Change pack to "mdi" and icon to any of the icon names in https://pictogrammers.github.io/@mdi/font/6.5.95/
// For example, you will see "F1960 mdi-account-lock-open" from mdi icon names. Just use "account-lock-open"
// <o-icon pack="mdi" icon="account-lock-open" size="large"> </o-icon> large small medium normal
import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Oruga, bulmaConfig);
app.use(i18n);

export default app.mount("#app");

