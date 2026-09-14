import { FeedPost } from '../types';
import { MyFeedItem } from '../api/mypage';

export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  FeedDetail: { post: FeedPost };
  FeedCreate: undefined;
  MyFeedList: undefined;
  FeedEdit: { feed: MyFeedItem };
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
