<template>
  <div class="rx-button-next" :class="`rx-button-next-state-${currentState}`">
    <div class="rx-button-next-pending rx-button-next-content" v-if="currentState === 'pending'" @click="handleClick">
      <span style="--d:40ms;" class="rx-button-next-pending-icon"
            :class="{'rx-button-next-pending-text-leave': pendingTextLeave}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
          <line stroke="currentColor" x1="6" y1="1" x2="6" y2="11"/>
          <polyline stroke="currentColor" points="1.5,6 6,11 10.5,6"/>
        </svg>
      </span>
      <span :class="[{'rx-button-next-pending-text-leave': pendingTextLeave},`rx-button-next-pending-char${index}`]"
            v-for="(char,index) in pendingTextArr"
            :style="`--d:${80 + index*40}ms`" v-html="char"/>
    </div>
    <div class="rx-button-next-loading rx-button-next-content" v-if="currentState === 'loading'">
      <slot name="loading">
        <div class="rx-button-next-dotList">
          <span class="rx-button-next-dot" style="--y: -6px;"/>
          <span class="rx-button-next-dot" style="--y: -6px;"/>
          <span class="rx-button-next-dot" style="--y: -6px;"/>
        </div>
      </slot>
    </div>
    <div class="rx-button-next-success rx-button-next-content" v-if="currentState === 'success'">{{ successText }}</div>
    <div class="rx-button-next-fail rx-button-next-content" v-if="currentState === 'fail'">{{ failText }}</div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, onMounted, ref} from "vue"

// Props
const props = defineProps({
  pendingText: {type: String, default: 'Click Me!'},
  failText: {type: String, default: 'Fail'},
  successText: {type: String, default: 'Success'},
})

// Data
let currentState = ref('pending')
let pendingTextArr = ref([''])
let pendingTextLeave = ref(false)

// Methods
const handleClick = () => {
  pendingTextLeave.value = true
  setTimeout(() => {
    currentState.value = 'loading'
    setTimeout(() => {
      currentState.value = 'pending'
      pendingTextLeave.value = false
    }, 5000)
  }, (pendingTextArr.value.length + 1) * 40 + 550)
}

// Mounted
onMounted(() => {
  // 由于 span 标签改为了 inline-block，pending文本中的空格需要转成 &nbsp; ，否则空格无法显示。
  pendingTextArr.value = props.pendingText.split('').map(item => item === ' ' ? '&nbsp;' : item)
})
</script>

<style scoped lang="scss">
.rx-button-next {
  border: 1px solid;
  display: inline-block;
  background: #1f2335;
  color: white;
  border-radius: 1000px;
  cursor: pointer;
  transition: padding 0.4s;

  &.rx-button-next-state-pending {
    padding: 10px 40px;
  }

  &.rx-button-next-state-loading {
    padding: 10px 30px;
  }

  .rx-button-next-content {
    width: 100px;
    margin: 0 auto;
    text-align: center;
  }
}

.rx-button-next-pending {
  > span {
    display: inline-block;
  }

  svg {
    color: #5c86ff;
    width: 14px;
    display: inline-block;
    fill: none;
    margin-right: 5px;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  .rx-button-next-pending-text-leave {
    transform: translateY(100%);
    opacity: 0;
    transition: all 0.5s linear var(--d);
  }
}

.rx-button-next-loading {
  @keyframes jump {
    0% {
      transform: translateY(0px);
    }
    20% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(var(--y));
    }
    80% {
      transform: translateY(0px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  .rx-button-next-dotList {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 1em;
    margin: 2.4px auto;

    .rx-button-next-dot {
      background: white;
      line-height: 1em;
      margin: 0 5px;
      width: 6px;
      height: 6px;
      border-radius: 100px;
      animation: jump 1000ms infinite ease-in-out;

      &:nth-child(2) {
        animation-delay: 100ms;
      }

      &:last-child {
        animation-delay: 200ms;
      }
    }
  }
}

</style>