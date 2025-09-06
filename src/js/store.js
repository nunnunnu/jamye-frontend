// store.js
import { openDB } from 'idb'

const DB_NAME = 'chatDB'
const STORE_NAME = 'messages'

export async function getDB() {
  return openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
      if (!db.objectStoreNames.contains('nicknames')) {
        db.createObjectStore('nicknames', { keyPath: 'user' })
      }
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

// 메시지 저장
export async function saveMessage(message) {
  const db = await getDB()
  await db.add(STORE_NAME, message)
}

// 모든 메시지 불러오기
export async function getAllMessages() {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

// 닉네임 저장/업데이트
export async function saveNickname(user, nickname) {
  const db = await getDB()
  await db.put('nicknames', { user, nickname })
}

// 닉네임 불러오기
export async function getNicknames() {
  const db = await getDB()
  const all = await db.getAll('nicknames')
  return all.reduce((acc, cur) => {
    acc[cur.user] = cur.nickname
    return acc
  }, {})
}

  // 이미지 저장
export async function saveImage(image) {
    const db = await getDB()
    await db.put('images', image)
  }
  
  // 모든 이미지 불러오기
  export async function getAllImages() {
    const db = await getDB()
    return db.getAll('images')
}
