
# BabylonJS TouchStick

This TypeScript class extends the functionality of the standard VirtualJoystick in BabylonJS. It provides smooth motion delta with movement filtering, and gesture information such as swipe, hold, hold center, and tap. Additionally, you can directly obtain Vector3 from the joystick for controlling the character.

## Install

### NPM
```shell
npm i babylonjs-touchstick
```

### Yarn
```shell
yarn add babylonjs-touchstick
```

## Features
### Swipe Switcher

Swipe Switcher adds the ability to swipe up from the bottom of the screen to activate stick controls. Swiping down from the bottom of the screen hides the virtual joystick panel so that it does not overlap your main Canvas.
```typescript
const stick = new TouchStick(true)
stick.enableSwipeSwitcher(scene)
```
or 
```typescript
stick.enableSwipeSwitcher(scene, false) // without gradient
```
As a parameter to the `enableSwipeSwitcher` method, pass the `BABYLON.Scene` of your application.

### Canvas Manager

If you want more control and prefer to manage the state of the virtual joystick panel yourself, showing or hiding it in your own way, you can enable only the canvasManager and use it like this:

```typescript
const stick = new TouchStick(true)
stick.enableCanvasManager()
stick.canvasManager.show()
stick.canvasManager.hide()
```


## Parameters

### Tap

- `tap`: Represents a quick single touch.
- `doubleTap`: Represents a quick double tap.

### Swipe

- `swipe.up`: Denotes quick movement upwards on the joystick.
- `swipe.down`: Denotes quick movement downwards on the joystick.
- `swipe.left`: Denotes quick movement to the left on the joystick.
- `swipe.right`: Denotes quick movement to the right on the joystick.

### Hold

- `hold`: Indicates holding the joystick.
- `holdCenter`: Indicates holding the joystick immediately after touching it in the center.

### Direction

- `direction`: Represents a `BABYLON.Vector3` type for character direction. The `direction.length()` can be used as delta for movement.

### Delta Smoothing

Original `deltaPosition`, but with smoothing.
- `deltaPositionSmoothed`: Represents smoothed movements of delta using cube easing. You can use `deltaPositionSmoothed.x` and `deltaPositionSmoothed.y` instead of `deltaPosition.x` and `deltaPosition.y`.

## Usage

### TypeScript example:

```typescript
import TouchStick from 'babylonjs-touchstick'
import { Scene, AbstractMesh } from 'babylonjs'

export class TouchInput {

    private stickLeft: TouchStick = new TouchStick(true);
    private stickRight: TouchStick = new TouchStick(false);

    constructor(scene: Scene) {
        this.stickLeft.enableSwipeSwitcher(scene)
        this.stickLeft.setDirectionMaxLength(3) // cap for maximum distance of BABYLON.Vector3 length
    }

    private handleEvents() {
        const {swipe, tap, doubleTap, hold, holdCenter} = this.stickRight;

        if (this.stickLeft.swipe.up || this.stickRight.swipe.up) {
            console.log('Swiped up both sticks')
        }
        
        if (swipe.down) {
            console.log('Swiped down right stick')
        }
        
        if (holdCenter) {
            console.log('Enter menu')
        }

        if (doubleTap) {
            console.log('Double tap')
        }

    }
    
    handleMovement(mesh: AbstractMesh) {
        mesh.position
            .add(this.stickLeft.direction)
        
        mesh.position
            .scale(this.stickLeft.direction.length())
    }

}
```

Read official documentation of original `BABYLON.VirtualJoystick` for more information: https://doc.babylonjs.com/features/featuresDeepDive/input/virtualJoysticks