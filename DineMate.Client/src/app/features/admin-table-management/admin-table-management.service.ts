import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

export type RestaurantTableStatus = 0 | 1 | 2 | 3 | 4;

export interface RestaurantTableStatistics {
  total: number;
  empty: number;
  serving: number;
  maintenance: number;
  reserved: number;
  locked: number;
  emptyPercentage: number;
  servingPercentage: number;
  maintenancePercentage: number;
  reservedPercentage: number;
  lockedPercentage: number;
}

export interface RestaurantTableItem {
  id: string;
  tableName: string;
  capacity: number;
  tableType: string;
  areaName?: string | null;
  status: RestaurantTableStatus;
  statusName: string;
  note?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface RestaurantTableDetail extends RestaurantTableItem {
  qrCode?: string | null;
}

export interface RestaurantTableHistory {
  id: number;
  restaurantTableId?: string | null;
  userId?: string | null;
  userName: string;
  actionType: string;
  description: string;
  oldData?: string | null;
  newData?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface RestaurantTableManagementData {
  statistics: RestaurantTableStatistics;
  tables: PagedResult<RestaurantTableItem>;
  selectedTable?: RestaurantTableDetail | null;
  histories: RestaurantTableHistory[];
  areas: string[];
  capacities: number[];
}

export interface RestaurantTableManagementResponse {
  success: boolean;
  message: string;
  data: RestaurantTableManagementData;
}

export interface RestaurantTableManagementQuery {
  search?: string;
  areaName?: string;
  status?: number | null;
  capacity?: number | null;
  pageNumber?: number;
  pageSize?: number;
  selectedTableId?: string;
  historySize?: number;
}


export interface CreateRestaurantTableRequest {
  id: string;
  tableName: string;
  capacity: number;
  tableType: string;
  areaName?: string | null;
  note?: string | null;
}

export interface CreatedRestaurantTable {
  id: string;
  tableName: string;
  capacity: number;
  tableType: string;
  areaName?: string | null;
  qrCode: string;
  status: number;
  statusName: string;
  note?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateRestaurantTableResponse {
  success: boolean;
  message: string;
  data?: CreatedRestaurantTable | null;
}

// ==================================================
// DTO KẾT QUẢ XÓA BÀN
// ==================================================

export interface DeletedRestaurantTable {
  id: string;
  tableName: string;
  deletedAt: string;
}

export interface DeleteRestaurantTableResponse {
  success: boolean;
  message: string;
  data?: DeletedRestaurantTable | null;
}

// ==================================================
// DỮ LIỆU GỬI LÊN API CẬP NHẬT BÀN
// ==================================================

export interface UpdateRestaurantTableRequest {
  tableName: string;
  capacity: number;
  tableType: string;
  areaName?: string | null;
  status: RestaurantTableStatus;
  note?: string | null;
}

// ==================================================
// DỮ LIỆU BÀN SAU KHI CẬP NHẬT
// ==================================================

export interface UpdatedRestaurantTable {
  id: string;
  tableName: string;
  capacity: number;
  tableType: string;
  areaName?: string | null;
  qrCode?: string | null;
  status: RestaurantTableStatus;
  statusName: string;
  note?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

// ==================================================
// THÊM MỚI:
// RESPONSE API CẬP NHẬT BÀN
// ==================================================

export interface UpdateRestaurantTableResponse {
  success: boolean;
  message: string;
  data?: UpdatedRestaurantTable | null;
}

// ==================================================
// THÊM MỚI:
// DỮ LIỆU LỊCH SỬ VỪA ĐƯỢC XÓA
// ==================================================

export interface DeletedRestaurantTableHistory {
  /*
   * ID bản ghi lịch sử đã xóa.
   */
  id: number;

  /*
   * Mã bàn liên quan.
   *
   * Có thể null nếu bàn đã bị xóa trước đó.
   */
  restaurantTableId?: string | null;

  /*
   * Loại hành động của bản ghi lịch sử.
   *
   * Ví dụ:
   * CREATE
   * UPDATE
   * DELETE
   * STATUS_CHANGE
   */
  actionType: string;

  /*
   * Nội dung bản ghi lịch sử.
   */
  description: string;

  /*
   * Thời gian xóa bản ghi lịch sử.
   */
  deletedAt: string;
}

// ==================================================
// RESPONSE API XÓA LỊCH SỬ BÀN
// ==================================================

export interface DeleteRestaurantTableHistoryResponse {
  success: boolean;

  message: string;

  data?:
    DeletedRestaurantTableHistory |
    null;
}







@Injectable({
  providedIn: 'root'
})
export class AdminTableManagementService {
  private readonly apiUrl = environment.apiUrl;
  private readonly managementUrl =
    `${this.apiUrl}/api/restaurant-tables/management`;


private readonly createTableUrl =
  `${this.apiUrl}/api/restaurant-tables`;


private readonly deleteTableUrl =
  `${this.apiUrl}/api/restaurant-tables`;


// URL CẬP NHẬT BÀN
// ==================================================

private readonly updateTableUrl =
  `${this.apiUrl}/api/restaurant-tables`;



// URL XÓA LỊCH SỬ HOẠT ĐỘNG BÀN
// API:
// /api/restaurant-tables/histories/{historyId}
// ==================================================

private readonly deleteHistoryUrl =
  `${this.apiUrl}/api/restaurant-tables/histories`;






  constructor(private readonly http: HttpClient) {}


createRestaurantTable(
  request:
    CreateRestaurantTableRequest
): Observable<
  CreateRestaurantTableResponse
> {
  return this.http.post<
    CreateRestaurantTableResponse
  >(
    this.createTableUrl,
    request,
    {
      /*
       * Gửi HttpOnly Cookie JWT
       * lên backend.
       */
      withCredentials: true
    }
  );
}





  getManagementData(
    query: RestaurantTableManagementQuery
  ): Observable<RestaurantTableManagementResponse> {
    let params = new HttpParams()
      .set('pageNumber', String(query.pageNumber ?? 1))
      .set('pageSize', String(query.pageSize ?? 8))
      .set('historySize', String(query.historySize ?? 10));

    if (query.search?.trim()) {
      params = params.set('search', query.search.trim());
    }

    if (query.areaName?.trim()) {
      params = params.set('areaName', query.areaName.trim());
    }

    if (query.status !== null && query.status !== undefined) {
      params = params.set('status', String(query.status));
    }

    if (query.capacity !== null && query.capacity !== undefined) {
      params = params.set('capacity', String(query.capacity));
    }

    if (query.selectedTableId?.trim()) {
      params = params.set(
        'selectedTableId',
        query.selectedTableId.trim()
      );
    }

    return this.http.get<RestaurantTableManagementResponse>(
      this.managementUrl,
      {
        params,
        withCredentials: true
      }
    );

  }


// ==================================================
// GỌI API XÓA BÀN
//
// DELETE:
// /api/restaurant-tables/{id}
// ==================================================

deleteRestaurantTable(
  id: string
): Observable<DeleteRestaurantTableResponse> {
  /*
   * encodeURIComponent giúp mã bàn được đưa
   * vào URL một cách an toàn.
   *
   * Ví dụ:
   * A01 → A01
   * VIP 01 → VIP%2001
   */
  const deleteUrl =
    `${this.deleteTableUrl}/` +
    `${encodeURIComponent(id)}`;

  return this.http.delete<
    DeleteRestaurantTableResponse
  >(
    deleteUrl,
    {
      /*
       * Gửi HttpOnly Cookie JWT
       * lên backend để backend xác thực
       * người đang thực hiện thao tác.
       */
      withCredentials: true
    }
  );
}



// ==================================================
// THÊM MỚI:
// GỌI API CẬP NHẬT BÀN
//
// PUT:
// /api/restaurant-tables/{id}
// ==================================================

updateRestaurantTable(
  id: string,
  request: UpdateRestaurantTableRequest
): Observable<UpdateRestaurantTableResponse> {
  /*
   * Mã bàn được truyền trên URL.
   *
   * Ví dụ:
   * PUT /api/restaurant-tables/A44
   */
  const updateUrl =
    `${this.updateTableUrl}/` +
    `${encodeURIComponent(id)}`;

  return this.http.put<
    UpdateRestaurantTableResponse
  >(
    updateUrl,
    request,
    {
      /*
       * Gửi HttpOnly Cookie JWT
       * lên backend để xác thực.
       */
      withCredentials: true
    }
  );
}

// ==================================================
// THÊM MỚI:
// GỌI API XÓA MỘT BẢN GHI LỊCH SỬ BÀN
//
// DELETE:
// /api/restaurant-tables/histories/{historyId}
//
// Ví dụ:
// /api/restaurant-tables/histories/15
// ==================================================

deleteRestaurantTableHistory(
  historyId: number
): Observable<
  DeleteRestaurantTableHistoryResponse
> {
  /*
   * Kiểm tra nhanh ID trước khi tạo URL.
   *
   * Backend vẫn phải tiếp tục validate lại.
   */
  if (
    !Number.isInteger(historyId) ||
    historyId <= 0
  ) {
    throw new Error(
      'ID lịch sử hoạt động không hợp lệ.'
    );
  }

  /*
   * Tạo URL hoàn chỉnh.
   *
   * Ví dụ:
   * https://localhost:7018
   * /api/restaurant-tables
   * /histories/15
   */
  const url =
    `${this.deleteHistoryUrl}/` +
    `${historyId}`;

  return this.http.delete<
    DeleteRestaurantTableHistoryResponse
  >(
    url,
    {
      /*
       * Gửi HttpOnly Cookie JWT
       * lên backend để xác thực
       * người đang xóa lịch sử.
       */
      withCredentials: true
    }
  );
}

  
}