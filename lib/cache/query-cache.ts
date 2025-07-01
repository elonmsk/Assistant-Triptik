export interface CacheItem<T = any> {
  key: string
  value: T
  timestamp: number
  expiresAt: number
  metadata?: {
    hits: number
    lastAccessed: number
    category?: string
  }
}

export interface CacheConfig {
  maxSize: number
  defaultTTL: number // Time To Live en millisecondes
  cleanupInterval: number
  enableStats: boolean
}

export interface CacheStats {
  totalItems: number
  hits: number
  misses: number
  hitRate: number
  memoryUsage: number
  oldestItem: number
  newestItem: number
}

export class QueryCache<T = any> {
  private cache = new Map<string, CacheItem<T>>()
  private config: CacheConfig
  private stats = {
    hits: 0,
    misses: 0
  }
  private cleanupTimer?: NodeJS.Timeout

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 3600000, // 1 heure
      cleanupInterval: 300000, // 5 minutes
      enableStats: true,
      ...config
    }

    // Démarrer le nettoyage automatique
    this.startCleanupTimer()
  }

  async get(key: string): Promise<T | null> {
    const item = this.cache.get(key)
    
    if (!item) {
      this.stats.misses++
      return null
    }

    // Vérifier l'expiration
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // Mettre à jour les métadonnées
    if (item.metadata) {
      item.metadata.hits++
      item.metadata.lastAccessed = Date.now()
    }

    this.stats.hits++
    return item.value
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    const now = Date.now()
    const timeToLive = ttl || this.config.defaultTTL

    // Vérifier la limite de taille
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    const item: CacheItem<T> = {
      key,
      value,
      timestamp: now,
      expiresAt: now + timeToLive,
      metadata: this.config.enableStats ? {
        hits: 0,
        lastAccessed: now
      } : undefined
    }

    this.cache.set(key, item)
  }

  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key)
    if (!item) return false
    
    // Vérifier l'expiration
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
    this.resetStats()
  }

  // Cache spécifique pour les requêtes de santé
  async cacheHealthQuery(
    query: string, 
    userContext: any, 
    response: T, 
    category?: string,
    ttl?: number
  ): Promise<void> {
    const cacheKey = this.generateHealthQueryKey(query, userContext)
    
    // TTL plus long pour certaines catégories stables
    const categoryTTL = this.getCategoryTTL(category)
    const finalTTL = ttl || categoryTTL || this.config.defaultTTL

    await this.set(cacheKey, response, finalTTL)
  }

  async getHealthQuery(query: string, userContext: any): Promise<T | null> {
    const cacheKey = this.generateHealthQueryKey(query, userContext)
    return this.get(cacheKey)
  }

  private generateHealthQueryKey(query: string, userContext: any): string {
    // Normaliser la requête
    const normalizedQuery = query.toLowerCase().trim().replace(/[^\w\s]/g, '')
    
    // Créer une clé basée sur la requête et le contexte important
    const contextKey = userContext ? 
      `${userContext.country || 'fr'}_${userContext.status || 'resident'}_${userContext.age || 'unknown'}` : 
      'default'
    
    return `health_${normalizedQuery}_${contextKey}`.replace(/\s+/g, '_')
  }

  private getCategoryTTL(category?: string): number | undefined {
    // TTL différents selon la catégorie
    const categoryTTLs: Record<string, number> = {
      'carte_vitale': 24 * 60 * 60 * 1000, // 24h - informations stables
      'remboursements': 12 * 60 * 60 * 1000, // 12h - peut changer
      'affiliation': 24 * 60 * 60 * 1000, // 24h - procédures stables
      'etranger': 6 * 60 * 60 * 1000, // 6h - réglementations qui changent
      'demandeur_asile': 6 * 60 * 60 * 1000, // 6h - politiques qui évoluent
      'soins_urgents': 2 * 60 * 60 * 1000, // 2h - informations critiques
      'general': 12 * 60 * 60 * 1000 // 12h - informations générales
    }

    return category ? categoryTTLs[category] : undefined
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTimestamp = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key)
    }
  }

  getStats(): CacheStats {
    const items = Array.from(this.cache.values())
    const totalHits = this.stats.hits
    const totalMisses = this.stats.misses
    const totalRequests = totalHits + totalMisses
    
    return {
      totalItems: this.cache.size,
      hits: totalHits,
      misses: totalMisses,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      memoryUsage: this.estimateMemoryUsage(),
      oldestItem: items.length > 0 ? Math.min(...items.map(i => i.timestamp)) : 0,
      newestItem: items.length > 0 ? Math.max(...items.map(i => i.timestamp)) : 0
    }
  }

  private estimateMemoryUsage(): number {
    // Estimation approximative en bytes
    let size = 0
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2 // UTF-16 characters
      size += JSON.stringify(item.value).length * 2
      size += 100 // Overhead approximatif pour l'objet
    }
    return size
  }

  private resetStats(): void {
    this.stats.hits = 0
    this.stats.misses = 0
  }

  // Méthodes utilitaires pour le debugging
  getCacheKeys(): string[] {
    return Array.from(this.cache.keys())
  }

  getCacheItem(key: string): CacheItem<T> | undefined {
    return this.cache.get(key)
  }

  // Nettoyage à la destruction
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    this.clear()
  }
}

export default QueryCache 