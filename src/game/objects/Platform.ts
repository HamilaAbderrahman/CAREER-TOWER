import Phaser from 'phaser'
import { Milestone } from '../config/milestones'

export class Platform extends Phaser.GameObjects.Rectangle {
  declare body: Phaser.Physics.Arcade.StaticBody
  readonly isMilestone: boolean
  readonly milestoneData?: Milestone
  readonly platformWidth: number
  readonly platformHeight: number

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    color: number,
    accentColor: number,
    isMilestone: boolean,
    milestone?: Milestone
  ) {
    const height = isMilestone ? 20 : 14
    // Rectangle origin is center (0.5, 0.5) — x,y is center of the rect
    super(scene, x, y, width, height, color)

    this.isMilestone = isMilestone
    this.milestoneData = milestone
    this.platformWidth = width
    this.platformHeight = height

    scene.add.existing(this)
    scene.physics.add.existing(this, true)

    // Accent top-edge line (drawn as a separate unmanaged graphic)
    const edge = scene.add.rectangle(x, y - height / 2 + 1.5, width, 3, accentColor)
    edge.setDepth(1)

    // Pixel shine on stepping stones
    if (!isMilestone) {
      const shine = scene.add.rectangle(x - width / 2 + 4, y - height / 2 + 3, 4, 4, 0xffffff)
      shine.setAlpha(0.3)
      shine.setDepth(1)
    }
  }
}
