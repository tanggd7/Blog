<template>
  <div>
    <div class="todo-input-wrapper">
      <input class="todo-input" v-model="val" />
      <button @click.prevent="add">新增</button>
      <button @click.prevent="store.reset">重置</button>
    </div>
    <div class="todo-list">
      <div v-for="item in list" :key="item.id" class="todo-list-item" @click="completeItem(item.id)">
        <span :style="{ 'text-decoration': item.completed ? 'line-through' : 'none' }">{{ item.title }}</span>
        <button @click="removeItem(item.id)">X</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia';
import { useTodoStore } from '../store/useTodoStore';

const val = ref('')

const store = useTodoStore();

const { list } = storeToRefs(store)

const { addItem, removeItem, completeItem } = store

const add = () => {
  addItem(val.value)
  val.value = ''
}
</script>

<style scoped>
.todo-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;

}

.todo-input {
  height: 30px;
  width: 150px;
}

.todo-list .todo-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  cursor: pointer;
}
</style>
