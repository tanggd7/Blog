<template>
  <div>
    <div class="counter-row">
      <button @click="decrement">-</button>
      {{ count }}
      <button @click="increment">+</button>
    </div>
    <div class="counter-row">
      <button @click="decrement">-</button>
      {{ doubleCount }}
      <button @click="increment">+</button>
    </div>
  </div>
</template>

<script setup>
import { useCounterStore } from '../store/useCounterStore'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

const store = useCounterStore()

const { count, doubleCount } = storeToRefs(store)

const { add, increment, decrement } = store

const val = ref('')


const addItem = () => {
  add(val.value)
  val.value = ""
}
</script>

<style scoped>
.counter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.counter-row button {
  font-size: 20px;
  width: 40px;
  height: 40px;
}
</style>
