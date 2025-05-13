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
  pointsRequired: number;
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
