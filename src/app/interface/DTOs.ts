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

export interface CreateGiftRedemptionDto {
  giftId: number;
  customerNumber: string;
  roomId: number;
}

export interface UpdateGiftRedemptionStatusDto {
  isApproved: boolean;
  rejectionReason?: string;
}
