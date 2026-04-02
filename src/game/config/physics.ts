import data from './physics.json'

export const PHYSICS = data.physics as {
  GRAVITY: number
  JUMP_VELOCITY: number
  MOVE_SPEED: number
  MAX_FALL_SPEED: number
  COYOTE_TIME: number
  JUMP_BUFFER: number
  VARIABLE_JUMP: boolean
}

export const CANVAS_WIDTH  = data.canvas.WIDTH
export const CANVAS_HEIGHT = data.canvas.HEIGHT
