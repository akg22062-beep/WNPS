import { PaymentReceipt, SchoolExpense, Student } from '../types';

const databaseApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const databaseApiToken = import.meta.env.VITE_API_TOKEN;

export interface DatabaseSnapshot {
  students: Student[];
  receipts: PaymentReceipt[];
  expenses: SchoolExpense[];
}

export const isDatabaseApiEnabled = Boolean(databaseApiUrl);

export async function loadDatabaseSnapshot(): Promise<DatabaseSnapshot | null> {
  if (!databaseApiUrl) return null;

  const response = await fetch(`${databaseApiUrl}/database`);
  if (!response.ok) throw new Error(`Database request failed: ${response.status}`);
  return response.json() as Promise<DatabaseSnapshot>;
}

export async function replaceDatabaseResource<T>(resource: string, records: T[]): Promise<void> {
  if (!databaseApiUrl) return;

  const response = await fetch(`${databaseApiUrl}/${resource}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(databaseApiToken ? { 'X-API-Key': databaseApiToken } : {}),
    },
    body: JSON.stringify(records),
  });
  if (!response.ok) throw new Error(`Database sync failed: ${response.status}`);
}
