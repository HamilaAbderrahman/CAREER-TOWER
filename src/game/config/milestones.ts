import data from './milestones.json'

export interface Milestone {
  id: number
  label: string
  year: string
  desc: string
  worldY: number
  bg: string
  platformColor: string
  accent: string
}

export const MILESTONES: Milestone[] = data as Milestone[]
