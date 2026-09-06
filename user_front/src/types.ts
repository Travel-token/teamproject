export interface Member {
    id: string;
    name: string;
}
export interface Trip {
    id: string;
    name: string;
    region: string;
    currency?: string;
    emoji: string;
    status: '진행 중' | '완료';
    dateLabel: string;
    days: number;
    myExpense: number;
    totalExpense: number;
    members: Member[];
    collage: string[]; // 4개의 이모지, 없으면 빈 배열(이미지 없음 상태)
}
export interface ExpenseItem {
    splitMode?: 'even' | 'manual' | 'percent';
    spentAt?: string;
    memo?: string;
    splits?: {
        memberId: string;
        amount?: number;
        percent?: number;
    }[];
    id: string;
    dateLabel: string;
    emoji: string;
    name: string;
    payerName: string;
    payerMemberId: string;
    categoryCode: string;
    splitLabel: string;
    amount: number;
    myShare: number;
}
export interface PlaceItem {
    id: string;
    dateLabel: string;
    emoji: string;
    name: string;
    timeLabel: string;
    withMembers: string;
    lat: number;
    lng: number;
}
export interface TransferItem {
    id: string;
    fromMemberId: string;
    fromMemberName: string;
    toMemberId: string;
    toMemberName: string;
    amount: number;
    memo?: string;
    createdAt: string;
}
export interface BalanceRow {
    id: string;
    name: string;
    isMe?: boolean;
    amount: number; // 양수: 받을 돈, 음수: 보낼 돈, 0: 정산 완료
}
export interface FeedPost {
    photoUrls?: string[];
    id: string;
    emoji: string;
    place: string;
    date: string;
    distanceKm: number;
    likes: number;
    views: number;
    caption: string;
    authorName: string;
    authorProfileImageUrl?: string | null;
    likedByMe: boolean;
    tall?: boolean;
}
export interface HistoryTrip {
    currency?: string;
    id: string;
    name: string;
    dateLabel: string;
    amount: number;
    badge: '진행 중' | '완료';
    collage: string[];
    hidden?: boolean;
    days?: number; // 여행 일수 (마이페이지 통계 계산용)
}
