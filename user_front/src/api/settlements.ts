import { api } from './client';
export interface SettlementBalance {
    memberId: string;
    memberName: string;
    isMe: boolean;
    amount: number;
    bank?: string;
    accountNumber?: string;
}
export interface SettlementTransfer {
    transferId: string;
    fromMemberId: string;
    fromMemberName: string;
    toMemberId: string;
    toMemberName: string;
    amount: number;
    status: 'requested' | 'completed';
    bank?: string;
    accountNumber?: string;
}
export interface SettlementDetail {
    settlementId: string | null;
    status: 'not_created' | 'in_progress' | 'completed';
    transfers: SettlementTransfer[];
}
const detail = (d: SettlementDetail): SettlementDetail => ({ ...d, settlementId: d.settlementId == null ? null : String(d.settlementId), transfers: d.transfers.map(t => ({ ...t, transferId: String(t.transferId), fromMemberId: String(t.fromMemberId), toMemberId: String(t.toMemberId) })) });
export async function fetchSettlementBalances(id: string) { const r = await api.get<SettlementBalance[]>('/api/trips/' + id + '/settlements/balances'); return r.data.map(x => ({ ...x, memberId: String(x.memberId) })); }
export async function fetchSettlementDetail(id: string) { return detail((await api.get<SettlementDetail>('/api/trips/' + id + '/settlements')).data); }
export async function createSettlement(id: string) { return detail((await api.post<SettlementDetail>('/api/trips/' + id + '/settlements')).data); }
export async function completeSettlement(id: string) { await api.post('/api/trips/' + id + '/settlements/complete'); }
export async function completeSettlementRoute(id: string, routeId: string) { await api.post('/api/trips/' + id + '/settlements/routes/' + routeId + '/complete'); }
