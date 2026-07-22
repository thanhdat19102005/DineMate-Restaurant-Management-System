import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../environment/environment';

// ==================================================
// TRẠNG THÁI CATEGORY
//
// 0: Đang ẩn
// 1: Đang hoạt động
// ==================================================

export type CategoryStatus = 0 | 1;

// ==================================================
// THỐNG KÊ CATEGORY
// ==================================================

export interface CategoryStatistics {
  total: number;

  active: number;

  hidden: number;

  activePercentage: number;

  hiddenPercentage: number;

  totalProducts: number;
}

// ==================================================
// CATEGORY TRONG DANH SÁCH
// ==================================================

export interface CategoryItem {
  id: string;

  name: string;

  description: string;

  imageUrl?: string | null;

  status: CategoryStatus;

  statusName: string;

  productCount: number;

  createdAt: string;

  updatedAt?: string | null;
}

// ==================================================
// CHI TIẾT CATEGORY
// ==================================================

export interface CategoryDetail
  extends CategoryItem {
}

// ==================================================
// LỊCH SỬ CATEGORY
// ==================================================

export interface CategoryHistory {
  id: number;

  categoryId?: string | null;

  userId?: string | null;

  userName: string;

  actionType: string;

  description: string;

  oldData?: string | null;

  newData?: string | null;

  ipAddress?: string | null;

  createdAt: string;
}

// ==================================================
// PHÂN TRANG CATEGORY
// ==================================================

export interface CategoryPagedResult {
  items: CategoryItem[];

  pageNumber: number;

  pageSize: number;

  totalItems: number;

  totalPages: number;
}

// ==================================================
// RESPONSE API QUẢN LÝ CATEGORY
// ==================================================

export interface CategoryManagementResponse {
  statistics: CategoryStatistics;

  categories: CategoryPagedResult;

  selectedCategory?:
    CategoryDetail |
    null;

  histories: CategoryHistory[];

  statuses: number[];
}

// ==================================================
// QUERY LOAD DỮ LIỆU QUẢN LÝ
// ==================================================

export interface CategoryManagementQuery {
  search?: string;

  status?: number | null;

  pageNumber?: number;

  pageSize?: number;

  selectedCategoryId?: string;

  historySize?: number;
}

// ==================================================
// REQUEST TẠO CATEGORY
//
// Angular chỉ gửi bốn trường này.
//
// UserId, UserName, IpAddress và thời gian
// sẽ do backend tự lấy.
// ==================================================

export interface CreateCategoryRequest {
  id: string;

  name: string;

  description?: string | null;

  status: CategoryStatus;
}

// ==================================================
// CATEGORY VỪA ĐƯỢC BACKEND TẠO
// ==================================================

export interface CreatedCategoryData {
  id: string;

  name: string;

  description?: string | null;

  imageUrl?: string | null;

  status: CategoryStatus;

  statusName: string;

  productCount: number;

  createdAt: string;

  updatedAt?: string | null;
}

// ==================================================
// RESPONSE API TẠO CATEGORY
//
// Backend trả:
//
// {
//   success: true,
//   message: "...",
//   data: {}
// }
// ==================================================

export interface CreateCategoryResponse {
  success: boolean;

  message: string;

  data?:
    CreatedCategoryData |
    null;
}

// ==================================================
// REQUEST CẬP NHẬT CATEGORY
//
// Category Id không gửi trong body.
//
// Id được truyền trên URL:
//
// PUT /api/categories/{categoryId}
// ==================================================

export interface UpdateCategoryRequest {
  name: string;

  description?: string | null;

  status: CategoryStatus;
}

// ==================================================
// CATEGORY VỪA ĐƯỢC BACKEND CẬP NHẬT
// ==================================================

export interface UpdatedCategoryData {
  id: string;

  name: string;

  description?: string | null;

  imageUrl?: string | null;

  status: CategoryStatus;

  statusName: string;

  productCount: number;

  createdAt: string;

  updatedAt?: string | null;
}

// ==================================================
// RESPONSE API CẬP NHẬT CATEGORY
//
// Backend trả:
//
// {
//   success: true,
//   message: "...",
//   data: {}
// }
// ==================================================

export interface UpdateCategoryResponse {
  success: boolean;

  message: string;

  data?:
    UpdatedCategoryData |
    null;
}

// ==================================================
// THÊM MỚI:
// CATEGORY VỪA ĐƯỢC BACKEND XÓA
//
// Backend DeleteCategoryDto trả:
//
// {
//   id: "LAU",
//   name: "Lẩu",
//   deletedAt: "..."
// }
// ==================================================

export interface DeletedCategoryData {
  id: string;

  name: string;

  deletedAt: string;
}

// ==================================================
// THÊM MỚI:
// RESPONSE API XÓA CATEGORY
//
// Backend trả:
//
// {
//   success: true,
//   message: "...",
//   data: {
//     id: "...",
//     name: "...",
//     deletedAt: "..."
//   }
// }
// ==================================================

export interface DeleteCategoryResponse {
  success: boolean;

  message: string;

  data?:
    DeletedCategoryData |
    null;
}


// ==================================================
// THÊM MỚI DELETE CATEGORY HISTORY:
// LỊCH SỬ CATEGORY VỪA ĐƯỢC BACKEND XÓA
//
// Backend DeletedCategoryHistoryDto trả:
//
// {
//   id: 25,
//   categoryId: "COM",
//   actionType: "DELETE",
//   description: "...",
//   deletedAt: "..."
// }
// ==================================================

export interface DeletedCategoryHistoryData {
  id: number;

  categoryId?:
    string |
    null;

  actionType: string;

  description: string;

  deletedAt: string;
}

// ==================================================
// THÊM MỚI DELETE CATEGORY HISTORY:
// RESPONSE API XÓA CATEGORY HISTORY
//
// Backend trả:
//
// {
//   success: true,
//   message: "...",
//   data: {
//     id: 25,
//     categoryId: "COM",
//     actionType: "DELETE",
//     description: "...",
//     deletedAt: "..."
//   }
// }
// ==================================================

export interface DeleteCategoryHistoryResponse {
  success: boolean;

  message: string;

  data?:
    DeletedCategoryHistoryData |
    null;
}

// ==================================================
// SERVICE
// ==================================================

@Injectable({
  providedIn: 'root'
})
export class AdminCategoryManagementService {

  // ==================================================
  // API GỐC
  // ==================================================

  private readonly apiUrl =
    environment.apiUrl;

  // ==================================================
  // GET:
  // /api/categories/management
  // ==================================================

  private readonly managementUrl =
    `${this.apiUrl}/api/categories/management`;

  // ==================================================
  // POST:
  // /api/categories
  // ==================================================

  private readonly createCategoryUrl =
    `${this.apiUrl}/api/categories`;

  // ==================================================
  // PUT:
  // /api/categories/{categoryId}
  //
  // Đây là URL gốc.
  // Category Id sẽ được nối trong phương thức updateCategory.
  // ==================================================

  private readonly updateCategoryUrl =
    `${this.apiUrl}/api/categories`;

  // ==================================================
  // THÊM MỚI:
  // DELETE:
  // /api/categories/{categoryId}
  //
  // Đây là URL gốc.
  // Category Id sẽ được nối trong phương thức deleteCategory.
  // ==================================================

  private readonly deleteCategoryUrl =
    `${this.apiUrl}/api/categories`;


  // ==================================================
  // THÊM MỚI DELETE CATEGORY HISTORY:
  // DELETE:
  // /api/categories/histories/{historyId}
  //
  // Đây là URL gốc.
  // History Id được nối trong deleteCategoryHistory().
  // ==================================================

  private readonly deleteCategoryHistoryUrl =
    `${this.apiUrl}/api/categories/histories`;

  constructor(
    private readonly http:
      HttpClient
  ) {}

  // ==================================================
  // LOAD DỮ LIỆU QUẢN LÝ CATEGORY
  // ==================================================

  getManagementData(
    query:
      CategoryManagementQuery
  ): Observable<CategoryManagementResponse> {

    let params =
      new HttpParams()
        .set(
          'pageNumber',
          String(
            query.pageNumber ??
            1
          )
        )
        .set(
          'pageSize',
          String(
            query.pageSize ??
            20
          )
        )
        .set(
          'historySize',
          String(
            query.historySize ??
            10
          )
        );

    // ==================================================
    // TÌM KIẾM
    // ==================================================

    if (
      query.search?.trim()
    ) {
      params =
        params.set(
          'search',
          query.search.trim()
        );
    }

    // ==================================================
    // LỌC TRẠNG THÁI
    //
    // status = 0 vẫn hợp lệ nên không dùng:
    // if (query.status)
    // ==================================================

    if (
      query.status !== null &&
      query.status !== undefined
    ) {
      params =
        params.set(
          'status',
          String(
            query.status
          )
        );
    }

    // ==================================================
    // CATEGORY ĐANG ĐƯỢC CHỌN
    // ==================================================

    if (
      query.selectedCategoryId?.trim()
    ) {
      params =
        params.set(
          'selectedCategoryId',
          query
            .selectedCategoryId
            .trim()
        );
    }

    // ==================================================
    // GỌI API GET
    //
    // withCredentials gửi HttpOnly Cookie JWT.
    // ==================================================

    return this.http.get<
      CategoryManagementResponse
    >(
      this.managementUrl,
      {
        params,

        withCredentials:
          true
      }
    );
  }

  // ==================================================
  // TẠO CATEGORY THẬT
  //
  // POST:
  // /api/categories
  // ==================================================

  createCategory(
    request:
      CreateCategoryRequest
  ): Observable<CreateCategoryResponse> {

    /*
     * Chuẩn hóa payload trước khi gửi.
     *
     * Backend vẫn tiếp tục kiểm tra lại
     * bằng Domain Rules.
     */
    const payload:
      CreateCategoryRequest = {
        id:
          request.id
            .trim()
            .toUpperCase(),

        name:
          request.name
            .trim(),

        description:
          request.description?.trim()
            ? request
                .description
                .trim()
            : null,

        status:
          request.status
      };

    return this.http.post<
      CreateCategoryResponse
    >(
      this.createCategoryUrl,
      payload,
      {
        /*
         * Bắt buộc vì JWT của hệ thống
         * đang nằm trong HttpOnly Cookie.
         */
        withCredentials:
          true
      }
    );
  }

  // ==================================================
  // CẬP NHẬT CATEGORY THẬT
  //
  // PUT:
  // /api/categories/{categoryId}
  //
  // Ví dụ:
  // /api/categories/LAU
  // ==================================================

  updateCategory(
    categoryId:
      string,

    request:
      UpdateCategoryRequest
  ): Observable<UpdateCategoryResponse> {

    /*
     * Mã loại chỉ được dùng trên URL.
     * Không gửi mã loại trong body.
     */
    const normalizedCategoryId =
      categoryId
        .trim()
        .toUpperCase();

    /*
     * Chuẩn hóa payload trước khi gửi.
     *
     * Backend tiếp tục kiểm tra lại
     * bằng CategoryRules.ValidateUpdate.
     */
    const payload:
      UpdateCategoryRequest = {
        name:
          request.name
            .trim(),

        description:
          request.description?.trim()
            ? request
                .description
                .trim()
            : null,

        status:
          request.status
      };

    const requestUrl =
      `${this.updateCategoryUrl}/${encodeURIComponent(
        normalizedCategoryId
      )}`;

    return this.http.put<
      UpdateCategoryResponse
    >(
      requestUrl,
      payload,
      {
        /*
         * Gửi HttpOnly Cookie JWT
         * lên backend.
         */
        withCredentials:
          true
      }
    );
  }

  // ==================================================
  // THÊM MỚI:
  // XÓA CATEGORY THẬT
  //
  // DELETE:
  // /api/categories/{categoryId}
  //
  // Ví dụ:
  // /api/categories/LAU
  //
  // Angular không gửi body.
  // UserId, UserName và IpAddress do backend tự lấy.
  // ==================================================

  deleteCategory(
    categoryId:
      string
  ): Observable<DeleteCategoryResponse> {

    // ==================================================
    // THÊM MỚI:
    // CHUẨN HÓA CATEGORY ID TRƯỚC KHI ĐƯA LÊN URL
    // ==================================================

    const normalizedCategoryId =
      categoryId
        .trim()
        .toUpperCase();

    // ==================================================
    // THÊM MỚI:
    // TẠO URL DELETE AN TOÀN
    //
    // encodeURIComponent tránh lỗi khi mã loại
    // chứa ký tự đặc biệt hợp lệ trên URL.
    // ==================================================

    const requestUrl =
      `${this.deleteCategoryUrl}/${encodeURIComponent(
        normalizedCategoryId
      )}`;

    // ==================================================
    // THÊM MỚI:
    // GỌI API DELETE
    //
    // withCredentials gửi HttpOnly Cookie JWT.
    // ==================================================

    return this.http.delete<
      DeleteCategoryResponse
    >(
      requestUrl,
      {
        withCredentials:
          true
      }
    );
  }

  // ==================================================
  // THÊM MỚI DELETE CATEGORY HISTORY:
  // XÓA MỘT BẢN GHI LỊCH SỬ CATEGORY
  //
  // DELETE:
  // /api/categories/histories/{historyId}
  //
  // Ví dụ:
  // /api/categories/histories/25
  //
  // Angular không gửi body.
  // UserId, UserName và IpAddress do backend tự lấy.
  // ==================================================

  deleteCategoryHistory(
    historyId:
      number
  ): Observable<DeleteCategoryHistoryResponse> {

    // ==================================================
    // THÊM MỚI DELETE CATEGORY HISTORY:
    // CHUẨN HÓA HISTORY ID
    //
    // Backend tiếp tục kiểm tra lại bằng
    // CategoryRules.ValidateDeleteHistory.
    // ==================================================

    const normalizedHistoryId =
      Math.trunc(
        historyId
      );

    // ==================================================
    // THÊM MỚI DELETE CATEGORY HISTORY:
    // TẠO URL DELETE
    // ==================================================

    const requestUrl =
      `${this.deleteCategoryHistoryUrl}/${encodeURIComponent(
        String(
          normalizedHistoryId
        )
      )}`;

    // ==================================================
    // THÊM MỚI DELETE CATEGORY HISTORY:
    // GỌI API DELETE
    //
    // withCredentials gửi HttpOnly Cookie JWT.
    // ==================================================

    return this.http.delete<
      DeleteCategoryHistoryResponse
    >(
      requestUrl,
      {
        withCredentials:
          true
      }
    );
  }

}