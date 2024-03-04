import { defineStore } from "pinia"
import { ref } from "vue"

export const useCounterStore = defineStore("counter", () => {
  const count = ref(2)

  const list = ref([{ label: "测试" }, { label: "测试2" }])

  const add = (label) => {
    list.value.push({ label })
  }

  return { count, list, add }
})
