import type { Category } from '../types'

export const categories: Category[] = [
  { id: 'ai-ml', name: 'AI & Machine Learning', description: 'LLMs, vision, agents and applied ML', icon: 'brain', keywords: ['ai', 'ml', 'machine learning', 'artificial intelligence', 'llm'] },
  { id: 'web', name: 'Web Development', description: 'Frontend, backend and full-stack products', icon: 'code', keywords: ['web', 'frontend', 'fullstack', 'react', 'javascript'] },
  { id: 'cybersecurity', name: 'Cybersecurity', description: 'Defense, privacy and secure systems', icon: 'shield', keywords: ['security', 'cybersecurity', 'privacy'] },
  { id: 'blockchain', name: 'Blockchain', description: 'Web3, smart contracts and DeFi', icon: 'blocks', keywords: ['blockchain', 'web3', 'crypto', 'ethereum', 'solidity'] },
  { id: 'cloud', name: 'Cloud', description: 'Infrastructure, DevOps and serverless', icon: 'cloud', keywords: ['cloud', 'devops', 'serverless', 'infrastructure'] },
  { id: 'open-source', name: 'Open Source', description: 'Build in public with maintainers', icon: 'git', keywords: ['open source', 'oss', 'github'] },
  { id: 'data-science', name: 'Data Science', description: 'Analytics, visualization and data tooling', icon: 'database', keywords: ['data', 'data science', 'analytics'] },
  { id: 'mobile', name: 'Mobile', description: 'iOS, Android and cross-platform apps', icon: 'phone', keywords: ['mobile', 'ios', 'android', 'flutter'] },
]

export const categoryById = (id: string) => categories.find((c) => c.id === id)

export const popularSearches = [
  { label: 'AI Hackathons', query: 'AI' },
  { label: 'Online Hackathons', query: 'online' },
  { label: 'React Hackathons', query: 'react' },
  { label: 'ML Hackathons', query: 'ML' },
  { label: 'Beginner Hackathons', query: 'beginner' },
]
