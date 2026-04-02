import { MILESTONES, Milestone } from '../config/milestones'

export class MilestoneManager {
  private reached = new Set<number>()
  private highestMilestone: Milestone = MILESTONES[0]

  checkHeight(worldY: number, onReach: (ms: Milestone) => void) {
    // worldY increases upward (negative in Phaser coords)
    // We compare against milestone worldY values
    for (const ms of MILESTONES) {
      if (!this.reached.has(ms.id) && worldY >= ms.worldY) {
        this.reached.add(ms.id)
        this.highestMilestone = ms
        onReach(ms)
      }
    }
  }

  getCurrentMilestone(): Milestone {
    return this.highestMilestone
  }

  reset() {
    this.reached.clear()
    this.highestMilestone = MILESTONES[0]
  }
}
