import { api, ApiResponse } from './client';
import { ExpenseItem, TransferItem } from '../types';
const expenseItem = (e: ExpenseItem): ExpenseItem => ({ ...e, id: String(e.id), payerMemberId: String(e.payerMemberId), splits: e.splits?.map(s => ({ ...s, memberId: String(s.memberId) })) });
const transferItem = (t: TransferItem): TransferItem => ({ ...t, id: String(t.id), fromMemberId: String(t.fromMemberId), toMemberId: String(t.toMemberId) });
// ── 지출 ──────────────────────────────
export type SplitMode = 'even' | 'manual' | 'percent';
export interface SplitDetail {
    memberId: string;
    memberName: string;
    amount?: number; // manual 모드
    percent?: number; // percent 모드
}
export interface ExpensePayload {
    tripId: string;
    name: string;
    amount: number;
    payerMemberId: string;
    categoryCode: string;
    memo?: string;
    emoji?: string;
    spentAt?: string;
    splitMode?: SplitMode;
    splits?: {
        memberId: string;
        amount?: number;
        percent?: number;
    }[];
}
export async function createExpense(payload: ExpensePayload): Promise<ExpenseItem> {
    const res = await api.post<ApiResponse<ExpenseItem>>(`/trips/${payload.tripId}/expenses`, payload);
    return expenseItem(res.data.data);
}
export async function updateExpense(tripId: string, expenseId: string, payload: Partial<ExpensePayload>): Promise<ExpenseItem> {
    const res = await api.patch<ApiResponse<ExpenseItem>>(`/trips/${tripId}/expenses/${expenseId}`, payload);
    return expenseItem(res.data.data);
}
export async function deleteExpense(tripId: string, expenseId: string): Promise<void> {
    await api.delete(`/trips/${tripId}/expenses/${expenseId}`);
}
export async function fetchExpenses(tripId: string): Promise<ExpenseItem[]> {
    const res = await api.get<ApiResponse<ExpenseItem[]>>(`/trips/${tripId}/expenses`);
    return res.data.data.map(expenseItem);
}
// ── 송금 ──────────────────────────────
export interface TransferPayload {
    tripId: string;
    fromMemberId: string;
    toMemberId: string;
    amount: number;
    memo?: string;
}
export async function createTransfer(payload: TransferPayload): Promise<TransferItem> {
    const res = await api.post<ApiResponse<TransferItem>>(`/api/trips/${payload.tripId}/transfers`, payload);
    return transferItem(res.data.data);
}
export async function fetchTransfers(tripId: string): Promise<TransferItem[]> {
    const res = await api.get<ApiResponse<TransferItem[]>>(`/api/trips/${tripId}/transfers`);
    return res.data.data.map(transferItem);
}
export async function updateTransfer(tripId: string, transferId: string, payload: Omit<TransferPayload, 'tripId'>): Promise<void> {
    await api.patch(`/api/trips/${tripId}/transfers/${transferId}`, payload);
}
// 송금 내역 삭제
export async function deleteTransfer(tripId: string, transferId: string): Promise<void> {
    await api.delete(`/api/trips/${tripId}/transfers/${transferId}`);
}
