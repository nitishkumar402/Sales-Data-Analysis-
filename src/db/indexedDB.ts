import { SaleRecord } from '../types/sales';

const DB_NAME = 'SalesAnalyticsDB';
const DB_VERSION = 1;
const STORE_NAME = 'sales';

let dbInstance: IDBDatabase | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('invoiceNumber', 'invoiceNumber', { unique: false });
        store.createIndex('saleDate', 'saleDate', { unique: false });
        store.createIndex('customerName', 'customerName', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('salesPerson', 'salesPerson', { unique: false });
        store.createIndex('region', 'region', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('totalAmount', 'totalAmount', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function getAllSales(): Promise<SaleRecord[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const sales = (request.result as SaleRecord[]) || [];
      // sort by saleDate desc by default
      sales.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
      resolve(sales);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getSaleById(id: string): Promise<SaleRecord | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result as SaleRecord | undefined);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function addSale(sale: SaleRecord): Promise<string> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(sale);

    request.onsuccess = () => {
      resolve(sale.id);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function updateSale(sale: SaleRecord): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const updatedRecord: SaleRecord = {
      ...sale,
      updatedAt: new Date().toISOString(),
    };
    const request = store.put(updatedRecord);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteSale(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function bulkDeleteSales(ids: string[]): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    ids.forEach((id) => {
      store.delete(id);
    });

    tx.oncomplete = () => {
      resolve();
    };

    tx.onerror = () => {
      reject(tx.error);
    };
  });
}

export async function bulkAddSales(sales: SaleRecord[]): Promise<number> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    let count = 0;

    sales.forEach((sale) => {
      store.put(sale); // put allows overwrite if ID matches
      count++;
    });

    tx.oncomplete = () => {
      resolve(count);
    };

    tx.onerror = () => {
      reject(tx.error);
    };
  });
}

export async function clearAllSales(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function checkInvoiceExists(
  invoiceNumber: string,
  excludeId?: string
): Promise<boolean> {
  const sales = await getAllSales();
  const trimmed = invoiceNumber.trim().toLowerCase();
  return sales.some(
    (s) => s.invoiceNumber.trim().toLowerCase() === trimmed && s.id !== excludeId
  );
}
