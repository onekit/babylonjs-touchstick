
# babylonjs-touchstick v.0.0.3

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

- `direction`: Represents a `BABYLON.Vector3` type for character direction.

### Delta Smoothing

Original `deltaPosition`, but with smoothing.
- `deltaPositionSmoothed`: Represents smoothed movements of delta using cube easing. You can use `deltaPositionSmoothed.x` and `deltaPositionSmoothed.y` instead of `deltaPosition.x` and `deltaPosition.y`.

## Usage

### TypeScript example:

```typescript
import TouchStick from 'babylonjs-touchstick'

export class TouchInput {

    private stickLeft: TouchStick = new TouchStick(true);
    private stickRight: TouchStick = new TouchStick(false);
    
    private handleEvents() {
        const { swipe, tap, doubleTap, hold, holdCenter } = this.stickRight;
        
        if (swipe.down) {
            console.log('Swiped down right stick')
        }
        
        if (doubleTap) {
            console.log('Double tap')
        }

        if (holdCenter) {
            console.log('Enter menu')
        }
        
        if (this.stickLeft.swipe.up || this.stickRight.swipe.up) {
            console.log('Swiped up both sticks')
        }
        
    }

}
```

Read official documentation of original `BABYLON.VirtualJoystick` for more information: https://doc.babylonjs.com/features/featuresDeepDive/input/virtualJoysticks