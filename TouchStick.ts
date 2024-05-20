import { Vector3, VirtualJoystick } from 'babylonjs'

class TouchStick extends VirtualJoystick {
    direction: Vector3 = Vector3.Zero()
    private directionMaxLength: number = 2.8
    private directionSensitivity: number = 12000
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
    doubleTap: boolean = false
    hold: boolean = false
    holdCenter: boolean = false
    threshold: number = 0
    private lastStartTouchTime: number = 0
    private lastEndTouchTime: number = 0
    private lastStartHoldTime: number = 0
    private lastStartHoldCenterTime: number = 0
    private lastStartTapTime: number = 0
    private lastEndTapTime: number = 0
    private lastEndSwipeTime: number = 0
    private lastEndHoldTime: number = 0
    private startTouch: number = 0
    private endTouch: number = 0
    private startHold: number = 0
    private startHoldCenter: number = 0
    private startTap: number = 0
    private endTap: number = 0
    private endSwipe: number = 0
    private endHold: number = 0
    private thinking: boolean = false

    getThreshold(): number {
        return this.threshold
    }

    setThreshold(threshold: number) {
        this.threshold = threshold
    }

    getDirectionSensitivity(): number {
        return this.directionSensitivity
    }

    setDirectionSensitivity(directionSensitivity: number) {
        this.directionSensitivity = directionSensitivity
    }

    getDirectionMaxLength() {
        return this.directionMaxLength
    }

    setDirectionMaxLength(directionMaxLength: number) {
        this.directionMaxLength = directionMaxLength
    }

    constructor(isLeftStick: boolean) {
        super(isLeftStick)
        this.setJoystickSensibility(1)
        this.setupListener()
    }

    private setupListener = () => {
        this.detect()
        this.deltaPositionSmoothed = this.smoothDeltaPosition()
        this.direction = this.getDirection(
            this.deltaPosition.x,
            this.deltaPosition.y,
        )
        requestAnimationFrame(this.setupListener)
    }

    detect() {
        if (this.thinking) return
        const { pressed, deltaPosition } = this
        const currentTime = new Date().getTime()
        this.startTouch = currentTime - this.lastStartTouchTime
        this.endTouch = currentTime - this.lastEndTouchTime
        this.startHold = currentTime - this.lastStartHoldTime
        this.endHold = currentTime - this.lastEndHoldTime
        this.startHoldCenter = currentTime - this.lastStartHoldCenterTime
        this.startTap = currentTime - this.lastStartTapTime
        this.endTap = currentTime - this.lastEndTapTime
        this.endSwipe = currentTime - this.lastEndSwipeTime

        if (pressed) {
            this.lastStartTouchTime = currentTime
            this.detectSwipes(deltaPosition)
            this.detectHold(currentTime)
            this.detectHoldCenter(currentTime, deltaPosition)
            if (!this.tap) {
                this.lastStartTapTime = currentTime
            }
        } else {
            this.detectTap(currentTime)
            this.lastEndTouchTime = currentTime
            this.reset()
        }
    }

    private detectSwipes(deltaPosition: { x: number, y: number }) {
        const thresholdY = 0.12
        const thresholdX = 0.12
        const deltaY = deltaPosition.y
        const deltaX = deltaPosition.x

        if (this.endTouch < 150 && this.startTouch < 150) {
            if (Math.abs(deltaY) > thresholdY && Math.abs(deltaX) < thresholdX) {
                this.swipe.up = deltaY > 0
                this.swipe.down = deltaY < 0
            } else if (Math.abs(deltaX) > thresholdX && Math.abs(deltaY) < thresholdY) {
                this.swipe.right = deltaX > 0
                this.swipe.left = deltaX < 0
            }
            if (this.swipe.up || this.swipe.down || this.swipe.left || this.swipe.right) {
                this.lastEndSwipeTime = new Date().getTime()
            }
        }
    }

    private detectHold(currentTime: number) {
        if (this.endTouch > 400 && this.startTouch < 400) {
            if (!this.hold) {
                this.lastStartHoldTime = currentTime
            }
            this.hold = true
        } else {
            this.lastEndHoldTime = currentTime
        }
    }

    private detectHoldCenter(currentTime: number, deltaPosition: { x: number, y: number }) {
        const thresholdY = 0.01
        const thresholdX = 0.01
        const deltaY = deltaPosition.y
        const deltaX = deltaPosition.x

        if (this.startHold < 500 && this.hold && !this.holdCenter && Math.abs(deltaY) <= thresholdY && Math.abs(deltaX) <= thresholdX) {
            this.lastStartHoldCenterTime = currentTime
            this.holdCenter = true
        } else if (this.startHoldCenter >= 500) {
            this.holdCenter = false
        }
    }

    private detectTap(currentTime: number) {
        if (!this.doubleTap && !this.tap && !this.hold && this.startTap < 50 && this.endSwipe > 350) {
            this.tap = !(this.startTap < 50 && this.hold) && this.endTap > 150 && (!this.hold && this.endHold < 250)
            if (this.tap) {
                if (this.endTap < 450) {
                    this.doubleTap = true
                    this.tap = false
                }
                this.lastEndTapTime = currentTime
            }
        } else {
            this.tap = false
            this.doubleTap = false
        }
    }

    private smoothDeltaPosition() {
        return {
            x: this.filterAxisDelta(this.deltaPosition.x, this.threshold) * 4500,
            y: this.filterAxisDelta(this.deltaPosition.y, this.threshold) * 4500,
        }
    }

    private getDirection(deltaX: number, deltaY: number): Vector3 {
        const deltaPosition = { x: deltaX, y: deltaY }
        const joystickVector = new Vector3(deltaPosition.x, 0, deltaPosition.y)
        if (joystickVector.length() === 0) {
            return Vector3.Zero()
        }
        const scaleFactor = 3
        const scaledLength =
            Math.pow(joystickVector.length(), scaleFactor) * this.directionSensitivity
        const cappedLength = Math.min(scaledLength, this.directionMaxLength)
        return joystickVector.normalize().scale(cappedLength)
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
