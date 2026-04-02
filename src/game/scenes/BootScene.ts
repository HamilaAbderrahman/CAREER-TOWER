import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // No external assets — everything is drawn procedurally
  }

  create() {
    this.scene.start('GameScene')
  }
}
