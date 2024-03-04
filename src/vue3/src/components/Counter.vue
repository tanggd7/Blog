<template>
  <div>
    {{ count }}

    <div v-for="(item, i) in list" :key="i">
      {{ item.label }}
    </div>

    <input v-model="val" />
    <button @click="addItem">新增</button>

    <br />


    <!-- chunk-2FDUVFJ5.js?v=99a8c15a:1722 Uncaught Error: 🍍: Store "counter" is built using the setup syntax and does not implement $reset(). -->
    <!-- <button @click="store.$reset">重置</button> -->

    <button @click="store.reset">重置</button>

  </div>
</template>

<script setup>
import { useCounterStore } from '../store/useCounterStore'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

const store = useCounterStore()

const { list, count } = storeToRefs(store)

const { add } = store

const val = ref('')


const addItem = () => {
  add(val.value)
  val.value = ""
}

</script>

<style lang="">

</style>
import { useCounterStore } from '../store/useCounterStore';
