<template>
  <div class="app">
    <div class="tab">
      <a href="#counter">计数器</a>
      <a href="#todo">待办事项</a>
    </div>

    <component :is="comp"></component>
  </div>
</template>

<script setup>
import { ref, onMounted, shallowRef, markRaw } from 'vue'
import Counter from './components/Counter.vue'
import Todo from './components/Todo.vue'

const comp = shallowRef(Counter)


onMounted(() => {
  window.location.hash = ""
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (hash === '#counter') {
      comp.value = Counter;
    } else if (hash === '#todo') {
      comp.value = Todo;
    }
  });
})
</script>

<style scoped>
.app {
  width: 300px;
  margin: 20px auto;
  padding: 20px;
}

.tab {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px;
}

.tab a {
  font-size: 18px;
  color: #40a9ff;
  cursor: pointer;
  text-decoration: none;
}

.tab a:hover {
  font-size: 18px;
  color: #0050b3;
  cursor: pointer;
  text-decoration: none;
}
</style>
