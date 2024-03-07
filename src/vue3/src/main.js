import { createPinia } from "pinia"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import { createApp } from "vue"
import App from "./App.vue"
import { myPlugin, resetPlugin } from "./store/plugin"
import "./style.css"

const pinia = createPinia()
pinia.use(myPlugin)
pinia.use(resetPlugin)
pinia.use(piniaPluginPersistedstate) // 持久化插件

createApp(App).use(pinia).mount("#app")
