import { FeedPost } from '../types';

export type RootStackParamList = {
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
