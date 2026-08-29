export type Comment = {
  id: string;
  userId: string;
  postId: string;
  content: string;
  updateTime: string | null;
  createTime: number | null;
  isDelete: boolean;
  replyTo: string | null;
  avatar: string | null;
  username: string;
};
