export type Mode = 'Online' | 'Offline' | 'Hybrid'
export type Platform = 'Devpost' | 'HackerEarth' | 'Unstop' | 'Devfolio' | 'MLH'
export type Eligibility = 'Students' | 'Beginners' | 'Open to all'
export type CategoryId =
  | 'ai-ml'
  | 'web'
  | 'cybersecurity'
  | 'blockchain'
  | 'cloud'
  | 'open-source'
  | 'data-science'
  | 'mobile'

export interface Hackathon {
  id: string
  title: string
  description: string
  longDescription: string[]
  platform: Platform
  organizer: string
  mode: Mode
  location: string
  startDate: string // ISO
  endDate: string // ISO
  registrationDeadline: string // ISO
  prizeAmount: number // USD, used for sorting/filtering
  prizeLabel: string // what we display
  eligibility: Eligibility[]
  teamSize: { min: number; max: number }
  categories: CategoryId[]
  technologies: string[]
  url: string
  addedAt: string // ISO
  trending?: boolean
  featured?: boolean
}

export interface Category {
  id: CategoryId
  name: string
  description: string
  icon: 'brain' | 'code' | 'shield' | 'blocks' | 'cloud' | 'git' | 'database' | 'phone'
  keywords: string[]
}

export interface User {
  id: string
  name: string
  email: string
  username?: string
  createdAt: string
}

export type DateFilter = 'any' | 'soon' | 'week' | 'month'
export type PrizeFilter = 'any' | '1000' | '5000' | '10000' | '20000'
export type SortKey = 'relevance' | 'starting-soon' | 'prize' | 'newest' | 'deadline'

export interface Filters {
  mode: Mode[]
  platform: Platform[]
  category: CategoryId[]
  eligibility: Eligibility[]
  date: DateFilter
  prize: PrizeFilter
}

export interface SearchParams {
  query: string
  filters: Filters
  sort: SortKey
}

export interface InterestsUpdate {
  interests: string[]
}


export interface Filters {
  mode: Mode[]
  platform: Platform[]
  category: CategoryId[]
  eligibility: Eligibility[]
  date: DateFilter
  prize: PrizeFilter
}

export interface SearchParams {
  query: string
  filters: Filters
  sort: SortKey
}
