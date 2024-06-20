import { Nullable, Scene } from 'babylonjs'

export default class CanvasManager {
  private stickCanvas: HTMLCanvasElement | null = this.getCanvasWithoutId()
  private appCanvas: Nullable<HTMLCanvasElement> | undefined
  private swipe: {
    up: boolean
    down: boolean
    right: boolean
    left: boolean
  } = {
    up: false,
    down: false,
    right: false,
    left: false,
  }
  private swipeScreenPartApp = 0.85
  private swipeScreenPartStick = 0.9
  private threshold = 40 // Minimal distance for swipe detect
  private visible: boolean = true
  private gradient: boolean = true
  private touchStartTime: number = 0
  private maxSwipeTime = 500

  setScene(scene: Scene) {
    this.appCanvas = scene.getEngine().getRenderingCanvas()
  }

  setGradient(gradient: boolean) {
    this.gradient = gradient
  }

  setThreshold(threshold: number) {
    this.threshold = threshold
  }

  setSwipeScreenPartApp(swipeScreenPartApp: number) {
    this.swipeScreenPartApp = swipeScreenPartApp
  }

  setSwipeScreenPartStick(swipeScreenPartStick: number) {
    this.swipeScreenPartStick = swipeScreenPartStick
  }

  enableSwipeSwitcher(scene: Scene, gradient: boolean) {
    this.setScene(scene)
    this.setupAppCanvasListener()
    this.setupStickCanvasListener()
    this.gradient = gradient
  }

  getCanvasWithoutId() {
    const canvases = document.body.getElementsByTagName('canvas')
    for (let i = 0; i < canvases.length; i++) {
      if (!canvases[i].id) {
        return canvases[i]
      }
    }
    return null
  }

  show(gradient: boolean = false) {
    const canvas = this.getCanvasWithoutId()
    this.visible = true
    if (canvas) {
      if (!gradient) {
        canvas.style.zIndex = '5'
        return
      }
      this.setupStickCanvasListener()
      this.removeAppCanvasListener()
      canvas.style.height = '100%'
      canvas.style.top = 'inherit'
      canvas.style.bottom = '0'
      canvas.style.background = 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 100%)'
      canvas.style.transition = 'height 0.5s ease, bottom 0.5s ease, background 0.5s ease'
    }
  }

  hide(gradient: boolean = false) {
    const canvas = this.getCanvasWithoutId()
    this.visible = false
    if (canvas) {
      if (!gradient) {
        canvas.style.zIndex = '-1'
        return
      }
      this.setupAppCanvasListener()
      this.removeStickCanvasListener()
      canvas.style.top = 'inherit'
      canvas.style.bottom = '0'
      canvas.style.height = '0%'
      canvas.style.background = 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 100%)'
      canvas.style.transition = 'height 0.5s ease, bottom 0.5s ease, background 0.5s ease'
    }
  }

  private setupStickCanvasListener = () => {
    const canvas = this.stickCanvas
    if (canvas) {
      canvas.addEventListener('touchstart', this.handleTouchStart, false)
      canvas.addEventListener('touchmove', this.handleTouchMove, false)
      canvas.addEventListener('touchend', this.handleTouchEnd, false)
    }
  }

  private removeStickCanvasListener = () => {
    const canvas = this.stickCanvas
    if (canvas) {
      canvas.removeEventListener('touchstart', this.handleTouchStart, false)
      canvas.removeEventListener('touchmove', this.handleTouchMove, false)
      canvas.removeEventListener('touchend', this.handleTouchEnd, false)
    }
  }

  private setupAppCanvasListener = () => {
    const canvas = this.appCanvas
    if (canvas) {
      canvas.addEventListener('touchstart', this.handleTouchStart, false)
      canvas.addEventListener('touchmove', this.handleTouchMove, false)
      canvas.addEventListener('touchend', this.handleTouchEnd, false)
    }
  }

  private removeAppCanvasListener = () => {
    const canvas = this.appCanvas
    if (canvas) {
      canvas.removeEventListener('touchstart', this.handleTouchStart, false)
      canvas.removeEventListener('touchmove', this.handleTouchMove, false)
      canvas.removeEventListener('touchend', this.handleTouchEnd, false)
    }
  }

  private touchStartX = 0
  private touchStartY = 0
  private touchEndX = 0
  private touchEndY = 0

  private handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    this.touchStartX = touch.clientX
    this.touchStartY = touch.clientY
    this.touchStartTime = new Date().getTime()
  }

  private handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0]
    this.touchEndX = touch.clientX
    this.touchEndY = touch.clientY
  }

  private handleTouchEnd = () => {
    const deltaX = this.touchEndX - this.touchStartX
    const deltaY = this.touchEndY - this.touchStartY
    const swipeTime = new Date().getTime() - this.touchStartTime
    const threshold = this.threshold
    const screenHeight = window.innerHeight
    const lowerScreenThreshold = screenHeight * (this.visible ? this.swipeScreenPartApp : this.swipeScreenPartStick)

    if (this.touchStartY > lowerScreenThreshold && swipeTime < this.maxSwipeTime) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > threshold) {
          this.swipe.right = true
          this.swipe.left = false
        } else if (deltaX < -threshold) {
          this.swipe.left = true
          this.swipe.right = false
        }
      } else {
        if (deltaY > threshold) {
          this.swipe.down = true
          this.swipe.up = false
        } else if (deltaY < -threshold) {
          this.swipe.up = true
          this.swipe.down = false
        }
      }
    }

    this.touchStartX = 0
    this.touchStartY = 0
    this.touchEndX = 0
    this.touchEndY = 0

    if (this.swipe.up) {
      this.show(this.gradient)
    }

    if (this.swipe.down) {
      this.hide(this.gradient)
    }
    this.reset()
  }

  reset() {
    this.swipe = { up: false, down: false, right: false, left: false }
  }
}
