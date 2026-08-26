export type NotiResponse = {
  id: string;
  type: string;
  message: string;
  entityId: string;
  readAt: string | null;
  createdAt: string;
};