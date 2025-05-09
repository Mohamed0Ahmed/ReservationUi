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

export interface AssistanceRequestType {
  id: number;
  name: string;
}

export interface DefaultAssistanceRequestType {
  id: number;
  name: string;
  createdOn?: Date;
  lastModifiedOn?: Date;
  isDeleted?: boolean;
}

export interface AssistanceDto {
  id: number;
  name: string;
}
