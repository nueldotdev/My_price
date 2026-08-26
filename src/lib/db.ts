import AsyncStorage from '@react-native-async-storage/async-storage';
import { Verdict } from '@/constants/prop';

export interface PriceCheck {
  id: string;              // uuid, generated at creation
  productName: string;
  pricePaid: number;
  marketLow: number;
  marketHigh: number;
  verdict: Verdict;
  reasoning: string;       // the AI's explanation, shown on detail screen
  source: 'image' | 'link' | 'manual';
  sourceUrl?: string;      // present if source === 'link'
  imageUri?: string;       // present if source === 'image', local file URI
  createdAt: number;       // epoch ms
}

// What you pass in to create a check — id/createdAt are generated for you
export type NewPriceCheck = Omit<PriceCheck, 'id' | 'createdAt'>;

// ---------- Storage key ----------

const STORAGE_KEY = 'price_checks';

// ---------- Helpers ----------

function generateId(): string {
  // Good enough for a local-only, single-user app — no need to pull in a uuid lib.
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function readAll(): Promise<PriceCheck[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PriceCheck[];
  } catch {
    // Corrupted data shouldn't crash the app — worst case, history resets.
    console.warn('price_checks storage was corrupted, resetting.');
    return [];
  }
}

async function writeAll(checks: PriceCheck[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
}

// ---------- CRUD ----------

export async function saveCheck(check: NewPriceCheck): Promise<PriceCheck> {
  const full: PriceCheck = {
    ...check,
    id: generateId(),
    createdAt: Date.now(),
  };

  const all = await readAll();
  all.unshift(full); // newest first
  await writeAll(all);

  return full;
}

export async function getChecks(): Promise<PriceCheck[]> {
  return readAll();
}

export async function getCheckById(id: string): Promise<PriceCheck | null> {
  const all = await readAll();
  return all.find((c) => c.id === id) ?? null;
}

export async function getChecksByVerdict(verdict: Verdict): Promise<PriceCheck[]> {
  const all = await readAll();
  return all.filter((c) => c.verdict === verdict);
}

export async function deleteCheck(id: string): Promise<void> {
  const all = await readAll();
  await writeAll(all.filter((c) => c.id !== id));
}

export async function clearAllChecks(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}