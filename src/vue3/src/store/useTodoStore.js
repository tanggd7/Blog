import { defineStore } from "pinia"
import { ref, computed } from "vue"

export const useTodoStore = defineStore("todo", () => {
  const list = ref([
    { id: 1, title: "Todo 1", completed: false },
    { id: 2, title: "Todo 2", completed: true },
    { id: 3, title: "Todo 3", completed: false },
  ])

  const addItem = (val) => {
    list.value.push({
      id: Math.random(),
      title: val,
      completed: false,
    })
  }

  const removeItem = (id) => {
    list.value = list.value.filter((item) => item.id !== id)
  }

  const completeItem = (id) => {
    list.value.forEach((item) => {
      if (item.id === id) {
        item.completed = !item.completed
      }
    })
  }

  return { list, addItem, removeItem, completeItem }
})
