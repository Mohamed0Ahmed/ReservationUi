export interface ApiResponse<T> {
  isSuccess: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}
export interface Store {
  id: number;
  name: string;
  ownerEmail: string;
  rooms: Room[];
}

export interface Room {
  id: number;
  username: string;
  password: string;
  storeId: number;
}
