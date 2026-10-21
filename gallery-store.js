/*
 * Pixel-meow 로컬 갤러리 저장소
 * - 작품은 이 컴퓨터의 브라우저(IndexedDB)에 저장됩니다. (서버/클라우드 전송 없음)
 * - canvas.html, index.html, detail.html이 같은 저장소를 공유합니다.
 * - 사용법: window.pixelGallery.list() / get(id) / add(data) / update(id, patch) / remove(id)
 */
(function () {
  const DB_NAME = 'pixel-meow';
  const DB_VERSION = 1;
  const STORE = 'arts';

  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('이 브라우저는 IndexedDB를 지원하지 않습니다.'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  function reqToPromise(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // 트랜잭션이 "완전히 커밋된 뒤"에 resolve → 저장 직후 페이지를 이동해도 안전
  function run(mode, fn) {
    return openDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      let result;
      Promise.resolve(fn(store)).then(r => { result = r; }).catch(err => {
        try { tx.abort(); } catch (e) {}
        reject(err);
      });
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('저장이 취소되었습니다.'));
    }));
  }

  function newId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'art-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  const api = {
    // 최신순 목록
    async list() {
      const all = await run('readonly', store => reqToPromise(store.getAll()));
      return (all || []).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    },

    async get(id) {
      const art = await run('readonly', store => reqToPromise(store.get(id)));
      return art || null;
    },

    // 새 작품 추가 → 새 id 반환
    async add(data) {
      const now = Date.now();
      const art = { ...data, id: newId(), createdAt: now, updatedAt: now };
      await run('readwrite', store => reqToPromise(store.add(art)));
      api.requestPersistence();
      return art.id;
    },

    // 기존 작품 일부 필드 수정 (덮어쓰기 / 제목 수정 등)
    async update(id, patch) {
      await run('readwrite', async store => {
        const cur = await reqToPromise(store.get(id));
        if (!cur) throw new Error('작품을 찾을 수 없습니다.');
        await reqToPromise(store.put({
          ...cur,
          ...patch,
          id: cur.id,
          createdAt: cur.createdAt,
          updatedAt: Date.now()
        }));
      });
    },

    async remove(id) {
      await run('readwrite', store => reqToPromise(store.delete(id)));
    },

    // 브라우저가 저장 공간 부족 시 데이터를 임의로 지우지 않도록 요청 (실패해도 무방)
    requestPersistence() {
      try {
        if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
      } catch (e) {}
    }
  };

  window.pixelGallery = api;
})();
