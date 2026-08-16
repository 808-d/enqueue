export type Comment = {
  ID: string;
  UserID: string;
  PostID: string;
  Content: string;
  UpdateTime: string | null;
  Createtime: string;
  IsDelete: boolean;
  ReplyTo: string | null;
};
