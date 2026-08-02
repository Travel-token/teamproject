export interface Member {
  id: string;
  name: string;
}

export interface Trip {
  id: string;
  name: string;
  region: string;
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
  id: string;
  dateLabel: string; // ex: "07월 10일 · 1일차"
  emoji: string;
  name: string;
  payerName: string;
  splitLabel: string; // ex: "3명 균등"
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
}

export interface TransferItem {
  id: string;
  fromName: string;
  toName: string;
  dateLabel: string;
  method: string;
  amount: number;
}

export interface BalanceRow {
  id: string;
  name: string;
  isMe?: boolean;
  amount: number; // 양수: 받을 돈, 음수: 보낼 돈, 0: 정산 완료
}

export interface FeedPost {
  id: string;
  emoji: string;
  place: string;
  date: string;
  distanceKm: number;
  likes: number;
  views: number;
  caption: string;
  tall?: boolean;
}

export interface HistoryTrip {
  id: string;
  name: string;
  dateLabel: string;
  amount: number;
  badge: '진행 중' | '완료';
  collage: string[];
  hidden?: boolean;
}
