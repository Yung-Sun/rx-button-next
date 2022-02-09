<template>
  <div class="rx-button-next" :class="`rx-button-next-state-${currentState}`" @click="handleClick">
    <canvas id="rx-button-next-canvas-confetti" ref="canvasRef" :width="canvasWidth" :height="canvasHeight"/>
    <div style="position: relative;width: 100px;height: 100%;">
      <transition-group name="fade">
        <div class="rx-button-next-pending rx-button-next-content" v-if="currentState === 'pending'">
          <slot>
            <span style="--d:30ms;" class="rx-button-next-pending-icon"
                  :class="{'rx-button-next-pending-text-leave': pendingTextLeave}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
                <line stroke="currentColor" x1="6" y1="1" x2="6" y2="11"/>
                <polyline stroke="currentColor" points="1.5,6 6,11 10.5,6"/>
              </svg>
            </span>
            <span
                :class="[{'rx-button-next-pending-text-leave': pendingTextLeave},`rx-button-next-pending-char${index}`]"
                v-for="(char,index) in pendingTextArr"
                :style="`--d:${60 + index*30}ms`" v-html="char"/>
          </slot>
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
        <div class="rx-button-next-success rx-button-next-content" v-if="currentState === 'success'">
          <slot name="success">
            <svg :class="{'rx-button-next-successful-icon': successIconVisible}" xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 13 11">
              <polyline stroke="currentColor" points="1.4,5.8 5.1,9.5 11.6,2.1 "/>
            </svg>
            <span>{{ successText }}</span>
          </slot>
        </div>
        <div class="rx-button-next-fail rx-button-next-content" v-if="currentState === 'fail'">
          <slot name="fail">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
              <line stroke="currentColor" x1="11" y1="11" x2="1" y2="1"/>
              <line stroke="currentColor" x1="11" y1="1" x2="1" y2="11"/>
            </svg>
            <span>{{ failText }}</span>
          </slot>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, defineEmits, onBeforeUnmount, onMounted, reactive, ref, watch} from "vue"

// Emit
const emit = defineEmits<{
  (e: 'loading'): void
  (e: 'success'): void
  (e: 'fail'): void
}>()

// Props
const props = defineProps({
  pendingText: {type: String, default: 'Click Me!'},
  failText: {type: String, default: 'Fail'},
  successText: {type: String, default: 'Success'},
  colors: {
    type: [Object],
    default: [
      {front: '#7b5cff', back: '#6245e0'}, // Purple
      {front: '#f9ff0c', back: '#ffc507'}, // Light Blue
      {front: '#5c86ff', back: '#345dd1'}  // Darker Blue
    ]
  },
  onClick: {
    required: true,
    type: Function
  },
})

// Data
let buttonClickable = ref(true)
let currentState = ref('pending')
let pendingTextArr = ref([''])
let pendingTextLeave = ref(false)
let successIconVisible = ref(false)
let canvasWidth = ref(500)
let canvasHeight = ref(620)

// Canvas Data
let canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId = ref<any>(0)
let intervalId = ref<any>(0)
const canvasRenderData = reactive({
  confettiCount: 30,
  sequinCount: 30,
  confetti: [{
    randomModifier: 0,
    color: {front: '', back: ''},
    dimensions: {x: 0, y: 0},
    position: {x: 0, y: 0},
    rotation: 0,
    scale: {x: 0, y: 0},
    velocity: {x: 0, y: 0},
    update: () => {
    }
  }],
  sequins: [{
    color: {front: '', back: ''},
    radius: 0,
    position: {x: 0, y: 0},
    velocity: {x: 0, y: 0},
    update: () => {
    }
  }]
})
const canvasPhysicsData = reactive({
  gravityConfetti: 0.3,
  gravitySequins: 0.55,
  dragConfetti: 0.075,
  dragSequins: 0.02,
  terminalVelocity: 3
})
const canvasPositionData = reactive({
  buttonWidth: 0,
  buttonHeight: 0,
  screenWidth: 0,
  screenHeight: 0
})

// Methods
const handleClick = () => {
  if (!buttonClickable.value) {
    return false
  }
  buttonClickable.value = false
  pendingTextLeave.value = true
  setTimeout(() => {
    emit('loading')
    currentState.value = 'loading'
    pendingTextLeave.value = false
    let cb = props.onClick()
    const afterSuccess = () => {
      // 获得成功结果后，进入成功状态
      initBurst()
      currentState.value = 'success'
      emit('success')
    }
    const afterFail = () => {
      // 获得失败结果后，进入失败状态
      currentState.value = 'fail'
      emit('fail')
    }
    if (cb && cb.then) {
      cb.then(() => {
        afterSuccess()
      }, () => {
        afterFail()
      })
    } else {
      if (typeof cb === 'boolean') {
        cb ? afterSuccess() : afterFail()
      } else {
        // onClick 的返回值不是 boolean 或者 Promise 则报错
        throw '😱 Oh~ Attribute onClick needs return a Boolean or Promise object'
      }
    }
  }, (pendingTextArr.value.length + 1) * 40 + 550)
}

const resetButton = () => {
  if (currentState.value !== 'loading') {
    buttonClickable.value = true
    currentState.value = 'pending'
    pendingTextLeave.value = false
    successIconVisible.value = false
  } else {
    throw "😯 Could not reset the button when the status is loading"
  }

}
const changeButtonState = (stateName: 'pending' | 'success' | 'fail') => {
  // 手动切换按钮状态
  if (currentState.value === 'loading') {
    return false
  }
  switch (stateName) {
    case 'pending':
      resetButton()
      break
    case 'success':
      if (currentState.value !== 'success') {
        pendingTextLeave.value = false
        successIconVisible.value = false
        currentState.value = 'success'
        buttonClickable.value = false
        emit('success')
      }
      break
    case 'fail':
      if (currentState.value !== 'fail') {
        pendingTextLeave.value = false
        successIconVisible.value = false
        currentState.value = 'fail'
        buttonClickable.value = false
        emit('fail')
      }
      break
    default:
      throw '😵 An unknown param was passed to function setButtonState'
  }
}

// Define Expose
defineExpose({resetButton, changeButtonState})

// Canvas Methods
// Utility Function
const randomRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}
// Success Confetti Switch
const initBurst = () => {
  for (let i = 0; i < canvasRenderData.confettiCount; i++) {
    canvasRenderData.confetti.push(createConfetti());
  }
  for (let i = 0; i < canvasRenderData.sequinCount; i++) {
    canvasRenderData.sequins.push(createSequin());
  }
}
const initConfettoVelocity = (xRange: number[], yRange: number[]) => {
  const x = randomRange(xRange[0], xRange[1]);
  const range = yRange[1] - yRange[0] + 1;
  let y = yRange[1] - Math.abs(randomRange(0, range) + randomRange(0, range) - range);
  if (y >= yRange[1] - 1) {
    y += (Math.random() < .25) ? randomRange(1, 3) : 0;
  }
  return {x: x, y: -y};
}
// Create Confetti and Sequin
const createConfetti = () => {
  class Confetti {
    randomModifier: number
    color: any
    dimensions: { x: number; y: number }
    position: { x: number; y: number }
    rotation: number
    scale: { x: number; y: number }
    velocity: { x: number; y: number }

    constructor() {
      this.randomModifier = randomRange(0, 99)
      this.color = props.colors[Math.floor(randomRange(0, props.colors.length))]
      this.dimensions = {
        x: randomRange(5, 9),
        y: randomRange(8, 15)
      }
      this.position = {
        x: randomRange(200, 280),
        y: randomRange(300, 340)
      }
      this.rotation = randomRange(0, 2 * Math.PI)
      this.scale = {x: 1, y: 1}
      this.velocity = initConfettoVelocity([-9, 9], [6, 11])
    }

    update() {
      // apply forces to velocity
      this.velocity.x -= this.velocity.x * canvasPhysicsData.dragConfetti;
      this.velocity.y = Math.min(this.velocity.y + canvasPhysicsData.gravityConfetti, canvasPhysicsData.terminalVelocity);
      this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();
      // set position
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      // spin confetto by scaling y and set the color, .09 just slows cosine frequency
      this.scale.y = Math.cos((this.position.y + this.randomModifier) * 0.09);
    }
  }

  return new Confetti()
}
const createSequin = () => {
  class Sequin {
    color: any
    radius: number
    position: { x: number; y: number }
    velocity: { x: number; y: number }

    constructor() {
      this.color = props.colors[Math.floor(randomRange(0, props.colors.length))].back
      this.radius = randomRange(1, 2)
      this.position = {
        x: randomRange(190, 320),
        y: randomRange(300, 340),
      }
      this.velocity = {
        x: randomRange(-6, 6),
        y: randomRange(-10, -15)
      }
    }

    update() {
      // apply forces to velocity
      this.velocity.x -= this.velocity.x * canvasPhysicsData.dragSequins;
      this.velocity.y = this.velocity.y + canvasPhysicsData.gravitySequins;
      // set position
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }

  return new Sequin()
}

const render = () => {
  // const canvas = document.querySelector('#canvas-confetti')
  const canvas: any = document.getElementById('rx-button-next-canvas-confetti')
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvasRenderData.confetti.forEach(confetti => {
    let width = (confetti.dimensions.x * confetti.scale.x)
    let height = (confetti.dimensions.y * confetti.scale.y)

    // move canvas to position and rotate
    ctx.translate(confetti.position.x, confetti.position.y);
    ctx.rotate(confetti.rotation);

    // update confetti "physics" values
    confetti.update();

    // get the fill color of front or back
    ctx.fillStyle = confetti.scale.y > 0 ? confetti.color.front : confetti.color.back;

    // draw confetti
    ctx.fillRect(-width / 2, -height / 2, width, height);

    // reset transform matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // clear rectangle where button cuts off
    if (confetti.velocity.y < 0) {
      // ctx.clearRect(canvas.width / 2 - 28 / 2, canvas.height / 2 + 10 / 2, 28, 10);
    }
  })
  canvasRenderData.sequins.forEach(sequin => {
    // move canvas to position
    ctx.translate(sequin.position.x, sequin.position.y);

    // update sequin "physics" values
    sequin.update();

    // set the color
    ctx.fillStyle = sequin.color;

    // draw sequin
    ctx.beginPath();
    ctx.arc(0, 0, sequin.radius, 0, 2 * Math.PI);
    ctx.fill();

    // reset transform matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // clear rectangle where button cuts off
    if (sequin.velocity.y < 0) {
      // ctx.clearRect(canvas.width / 2 - 28 / 2, canvas.height / 2 + 10 / 2, 28, 10);
    }
  })

  // remove confetti and sequins that fall off the screen
  // must be done in seperate loops to avoid noticeable flickering
  canvasRenderData.confetti.forEach((confetto, index) => {
    if (confetto.position.y >= 550 + Math.random() * 50) canvasRenderData.confetti.splice(index, 1);
  });
  canvasRenderData.sequins.forEach((sequin, index) => {
    if (sequin.position.y >= 550 + Math.random() * 50) canvasRenderData.sequins.splice(index, 1);
  })

  animationId = window.requestAnimationFrame(render)
}

const getElementPosition = (el: any) => {
  let position = {
    top: 0,
    left: 0
  }
  let actualTop = el.offsetTop
  let actualLeft = el.offsetLeft
  let currentEl = el.offsetParent
  while (currentEl !== null) {
    actualTop += currentEl.offsetTop
    actualLeft += currentEl.offsetLeft
    currentEl = currentEl.offsetParent
  }
  position.top = actualTop
  position.left = actualLeft
  return position
}

// Watch
const currentStateCB = (newVal: any) => {
  if (newVal === 'success') {
    setTimeout(() => {
      successIconVisible.value = true
    }, 200)
  }
}
watch(currentState, currentStateCB)

// Mounted
onMounted(() => {
  // 由于 span 标签改为了 inline-block，pending文本中的空格需要转成 &nbsp; ，否则空格无法显示。
  pendingTextArr.value = props.pendingText.split('').map(item => item === ' ' ? '&nbsp;' : item)

  render()
  canvasWidth.value = (canvasRef.value as HTMLCanvasElement).clientWidth
  canvasHeight.value = (canvasRef.value as HTMLCanvasElement).clientHeight
  canvasPositionData.buttonWidth = getElementPosition(canvasRef.value).left
  canvasPositionData.buttonHeight = getElementPosition(canvasRef.value).top
  window.onresize = () => {
    return (() => {
      canvasPositionData.buttonWidth = getElementPosition(canvasRef.value).left
      canvasPositionData.buttonHeight = getElementPosition(canvasRef.value).top
    })()
  }
})

// BeforeDestroy
onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  clearInterval(intervalId)
  window.onresize = () => {
  }
})
</script>

<style scoped lang="scss">
// 过渡动画 start
.fade-enter-active, .fade-leave-active {
  transition: transform .6s, opacity .4s;
}

.fade-enter-from {
  transform: translateY(-100%) !important;
  opacity: 0;
}

.fade-leave-to {
  transform: translateY(100%) !important;
  opacity: 0;
}

// 过渡动画 end

.rx-button-next {
  border: 1px solid;
  display: inline-block;
  background: #1f2335;
  color: white;
  border-radius: 1000px;
  cursor: pointer;
  transition: padding 0.4s;
  position: relative;
  height: 44.8px;

  &.rx-button-next-state-pending, &.rx-button-next-state-success, &.rx-button-next-state-fail {
    padding: 10px 40px;
  }

  &.rx-button-next-state-loading {
    padding: 10px 25px;
  }

  .rx-button-next-content {
    min-width: 100px;
    margin: 0 auto;
    text-align: center;
    position: absolute;
  }
}

.rx-button-next-pending {
  span {
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
    transition: all 500ms ease-in var(--d);
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

.rx-button-next-success {
  > svg {
    color: #5cffa1;
    stroke-dasharray: 20;
    stroke-dashoffset: 20;
    transition: stroke-dashoffset .3s ease-in-out;
    width: 14px;
    display: inline-block;
    fill: none;
    margin-right: 5px;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }

  > svg.rx-button-next-successful-icon {
    stroke-dashoffset: 0;
    transition: stroke-dashoffset .3s ease-in-out;
    opacity: 1;
  }
}

.rx-button-next-fail {
  display: flex;
  justify-content: center;
  align-items: center;
  animation: shake 250ms 1 200ms;

  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    45% {
      transform: translateX(2%);
    }
    55% {
      transform: translateX(-2%);
    }
    100% {
      transform: translateX(0%);
    }
  }

  svg {
    color: #cb4110;
    transition: stroke-dashoffset .3s ease-in-out;
    width: 14px;
    display: inline-block;
    fill: none;
    margin-right: 5px;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }
}

#rx-button-next-canvas-confetti {
  //border: 1px solid red;
  height: 620px;
  width: 500px;
  position: absolute;
  z-index: 10;
  pointer-events: none;
  top: -300px;
  left: calc(-50% - 75px);
}

</style>