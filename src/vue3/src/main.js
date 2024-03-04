import { createApp } from "vue"
import { createPinia } from "pinia"
import "./style.css"
import App from "./App.vue"
import { myPlugin1, resetPlugin } from "./store/plugin"

createApp(App).use(createPinia().use(myPlugin1).use(resetPlugin)).mount("#app")
