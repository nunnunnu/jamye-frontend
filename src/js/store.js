// store.js
import { openDB } from 'idb'

const DB_NAME = 'chatDB'
const STORE_NAME = 'messages'

export async function getDB() {
  return openDB(DB_NAME, 3, {
    upgrade(db, oldVersion) {
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        }
        if (!db.objectStoreNames.contains('nicknames')) {
          db.createObjectStore('nicknames', { keyPath: 'user' })
        }
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id', autoIncrement: true })
        }
      }
      if (oldVersion < 3) {
        if (db.objectStoreNames.contains('images')) {
          db.deleteObjectStore('images');
        }
        db.createObjectStore('images', { keyPath: 'id' });

        if (!db.objectStoreNames.contains('temp_storage')) {
            db.createObjectStore('temp_storage', { keyPath: 'key' });
        }
      }
    },
  })
}

// 메시지 저장
export async function saveMessage(chat) { // 수정함
    const db = await getDB()
    const store = db.transaction('messages', 'readwrite').objectStore('messages')

    const plain = JSON.parse(JSON.stringify(chat, (key, value) => {
        if (Array.isArray(value)) return [...value]
        return value
    }))

    // keyPath 맞추기
    if (!plain.id && chat.key) { 
        plain.id = chat.key // 수정함
    }

    await store.put(plain) // 수정함: key 인자 제거
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

// 닉네임 배열 저장
export async function saveNicknamesArray(nicknames) {
    const db = await getDB();
    const plainNicknames = JSON.parse(JSON.stringify(nicknames));
    await db.put('temp_storage', { key: 'nicknames_array', value: plainNicknames });
}

// 닉네임 배열 불러오기
export async function getNicknamesArray() {
    const db = await getDB();
    const result = await db.get('temp_storage', 'nicknames_array');
    return result ? result.value : [];
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

export async function hasSavedMessages() {
    try {
        const msgs = await getAllMessages();
        console.log("loaded messages:", msgs);
        return msgs.length > 0;
    } catch (e) {
        console.error("hasSavedMessages error:", e);
        return false;
    }
}

export async function clearMessages() { // 수정함
    const db = await getDB()
    const tx = db.transaction(['messages', 'nicknames', 'images', 'temp_storage'], 'readwrite');
    await Promise.all([
        tx.objectStore('messages').clear(),
        tx.objectStore('nicknames').clear(),
        tx.objectStore('images').clear(),
        tx.objectStore('temp_storage').clear(),
    ]);
    await tx.done;
}