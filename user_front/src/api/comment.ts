import { api } from './client';
export interface FeedComment {
    id: string;
    authorName: string;
    content: string;
}
export async function fetchComments(feedId: string) {
    const res = await api.get<FeedComment[]>(`/api/feeds/${feedId}/comments`);
    return (res.data ?? []).map(item => ({ ...item, id: String(item.id) }));
}
export async function createComment(feedId: string, content: string) {
    const res = await api.post<FeedComment>(`/api/feeds/${feedId}/comments`, { content });
    return { ...res.data, id: String(res.data.id) };
}
