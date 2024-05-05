import { Vector3, VirtualJoystick } from 'babylonjs'

class TouchStick extends VirtualJoystick {
  direction: Vector3 = Vector3.Zero()
  deltaPositionSmoothed: {
    x: number
    y: number
  } = { x: 0, y: 0 }
  swipe: {
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
  tap: boolean = false
  hold: boolean = false
  holdCenter: boolean = false
  threshold: number = 0.00002
  private lastStartTouchTime: number = 0
  private lastEndTouchTime: number = 0
  private lastStartHoldTime: number = 0
  private lastStartTapTime: number = 0
  private lastEndTapTime: number = 0
  private lastEndSwipeTime: number = 0
  private startTouch: number = 0
  private endTouch: number = 0
  private startHold: number = 0
  private startTap: number = 0
  private endTap: number = 0
  private endSwipe: number = 0

  constructor(isLeftStick: boolean) {
    super(isLeftStick)
    this.setupListener()
  }

  private setupListener = () => {
    this.detect()
    this.deltaPositionSmoothed = this.smoothDeltaPosition()
    this.direction = this.getDirection(this.deltaPositionSmoothed.x, this.deltaPositionSmoothed.y)
    requestAnimationFrame(this.setupListener)
  }

  detect(): void {
    const { pressed, deltaPosition } = this
    const currentTime = new Date().getTime()
    this.startTouch = currentTime - this.lastStartTouchTime
    this.endTouch = currentTime - this.lastEndTouchTime
    this.startHold = currentTime - this.lastStartHoldTime
    this.startTap = currentTime - this.lastStartTapTime
    this.endTap = currentTime - this.lastEndTapTime
    this.endSwipe = currentTime - this.lastEndSwipeTime

    const thresholdY = 0.02
    const thresholdX = 0.002
    const deltaY = deltaPosition.y
    const deltaX = deltaPosition.x

    if (pressed) {
      this.lastStartTouchTime = currentTime
      if (!this.tap) {
        this.lastStartTapTime = currentTime
      }

      if (this.endTouch < 150 && this.startTouch < 150) {

        if (Math.abs(deltaY) > thresholdY && Math.abs(deltaX) < thresholdX) {
          this.swipe.up = deltaY > 0
          this.swipe.down = deltaY < 0
        } else if (
          Math.abs(deltaX) > thresholdX &&
          Math.abs(deltaY) < thresholdY
        ) {
          this.swipe.right = deltaX > 0
          this.swipe.left = deltaX < 0
        }
        if (
          this.swipe.up ||
          this.swipe.down ||
          this.swipe.left ||
          this.swipe.right
        ) {
          this.lastEndSwipeTime = currentTime
        }
      } else if (this.endTouch > 250 && this.startTouch < 250) {
        if (!this.hold) {
          this.lastStartHoldTime = currentTime
        }
        this.hold = true

        if (
          this.startHold > 500 &&
          this.startHold < 700 &&
          Math.abs(deltaY) <= thresholdY &&
          Math.abs(deltaX) <= thresholdX
        ) {

          // when hold longer than 500 ms
          this.holdCenter = true
        }
      }
    } else {

      // short tap
      if (!this.tap && this.startTap < 150 && this.endSwipe > 150) {
        this.tap = !(this.startTap < 150 && this.hold) && this.endTap > 50
        this.lastEndTapTime = currentTime
      } else {
        this.tap = false
      }

      this.reset()
      this.lastEndTouchTime = currentTime
    }
  }

  private smoothDeltaPosition() {
     return {
      x: this.filterAxisDelta(this.deltaPosition.x, this.threshold),
      y: this.filterAxisDelta(this.deltaPosition.y, this.threshold)
     }
  }

  private getDirection(deltaX: number, deltaY: number): Vector3 {
    const joystickVector = new Vector3(deltaX, 0, deltaY)
    if (joystickVector.length() === 0) {
      return Vector3.Zero()
    }
    return joystickVector
  }


  private filterAxisDelta(delta: number, threshold: number = 0.00002): number {
    delta = delta * delta * delta
    if (delta > threshold) {
      delta -= threshold
    } else if (delta < -threshold) {
      delta += threshold
    } else {
      delta = 0
    }
    return delta
  }

  private reset() {
    this.direction = Vector3.Zero()
    this.hold = false
    this.holdCenter = false
    this.swipe = { up: false, down: false, right: false, left: false }
    this.deltaPosition.y = 0
    this.deltaPosition.x = 0
  }

}
export default TouchStick