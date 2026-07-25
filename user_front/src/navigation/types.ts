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
