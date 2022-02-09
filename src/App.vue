<template>
  <div class="container">
    <RXBtnNext ref="rxButtonRef" :on-click="xxx" pending-text="测试" success-text="good" @loading="isLoading" @success="isSuccess" @fail="isFail"/>
    <button @click="reset">reset</button>
    <button @click="changeSuccess">success</button>
    <button @click="changeFail">fail</button>
  </div>
</template>

<script setup lang="ts">
import RXBtnNext from './components/RX-Button-next.vue'

import {ref} from "vue"

const rxButtonRef = ref()

const xxx = () => {
  let n = Math.random()
  return new Promise<void>((resolve, reject) => {
    if (n > 0.5) {
      setTimeout(() => {
        console.log('n的值为', n)
        resolve()
      }, 2000)
    } else {
      setTimeout(() => {
        console.log('n的值为', n)
        reject()
      }, 2000)
    }
  })
}
const isLoading = ()=>{
  console.log('正在加载')
}
const isSuccess = ()=>{console.log('成功了')}
const isFail = ()=>{console.log('失败了')}
const reset = ()=>{
  rxButtonRef.value.resetButton()
}
const changeSuccess = ()=>{
  rxButtonRef.value.changeButtonState('success')
}
const changeFail = ()=>{
  rxButtonRef.value.changeButtonState('fail')
}

</script>

<style lang="scss">
* {
  box-sizing: border-box;
}

.container {
  height: 80vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>