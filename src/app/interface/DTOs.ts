export interface CreateRoomRequest {
  storeId: number;
  username: string;
  password: string;
}
export interface UpdateRoomRequest {
  username: string;
  password: string;
}

export interface UpdateMenuItemRequest {
  name: string;
  price: number;
}
