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

export interface Category {
  id: number;
  name: string;
  storeId: number;
}
export interface Item {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  storeId: number;
}

export interface Assistance {
  id: number;
  name: string;
}
export interface Order {
  id: number;
  customerNumber: string;
  customerId: number;
  roomId: number;
  storeId: number;
  totalAmount: number;
  status: number;
  rejectionReason: string;
  orderDate: string;
  orderItems: OrderItem[];
  roomName: string;
}

export interface OrderItem {
  orderId: number;
  menuItemId: number;
  quantity: number;
}

export interface RequestDto {
  id: number;
  customerId: number | null;
  roomId: number;
  roomName: string;
  storeId: number;
  requestTypeId: number;
  status: number;
  rejectionReason: string;
  requestDate: string;
}

export interface Customer {
  id: number;
  phoneNumber: string;
  storeId: number;
  points: number;
}

export interface GiftDto {
  id?: number;
  name: string;
  pointsRequired: number;
  storeId?: number;
}

export interface GiftRedemptionDto {
  id: number;
  giftId: number;
  giftName: string;
  customerId: number;
  customerPhone: string;
  roomId: number;
  roomName: string;
  storeId: number;
  pointsUsed: number;
  status: string;
  rejectionReason: string;
  isCustomerConfirmed?: boolean;
}
