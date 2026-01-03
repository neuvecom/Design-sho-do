import type { Stroke } from '../../types'

export interface SavedArtwork {
  id: string
  name: string
  strokes: Stroke[]
  thumbnail: Blob
  createdAt: number
  updatedAt: number
}

const DB_NAME = 'design-shodo-db'
const DB_VERSION = 1
const STORE_NAME = 'artworks'

class ArtworkStorage {
  private db: IDBDatabase | null = null

  // データベースを開く
  async open(): Promise<void> {
    if (this.db) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open database'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 作品ストアを作成
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('updatedAt', 'updatedAt', { unique: false })
        }
      }
    })
  }

  // 作品を保存
  async save(artwork: SavedArtwork): Promise<void> {
    await this.open()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(artwork)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to save artwork'))
    })
  }

  // 作品を取得
  async get(id: string): Promise<SavedArtwork | null> {
    await this.open()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(new Error('Failed to get artwork'))
    })
  }

  // 全作品を取得（更新日時順）
  async getAll(): Promise<SavedArtwork[]> {
    await this.open()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('updatedAt')
      const request = index.getAll()

      request.onsuccess = () => {
        // 新しい順に並べ替え
        const results = request.result.sort((a, b) => b.updatedAt - a.updatedAt)
        resolve(results)
      }
      request.onerror = () => reject(new Error('Failed to get artworks'))
    })
  }

  // 作品を削除
  async delete(id: string): Promise<void> {
    await this.open()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to delete artwork'))
    })
  }

  // 作品数を取得
  async count(): Promise<number> {
    await this.open()
    if (!this.db) throw new Error('Database not initialized')

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.count()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to count artworks'))
    })
  }
}

// シングルトンインスタンス
export const artworkStorage = new ArtworkStorage()
