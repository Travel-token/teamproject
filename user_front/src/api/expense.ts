import { api, ApiResponse } from './client';
import { ExpenseItem, TransferItem } from '../types';

// ── 지출 ──────────────────────────────

export type SplitMode = 'even' | 'manual' | 'percent';

export interface SplitDetail {
  memberId: string;
  memberName: string;
  amount?: number;   // manual 모드
  percent?: number;  // percent 모드
}

export interface ExpensePayload {
  tripId: string;
  name: string;
  emoji: string;
  amount: number;
  payerName: string;
  splitMode: SplitMode;
  splitDetails: SplitDetail[];
  dateLabel: string;
  memo?: string;
}

export async function createExpense(payload: ExpensePayload): Promise<ExpenseItem> {
  const res = await api.post<ApiResponse<ExpenseItem>>(
    `/trips/${payload.tripId}/expenses`,
    payload
  );
  return res.data.data;
}

export async function updateExpense(
  tripId: string,
  expenseId: string,
  payload: Partial<ExpensePayload>
): Promise<ExpenseItem> {
  const res = await api.patch<ApiResponse<ExpenseItem>>(
    `/trips/${tripId}/expenses/${expenseId}`,
    payload
  );
  return res.data.data;
}

export async function deleteExpense(tripId: string, expenseId: string): Promise<void> {
  await api.delete(`/trips/${tripId}/expenses/${expenseId}`);
}

export async function fetchExpenses(tripId: string): Promise<ExpenseItem[]> {
  const res = await api.get<ApiResponse<ExpenseItem[]>>(`/trips/${tripId}/expenses`);
  return res.data.data;
}

// ── 송금 ──────────────────────────────

export interface TransferPayload {
  tripId: string;
  fromName: string;
  toName: string;
  amount: number;
  dateLabel: string;
  method?: string;
  memo?: string;
}

export async function createTransfer(payload: TransferPayload): Promise<TransferItem> {
  const res = await api.post<ApiResponse<TransferItem>>(
    `/trips/${payload.tripId}/transfers`,
    payload
  );
  return res.data.data;
}

export async function fetchTransfers(tripId: string): Promise<TransferItem[]> {
  const res = await api.get<ApiResponse<TransferItem[]>>(`/trips/${tripId}/transfers`);
  return res.data.data;
}

export async function deleteTransfer(tripId: string, transferId: string): Promise<void> {
  await api.delete(`/trips/${tripId}/transfers/${transferId}`);
}
