//Guide https://vue-i18n.intlify.dev/guide/
// @ts-nocheck

import { createI18n } from 'vue-i18n/dist/vue-i18n';

import en from "./locales/en.json";
import ja from "./locales/ja.json";

const messages = {
  en,
  ja,
};

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries()); 

const i18n = createI18n({
  legacy: false,
  locale: params.lang ?? import.meta.env.VITE_APP_LANG, //get value of lang en | jp
  fallbackLocale: import.meta.env.VITE_APP_LANG, //if jp | en is not present
  globalInjection: true,
  messages,
});
export default i18n;
