import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config/physics'

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    parent,
    backgroundColor: '#08101e',
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    scene: [BootScene, GameScene],
    render: { pixelArt: true, antialias: false },
    // NONE — canvas stays at 800×600, CSS scales it via the wrapper
    scale: {
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.NO_CENTER,
    },
  })
}
