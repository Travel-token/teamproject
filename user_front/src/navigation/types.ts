import { FeedPost } from '../types';

export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  FeedDetail: { post: FeedPost };
  RoomExpense: { tripId: string };
  RoomSettle: { tripId: string };
  RoomMap: { tripId: string };
};

export type TabParamList = {
  Feed: undefined;
  Settle: undefined;
  MyPage: undefined;
};


export interface PlaceItem {
  id: string;
  dateLabel: string;
  emoji: string;
  name: string;
  timeLabel: string;
  withMembers: string;
  lat?: number;
  lng?: number;
}
