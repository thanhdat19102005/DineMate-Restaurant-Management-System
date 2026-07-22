import {
  CommonModule
} from '@angular/common';

import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  Subject,
  takeUntil
} from 'rxjs';

// ==================================================
// THÊM MỚI DELETE API:
// SWEETALERT2 CHO XÁC NHẬN, THÀNH CÔNG VÀ LỖI
// ==================================================

import Swal from 'sweetalert2';

import {
  environment
} from '../../environment/environment';

import {
  AdminCategoryManagementService,
  CategoryDetail,
  CategoryHistory,
  CategoryItem,
  CategoryManagementResponse,
  CategoryStatistics,
  CreatedCategoryData,
  UpdatedCategoryData
} from './admin-category-management.service';

// ==================================================
// COMPONENT CON FORM TẠO CATEGORY
// ==================================================

import {
  CreateRestaurantCategoryComponent
} from './create-restaurant-category/create-restaurant-category.component';

// ==================================================
// COMPONENT CON FORM CẬP NHẬT CATEGORY
// ==================================================

import {
  UpdateRestaurantCategoryComponent
} from './update-restaurant-category/update-restaurant-category.component';

// ==================================================
// CARD THỐNG KÊ TRÊN GIAO DIỆN
// ==================================================

interface CategoryStatisticCard {
  label: string;

  value: number;

  percentage: number;

  icon: string;

  cssClass:
    | 'total'
    | 'active'
    | 'hidden';
}

// ==================================================
// OPTION TRẠNG THÁI
// ==================================================

interface CategoryStatusOption {
  value: number | null;

  label: string;
}

// ==================================================
// VIEW MODEL LỊCH SỬ
// ==================================================

interface CategoryHistoryViewModel
  extends CategoryHistory {

  roleName: string;

  cssClass:
    | 'create'
    | 'update'
    | 'delete'
    | 'status';
}

@Component({
  selector:
    'app-admin-category-management',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    CreateRestaurantCategoryComponent,
    UpdateRestaurantCategoryComponent
  ],

  templateUrl:
    './admin-category-management.component.html',

  styleUrl:
    './admin-category-management.component.css'
})
export class AdminCategoryManagementComponent
  implements OnInit, OnDestroy {

  // ==================================================
  // HỦY SUBSCRIBE
  // ==================================================

  private readonly destroy$ =
    new Subject<void>();

  // ==================================================
  // TIMER TÌM KIẾM
  // ==================================================

  private searchTimer?:
    ReturnType<typeof setTimeout>;

  // ==================================================
  // TRẠNG THÁI LOAD
  // ==================================================

  isLoading = false;

  errorMessage = '';

  // ==================================================
  // TRẠNG THÁI ĐÓNG / MỞ FORM TẠO CATEGORY
  // ==================================================

  isCreateCategoryFormOpen = false;

  // ==================================================
  // TRẠNG THÁI ĐÓNG / MỞ FORM CẬP NHẬT CATEGORY
  // ==================================================

  isUpdateCategoryFormOpen =
    false;

  categoryBeingUpdated:
    CategoryItem |
    null = null;

  // ==================================================
  // THÊM MỚI DELETE API:
  // CATEGORY ĐANG ĐƯỢC GỬI YÊU CẦU XÓA
  //
  // Dùng để:
  // - Ngăn người dùng bấm xóa nhiều lần.
  // - Hiển thị trạng thái "Đang xóa" trên đúng dòng.
  // ==================================================

  deletingCategoryId:
    string |
    null = null;

  // ==================================================
  // THÊM MỚI DELETE CATEGORY HISTORY:
  // ID LỊCH SỬ ĐANG ĐƯỢC GỬI YÊU CẦU XÓA
  //
  // Chỉ dùng để ngăn người dùng gửi nhiều yêu cầu
  // xóa lịch sử cùng lúc.
  // ==================================================

  deletingCategoryHistoryId:
    number |
    null = null;

  // ==================================================
  // TÌM KIẾM VÀ LỌC
  // ==================================================

  searchKeyword = '';

  selectedStatus: number | null = null;

  statusOptions:
    CategoryStatusOption[] = [
      {
        value: null,
        label: 'Tất cả trạng thái'
      },
      {
        value: 1,
        label: 'Đang sử dụng'
      },
      {
        value: 0,
        label: 'Đã ẩn'
      }
    ];

  // ==================================================
  // PHÂN TRANG
  // ==================================================

  pageSize = 20;

  currentPage = 1;

  totalPages = 1;

  totalItems = 0;

  startItem = 0;

  endItem = 0;

  hasPreviousPage = false;

  hasNextPage = false;

  // ==================================================
  // DỮ LIỆU CATEGORY
  // ==================================================

  categories:
    CategoryItem[] = [];

  selectedCategory:
    CategoryDetail |
    null = null;

  histories:
    CategoryHistoryViewModel[] = [];

  // ==================================================
  // THỐNG KÊ
  // ==================================================

  statisticsData:
    CategoryStatistics = {
      total: 0,

      active: 0,

      hidden: 0,

      activePercentage: 0,

      hiddenPercentage: 0,

      totalProducts: 0
    };

  constructor(
    private readonly categoryService:
      AdminCategoryManagementService
  ) {}

  // ==================================================
  // KHỞI TẠO
  // ==================================================

  ngOnInit(): void {

    this.loadCategoryManagementData();
  }

  // ==================================================
  // HỦY COMPONENT
  // ==================================================

  ngOnDestroy(): void {

    if (
      this.searchTimer
    ) {
      clearTimeout(
        this.searchTimer
      );
    }

    this.destroy$.next();

    this.destroy$.complete();
  }

  // ==================================================
  // CARD THỐNG KÊ
  // ==================================================

  get statistics():
    CategoryStatisticCard[] {

    return [
      {
        label:
          'Tổng số loại',

        value:
          this.statisticsData.total,

        percentage:
          this.statisticsData.total > 0
            ? 100
            : 0,

        icon:
          'category',

        cssClass:
          'total'
      },
      {
        label:
          'Đang sử dụng',

        value:
          this.statisticsData.active,

        percentage:
          this.statisticsData
            .activePercentage,

        icon:
          'check_circle',

        cssClass:
          'active'
      },
      {
        label:
          'Đã ẩn',

        value:
          this.statisticsData.hidden,

        percentage:
          this.statisticsData
            .hiddenPercentage,

        icon:
          'visibility_off',

        cssClass:
          'hidden'
      }
    ];
  }

  // ==================================================
  // LOAD DỮ LIỆU API
  // ==================================================

  loadCategoryManagementData(
    selectedCategoryId?:
      string |
      null
  ): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.categoryService
      .getManagementData({
        search:
          this.searchKeyword,

        status:
          this.selectedStatus,

        pageNumber:
          this.currentPage,

        pageSize:
          this.pageSize,

        historySize:
          10,

        selectedCategoryId:
          selectedCategoryId ??
          this.selectedCategory?.id ??
          undefined
      })
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({
        next: (
          response:
            CategoryManagementResponse
        ) => {

          this.handleApiResponse(
            response
          );

          this.isLoading = false;
        },

        error: error => {

          console.error(
            'Lỗi tải dữ liệu loại món:',
            error
          );

          this.errorMessage =
            this.getApiErrorMessage(
              error
            );

          this.isLoading = false;
        }
      });
  }

  // ==================================================
  // XỬ LÝ RESPONSE API
  //
  // Backend trả dữ liệu trực tiếp.
  // Không sử dụng response.data.
  // ==================================================

  private handleApiResponse(
    response:
      CategoryManagementResponse
  ): void {

    if (
      !response
    ) {
      this.resetData();

      this.errorMessage =
        'API không trả về dữ liệu quản lý loại món.';

      return;
    }

    this.statisticsData = {
      total:
        response.statistics?.total ??
        0,

      active:
        response.statistics?.active ??
        0,

      hidden:
        response.statistics?.hidden ??
        0,

      activePercentage:
        response.statistics
          ?.activePercentage ??
        0,

      hiddenPercentage:
        response.statistics
          ?.hiddenPercentage ??
        0,

      totalProducts:
        response.statistics
          ?.totalProducts ??
        0
    };

    this.categories =
      response.categories?.items ??
      [];

    this.currentPage =
      response.categories
        ?.pageNumber ??
      1;

    this.pageSize =
      response.categories
        ?.pageSize ??
      this.pageSize;

    this.totalItems =
      response.categories
        ?.totalItems ??
      0;

    this.totalPages =
      response.categories
        ?.totalPages ??
      1;

    this.hasPreviousPage =
      this.currentPage > 1;

    this.hasNextPage =
      this.currentPage <
      this.totalPages;

    this.calculateDisplayedItemRange();

    this.statusOptions = [
      {
        value: null,
        label: 'Tất cả trạng thái'
      },

      ...(response.statuses ?? [])
        .map(status => ({
          value:
            status,

          label:
            status === 1
              ? 'Đang sử dụng'
              : 'Đã ẩn'
        }))
    ];

    this.selectedCategory =
      response.selectedCategory ??
      null;

    if (
      !this.selectedCategory &&
      this.categories.length > 0
    ) {
      this.selectedCategory =
        this.categories[0];
    }

    this.histories =
      (response.histories ?? [])
        .map(history =>
          this.mapHistoryToViewModel(
            history
          )
        );

    this.errorMessage = '';
  }

  // ==================================================
  // RESET DỮ LIỆU
  // ==================================================

  private resetData(): void {

    this.statisticsData = {
      total: 0,

      active: 0,

      hidden: 0,

      activePercentage: 0,

      hiddenPercentage: 0,

      totalProducts: 0
    };

    this.categories = [];

    this.selectedCategory = null;

    this.histories = [];

    this.currentPage = 1;

    this.totalPages = 1;

    this.totalItems = 0;

    this.startItem = 0;

    this.endItem = 0;

    this.hasPreviousPage = false;

    this.hasNextPage = false;
  }

  // ==================================================
  // TÍNH VỊ TRÍ PHÂN TRANG
  // ==================================================

  private calculateDisplayedItemRange():
    void {

    if (
      this.totalItems === 0 ||
      this.categories.length === 0
    ) {
      this.startItem = 0;

      this.endItem = 0;

      return;
    }

    this.startItem =
      (this.currentPage - 1) *
      this.pageSize +
      1;

    this.endItem =
      Math.min(
        this.startItem +
        this.categories.length -
        1,

        this.totalItems
      );
  }

  // ==================================================
  // TÌM KIẾM
  // ==================================================

  onSearchKeywordChange(): void {

    if (
      this.searchTimer
    ) {
      clearTimeout(
        this.searchTimer
      );
    }

    this.searchTimer =
      setTimeout(() => {

        this.currentPage = 1;

        this.selectedCategory = null;

        this.loadCategoryManagementData(
          null
        );

      }, 400);
  }

  // ==================================================
  // LỌC TRẠNG THÁI
  // ==================================================

  onStatusChange(): void {

    this.currentPage = 1;

    this.selectedCategory = null;

    this.loadCategoryManagementData(
      null
    );
  }

  // ==================================================
  // THAY ĐỔI PAGE SIZE
  // ==================================================

  onPageSizeChange(): void {

    this.currentPage = 1;

    this.selectedCategory = null;

    this.loadCategoryManagementData(
      null
    );
  }

  // ==================================================
  // CHỌN CATEGORY
  // ==================================================

  selectCategory(
    category:
      CategoryItem
  ): void {

    if (
      this.selectedCategory?.id ===
      category.id
    ) {
      return;
    }

    this.selectedCategory =
      category;

    this.loadCategoryManagementData(
      category.id
    );
  }

  isSelectedCategory(
    category:
      CategoryItem
  ): boolean {

    return (
      this.selectedCategory?.id ===
      category.id
    );
  }

  // ==================================================
  // TRẠNG THÁI CATEGORY
  // ==================================================

  getStatusLabel(
    status:
      number
  ): string {

    return status === 1
      ? 'Đang sử dụng'
      : 'Đã ẩn';
  }

  getStatusClass(
    status:
      number
  ): string {

    return status === 1
      ? 'active'
      : 'hidden';
  }

  // ==================================================
  // URL HÌNH ẢNH CATEGORY
  // ==================================================

  getCategoryImageUrl(
    imageUrl?:
      string |
      null
  ): string | null {

    if (
      !imageUrl
    ) {
      return null;
    }

    if (
      imageUrl.startsWith(
        'http://'
      ) ||
      imageUrl.startsWith(
        'https://'
      )
    ) {
      return imageUrl;
    }

    const normalizedPath =
      imageUrl.startsWith('/')
        ? imageUrl
        : `/${imageUrl}`;

    return (
      environment.apiUrl +
      normalizedPath
    );
  }

  // ==================================================
  // XỬ LÝ LỖI ẢNH
  // ==================================================

  onCategoryImageError(
    event:
      Event
  ): void {

    const imageElement =
      event.target as HTMLImageElement;

    imageElement.style.display =
      'none';

    const parentElement =
      imageElement.parentElement;

    const fallbackIcon =
      parentElement?.querySelector(
        '.fallback-category-icon'
      ) as HTMLElement | null;

    if (
      fallbackIcon
    ) {
      fallbackIcon.style.display =
        'inline-block';
    }
  }

  // ==================================================
  // PHÂN TRANG
  // ==================================================

  changePage(
    page:
      number
  ): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage ||
      this.isLoading
    ) {
      return;
    }

    this.currentPage = page;

    this.selectedCategory = null;

    this.loadCategoryManagementData(
      null
    );
  }

  get visiblePageNumbers():
    number[] {

    const pages:
      number[] = [];

    const maximumVisiblePages =
      5;

    if (
      this.totalPages <= 1
    ) {
      return [1];
    }

    let startPage =
      Math.max(
        1,
        this.currentPage - 2
      );

    let endPage =
      Math.min(
        this.totalPages,
        startPage +
        maximumVisiblePages -
        1
      );

    if (
      endPage -
      startPage +
      1 <
      maximumVisiblePages
    ) {
      startPage =
        Math.max(
          1,
          endPage -
          maximumVisiblePages +
          1
        );
    }

    for (
      let page = startPage;
      page <= endPage;
      page++
    ) {
      pages.push(
        page
      );
    }

    return pages;
  }

  // ==================================================
  // THỬ LẠI
  // ==================================================

  retryLoad(): void {

    this.loadCategoryManagementData(
      this.selectedCategory?.id ??
      null
    );
  }

  // ==================================================
  // MỞ FORM TẠO CATEGORY
  // ==================================================

  addCategory(): void {

    this.isCreateCategoryFormOpen =
      true;
  }

  // ==================================================
  // ĐÓNG FORM TẠO CATEGORY
  // ==================================================

  closeCreateCategoryForm(): void {

    this.isCreateCategoryFormOpen =
      false;
  }

  // ==================================================
  // NHẬN CATEGORY THẬT VỪA ĐƯỢC BACKEND TẠO
  //
  // Sau khi tạo thành công:
  //
  // 1. Đóng form.
  // 2. Quay về trang đầu.
  // 3. Xóa Category đang chọn cũ.
  // 4. Load lại danh sách, thống kê, lịch sử.
  // 5. Yêu cầu backend chọn Category vừa tạo.
  // ==================================================

  handleCategoryCreated(
    category:
      CreatedCategoryData
  ): void {

    this.isCreateCategoryFormOpen =
      false;

    this.currentPage =
      1;

    this.selectedCategory =
      null;

    this.loadCategoryManagementData(
      category.id
    );
  }

  // ==================================================
  // CÁC CHỨC NĂNG CATEGORY KHÁC
  // ==================================================

  // ==================================================
  // MỞ FORM CẬP NHẬT CATEGORY
  // ==================================================

  editCategory(
    category:
      CategoryItem,

    event?:
      MouseEvent
  ): void {

    event?.stopPropagation();

    this.categoryBeingUpdated =
      category;

    this.isUpdateCategoryFormOpen =
      true;
  }

  // ==================================================
  // ĐÓNG FORM CẬP NHẬT CATEGORY
  // ==================================================

  closeUpdateCategoryForm(): void {

    this.isUpdateCategoryFormOpen =
      false;

    this.categoryBeingUpdated =
      null;
  }

  // ==================================================
  // NHẬN CATEGORY THẬT VỪA ĐƯỢC BACKEND CẬP NHẬT
  //
  // Tên hàm handleFakeCategoryUpdated được giữ nguyên
  // để HTML component cha hiện tại không cần thay đổi.
  //
  // Logic bên trong đã chuyển hoàn toàn sang dữ liệu thật.
  // ==================================================

  handleFakeCategoryUpdated(
    category:
      UpdatedCategoryData
  ): void {

    this.isUpdateCategoryFormOpen =
      false;

    this.categoryBeingUpdated =
      null;

    /*
     * Giữ nguyên trang hiện tại.
     *
     * Load lại:
     * - Danh sách Category.
     * - Thống kê.
     * - Chi tiết Category vừa sửa.
     * - Lịch sử UPDATE hoặc STATUS_CHANGE.
     */
    this.loadCategoryManagementData(
      category.id
    );
  }

  toggleCategoryStatus(
    category:
      CategoryItem,

    event?:
      MouseEvent
  ): void {

    event?.stopPropagation();

    console.log(
      'Thay đổi trạng thái loại món:',
      category
    );
  }

  // ==================================================
  // THÊM MỚI DELETE API:
  // MỞ ALERT XÁC NHẬN XÓA CATEGORY
  //
  // Logic cũ của các chức năng khác được giữ nguyên.
  // ==================================================

  // ==================================================
  // THAY ĐỔI DESIGN DELETE ALERT:
  // NẠP CSS CHO FORM XÁC NHẬN XÓA
  //
  // CSS được tạo một lần trong <head>.
  // Không ảnh hưởng tới giao diện và logic khác.
  // ==================================================

  private ensureDeleteCategoryAlertStyles():
    void {

    if (
      typeof document ===
      'undefined'
    ) {
      return;
    }

    const styleId =
      'category-delete-alert-styles';

    if (
      document.getElementById(
        styleId
      )
    ) {
      return;
    }

    const styleElement =
      document.createElement(
        'style'
      );

    styleElement.id =
      styleId;

    styleElement.textContent = `
      .category-delete-swal-container {
        padding: 20px !important;
        background:
          rgba(45, 31, 23, 0.58) !important;
        backdrop-filter:
          blur(5px);
      }

      .category-delete-swal-popup {
        width:
          min(
            550px,
            calc(100vw - 32px)
          ) !important;

        margin: 0 !important;
        padding:
          28px
          28px
          30px !important;

        overflow: hidden;

        color: #2a201b !important;

        background:
          radial-gradient(
            circle at 50% 0,
            rgba(255, 154, 92, 0.11),
            transparent 34%
          ),
          linear-gradient(
            145deg,
            #fffdfb 0%,
            #fff8f3 100%
          ) !important;

        border:
          1px solid
          rgba(255, 126, 51, 0.38) !important;

        border-radius:
          22px !important;

        box-shadow:
          0 30px 80px
          rgba(57, 29, 13, 0.28) !important;
      }

      .category-delete-swal-html {
        margin:
          0 !important;

        padding:
          0 !important;

        overflow:
          visible !important;
      }

      .category-delete-dialog {
        width: 100%;

        color: #2a201b;

        font-family:
          "Be Vietnam Pro",
          Arial,
          sans-serif;

        text-align: center;
      }

      .category-delete-warning {
        position: relative;

        width: 110px;
        height: 110px;

        margin:
          0
          auto
          20px;

        display: grid;
        place-items: center;
      }

      .category-delete-warning-ring {
        position: absolute;

        inset: 0;

        border:
          1px solid
          rgba(255, 112, 24, 0.18);

        border-radius: 50%;
      }

      .category-delete-warning-ring::before,
      .category-delete-warning-ring::after {
        content: "";

        position: absolute;

        border:
          1px solid
          rgba(255, 112, 24, 0.14);

        border-radius: 50%;
      }

      .category-delete-warning-ring::before {
        inset: 10px;
      }

      .category-delete-warning-ring::after {
        inset: 20px;
      }

      .category-delete-warning-dot {
        position: absolute;

        top: 50%;

        width: 7px;
        height: 7px;

        background: #ffb07d;

        border:
          2px solid #fff9f5;

        border-radius: 50%;

        transform:
          translateY(-50%);
      }

      .category-delete-warning-dot.left {
        left: 0;
      }

      .category-delete-warning-dot.right {
        right: 0;
      }

      .category-delete-warning-icon {
        position: relative;
        z-index: 2;

        width: 72px;
        height: 72px;

        display: grid;
        place-items: center;

        color: #ff5b00;

        background:
          linear-gradient(
            145deg,
            #fff8f2,
            #ffe8d8
          );

        border:
          1px solid #ffd0b1;

        border-radius: 50%;

        box-shadow:
          0 10px 28px
          rgba(255, 91, 0, 0.13);
      }

      .category-delete-warning-icon
      .material-symbols-outlined {
        font-size: 42px;
        font-variation-settings:
          "FILL" 0,
          "wght" 500,
          "GRAD" 0,
          "opsz" 48;
      }

      .category-delete-heading {
        margin:
          0
          0
          13px;

        color: #261c17;

        font-size: 27px;
        font-weight: 850;
        line-height: 1.3;
        letter-spacing: -0.35px;

        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .category-delete-heading strong {
        color: #ff5a00;

        font-weight: 900;
      }

      .category-delete-question {
        margin:
          0;

        color: #554943;

        font-size: 16px;
        line-height: 1.55;
      }

      .category-delete-question strong {
        display: inline-block;

        color: #ff5a00;

        font-weight: 850;

        text-transform: uppercase;
      }

      .category-delete-warning-text {
        margin:
          4px
          0
          0;

        color: #776a63;

        font-size: 13px;
        line-height: 1.5;
      }

      .category-delete-information {
        margin-top: 23px;

        padding:
          13px;

        display: grid;

        grid-template-columns:
          repeat(
            3,
            minmax(0, 1fr)
          );

        gap: 10px;

        background:
          rgba(255, 250, 247, 0.82);

        border:
          1px solid #ffc79f;

        border-radius: 14px;
      }

      .category-delete-information-item {
        min-width: 0;

        padding:
          10px
          11px;

        display: grid;

        grid-template-columns:
          30px
          minmax(0, 1fr);

        gap: 8px;

        align-items: center;

        text-align: left;

        background:
          rgba(255, 255, 255, 0.72);

        border-radius: 10px;
      }

      .category-delete-information-icon {
        width: 30px;
        height: 30px;

        display: grid;
        place-items: center;

        color: #ff5a00;
      }

      .category-delete-information-icon
      .material-symbols-outlined {
        font-size: 22px;
      }

      .category-delete-information-content {
        min-width: 0;
      }

      .category-delete-information-label {
        display: block;

        color: #8a7d75;

        font-size: 9px;
        font-weight: 500;
        line-height: 1.3;
      }

      .category-delete-information-value {
        margin-top: 3px;

        display: block;

        overflow: hidden;

        color: #2c211b;

        font-size: 11px;
        font-weight: 800;
        line-height: 1.35;

        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .category-delete-status {
        width: fit-content;

        max-width: 100%;

        margin-top: 4px;

        padding:
          4px
          8px;

        display: inline-flex;
        align-items: center;

        gap: 5px;

        overflow: hidden;

        border-radius: 999px;

        font-size: 9px;
        font-weight: 800;

        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .category-delete-status::before {
        content: "";

        width: 6px;
        height: 6px;

        flex-shrink: 0;

        border-radius: 50%;
      }

      .category-delete-status.active {
        color: #218c3f;

        background: #e3f6e7;
      }

      .category-delete-status.active::before {
        background: #27a947;
      }

      .category-delete-status.hidden {
        color: #c97800;

        background: #fff0d8;
      }

      .category-delete-status.hidden::before {
        background: #ef9713;
      }

      .category-delete-note {
        margin-top: 18px;

        padding:
          17px
          18px;

        display: grid;

        grid-template-columns:
          28px
          minmax(0, 1fr);

        gap: 12px;

        align-items: start;

        color: #62544d;

        background:
          linear-gradient(
            145deg,
            #fff8f2,
            #fff0e6
          );

        border:
          1px solid #ffc79f;

        border-radius: 13px;

        text-align: left;
      }

      .category-delete-note
      .material-symbols-outlined {
        color: #ff5a00;

        font-size: 24px;
      }

      .category-delete-note p {
        margin: 0;

        font-size: 11px;
        line-height: 1.6;
      }

      .category-delete-swal-actions {
        width: 100% !important;

        margin:
          22px
          0
          0 !important;

        display: grid !important;

        grid-template-columns:
          minmax(0, 0.9fr)
          minmax(0, 1.1fr);

        gap: 14px;
      }

      .category-delete-cancel-button,
      .category-delete-confirm-button {
        width: 100%;

        min-height: 52px;

        margin: 0 !important;

        padding:
          0
          20px;

        display: flex !important;
        align-items: center !important;
        justify-content: center !important;

        gap: 9px;

        border-radius: 11px;

        font-family:
          "Be Vietnam Pro",
          Arial,
          sans-serif;

        font-size: 13px;
        font-weight: 800;
        line-height: 1;

        white-space: nowrap;

        cursor: pointer;

        transition:
          transform 0.18s ease,
          box-shadow 0.18s ease,
          background-color 0.18s ease;
      }

      .category-delete-cancel-button::before,
      .category-delete-confirm-button::before {
        flex-shrink: 0;

        display: inline-block;

        line-height: 1;
      }

      .category-delete-cancel-button::before {
        content: "×";

        margin-top: -1px;

        font-family:
          Arial,
          sans-serif;

        font-size: 22px;
        font-weight: 400;
      }

      .category-delete-confirm-button::before {
        content: "delete";

        font-family:
          "Material Symbols Outlined";

        font-size: 20px;
        font-weight: 400;

        font-variation-settings:
          "FILL" 0,
          "wght" 400,
          "GRAD" 0,
          "opsz" 24;
      }

      .category-delete-cancel-button {
        color: #5a514c;

        background: #ffffff;

        border:
          1px solid #ccd4dd;
      }

      .category-delete-cancel-button:hover {
        color: #ff5a00;

        background: #fffaf6;

        border-color: #ffbc91;
      }

      .category-delete-confirm-button {
        color: #ffffff;

        background:
          linear-gradient(
            135deg,
            #ff6f00,
            #ff3d16
          );

        border: 0;

        box-shadow:
          0 12px 28px
          rgba(255, 75, 20, 0.26);
      }

      .category-delete-confirm-button:hover {
        transform:
          translateY(-1px);

        box-shadow:
          0 15px 32px
          rgba(255, 75, 20, 0.34);
      }

      .category-delete-cancel-button:focus-visible,
      .category-delete-confirm-button:focus-visible {
        outline:
          3px solid
          rgba(255, 105, 43, 0.22);

        outline-offset: 2px;
      }

      .category-delete-swal-popup.swal2-show {
        animation:
          categoryDeleteAlertOpen
          240ms
          cubic-bezier(
            0.16,
            1,
            0.3,
            1
          )
          both;
      }

      .category-delete-swal-popup.swal2-hide {
        animation:
          categoryDeleteAlertClose
          180ms
          ease-in
          both;
      }

      @keyframes categoryDeleteAlertOpen {
        from {
          opacity: 0;

          transform:
            translateY(18px)
            scale(0.97);
        }

        to {
          opacity: 1;

          transform:
            translateY(0)
            scale(1);
        }
      }

      @keyframes categoryDeleteAlertClose {
        from {
          opacity: 1;

          transform:
            translateY(0)
            scale(1);
        }

        to {
          opacity: 0;

          transform:
            translateY(12px)
            scale(0.98);
        }
      }

      @media (max-width: 620px) {
        .category-delete-swal-container {
          padding: 12px !important;
        }

        .category-delete-swal-popup {
          padding:
            22px
            16px
            20px !important;

          border-radius:
            18px !important;
        }

        .category-delete-warning {
          width: 92px;
          height: 92px;

          margin-bottom: 16px;
        }

        .category-delete-warning-icon {
          width: 62px;
          height: 62px;
        }

        .category-delete-warning-icon
        .material-symbols-outlined {
          font-size: 36px;
        }

        .category-delete-heading {
          font-size: 22px;
        }

        .category-delete-question {
          font-size: 14px;
        }

        .category-delete-information {
          grid-template-columns: 1fr;

          gap: 8px;
        }

        .category-delete-information-item {
          grid-template-columns:
            34px
            minmax(0, 1fr);
        }

        .category-delete-swal-actions {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.appendChild(
      styleElement
    );
  }

  // ==================================================
  // THAY ĐỔI DESIGN DELETE ALERT:
  // MÃ HÓA DỮ LIỆU TRƯỚC KHI ĐƯA VÀO HTML SWEETALERT
  //
  // Chỉ phục vụ hiển thị, không thay đổi dữ liệu Category.
  // ==================================================

  private escapeDeleteAlertHtml(
    value:
      string
  ): string {

    return (
      value ?? ''
    )
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&#039;'
      );
  }

  deleteCategory(
    category:
      CategoryItem,

    event?:
      MouseEvent
  ): void {

    event?.stopPropagation();

    // ==================================================
    // THÊM MỚI DELETE API:
    // KHÔNG CHO GỬI NHIỀU YÊU CẦU XÓA CÙNG LÚC
    // ==================================================

    if (
      this.deletingCategoryId ||
      this.isLoading
    ) {
      return;
    }

    // ==================================================
    // THÊM MỚI DELETE API:
    // KIỂM TRA NHANH SỐ MÓN Ở FRONTEND
    //
    // Backend vẫn kiểm tra lại bằng dữ liệu thật
    // trước khi xóa Category.
    // ==================================================

    if (
      category.productCount > 0
    ) {
      Swal.fire({
        icon:
          'warning',

        title:
          'Không thể xóa loại món',

        text:
          `Loại món ${category.id} đang có ${category.productCount} món. Vui lòng chuyển hoặc xóa các món liên quan trước.`,

        confirmButtonText:
          'Đã hiểu',

        confirmButtonColor:
          '#ff6b35'
      });

      return;
    }

    // ==================================================
    // THAY ĐỔI DESIGN DELETE ALERT:
    // NẠP STYLE VÀ CHUẨN BỊ DỮ LIỆU HIỂN THỊ
    //
    // Logic xác nhận và gọi API bên dưới được giữ nguyên.
    // ==================================================

    this.ensureDeleteCategoryAlertStyles();

    const categoryId =
      this.escapeDeleteAlertHtml(
        category.id
      );

    const categoryName =
      this.escapeDeleteAlertHtml(
        category.name
      );

    const categoryNameUppercase =
      this.escapeDeleteAlertHtml(
        category.name
          .toLocaleUpperCase(
            'vi-VN'
          )
      );

    const categoryStatusLabel =
      this.escapeDeleteAlertHtml(
        this.getStatusLabel(
          category.status
        )
      );

    const categoryStatusClass =
      category.status === 1
        ? 'active'
        : 'hidden';

    // ==================================================
    // THAY ĐỔI DESIGN DELETE ALERT:
    // FORM XÁC NHẬN XÓA THEO CONCEPT DINEMATE
    // ==================================================

    Swal.fire({
      html:
        `
          <div class="category-delete-dialog">

            <div class="category-delete-warning">

              <span class="category-delete-warning-ring"></span>

              <span
                class="
                  category-delete-warning-dot
                  left
                "
              ></span>

              <span
                class="
                  category-delete-warning-dot
                  right
                "
              ></span>

              <span class="category-delete-warning-icon">
                <span class="material-symbols-outlined">
                  warning
                </span>
              </span>

            </div>

            <h2 class="category-delete-heading">
              Xóa loại món
              <strong>${categoryId}</strong>?
            </h2>

            <p class="category-delete-question">
              Bạn có chắc chắn muốn xóa
              <strong>${categoryNameUppercase}</strong>?
            </p>

            <p class="category-delete-warning-text">
              Thao tác này không thể hoàn tác.
            </p>

            <div class="category-delete-information">

              <div class="category-delete-information-item">

                <span class="category-delete-information-icon">
                  <span class="material-symbols-outlined">
                    sell
                  </span>
                </span>

                <span class="category-delete-information-content">
                  <span class="category-delete-information-label">
                    Mã loại
                  </span>

                  <strong class="category-delete-information-value">
                    ${categoryId}
                  </strong>
                </span>

              </div>

              <div class="category-delete-information-item">

                <span class="category-delete-information-icon">
                  <span class="material-symbols-outlined">
                    description
                  </span>
                </span>

                <span class="category-delete-information-content">
                  <span class="category-delete-information-label">
                    Tên loại
                  </span>

                  <strong
                    class="category-delete-information-value"
                    title="${categoryName}"
                  >
                    ${categoryName}
                  </strong>
                </span>

              </div>

              <div class="category-delete-information-item">

                <span class="category-delete-information-icon">
                  <span class="material-symbols-outlined">
                    radio_button_checked
                  </span>
                </span>

                <span class="category-delete-information-content">
                  <span class="category-delete-information-label">
                    Trạng thái
                  </span>

                  <span
                    class="
                      category-delete-status
                      ${categoryStatusClass}
                    "
                  >
                    ${categoryStatusLabel}
                  </span>
                </span>

              </div>

            </div>

            <div class="category-delete-note">

              <span class="material-symbols-outlined">
                info
              </span>

              <p>
                Khi xóa, dữ liệu của loại món sẽ được loại khỏi hệ thống.
                Lịch sử thao tác xóa vẫn được lưu để phục vụ việc kiểm tra
                sau này.
              </p>

            </div>

          </div>
        `,

      showCancelButton:
        true,

      // ==================================================
      // THAY ĐỔI DESIGN DELETE ALERT:
      // DÙNG TEXT THUẦN ĐỂ CHỮ TRONG BUTTON KHÔNG BỊ LỆCH.
      //
      // Icon được tạo bằng CSS ::before.
      // ==================================================

      confirmButtonText:
        'Xóa loại món',

      cancelButtonText:
        'Hủy',

      buttonsStyling:
        false,

      reverseButtons:
        true,

      focusCancel:
        true,

      customClass: {
        container:
          'category-delete-swal-container',

        popup:
          'category-delete-swal-popup',

        htmlContainer:
          'category-delete-swal-html',

        actions:
          'category-delete-swal-actions',

        confirmButton:
          'category-delete-confirm-button',

        cancelButton:
          'category-delete-cancel-button'
      }
    })
      .then(result => {

        if (
          !result.isConfirmed
        ) {
          return;
        }

        this.executeDeleteCategory(
          category
        );
      });
  }

  // ==================================================
  // THÊM MỚI DELETE API:
  // GỌI API DELETE CATEGORY THẬT
  //
  // DELETE:
  // /api/categories/{categoryId}
  // ==================================================

  private executeDeleteCategory(
    category:
      CategoryItem
  ): void {

    this.deletingCategoryId =
      category.id;

    this.categoryService
      .deleteCategory(
        category.id
      )
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({
        next: response => {

          this.deletingCategoryId =
            null;

          if (
            !response.success
          ) {
            this.showDeleteCategoryError(
              response.message ||
              'Không thể xóa loại món.'
            );

            return;
          }

          if (
            !response.data
          ) {
            this.showDeleteCategoryError(
              'API thông báo thành công nhưng không trả về dữ liệu loại món vừa xóa.'
            );

            return;
          }

          // ==================================================
          // THÊM MỚI DELETE API:
          // NẾU XÓA DÒNG CUỐI CÙNG CỦA TRANG HIỆN TẠI
          // THÌ QUAY VỀ TRANG TRƯỚC
          // ==================================================

          if (
            this.categories.length === 1 &&
            this.currentPage > 1
          ) {
            this.currentPage =
              this.currentPage - 1;
          }

          // ==================================================
          // THÊM MỚI DELETE API:
          // XÓA CATEGORY ĐANG CHỌN KHỎI STATE CŨ
          // ==================================================

          if (
            this.selectedCategory?.id ===
            response.data.id
          ) {
            this.selectedCategory =
              null;
          }

          // ==================================================
          // THÊM MỚI DELETE API:
          // ALERT THÀNH CÔNG GIỐNG CREATE VÀ UPDATE
          // ==================================================

          Swal.fire({
            toast:
              true,

            position:
              'top-end',

            icon:
              'success',

            title:
              `Xóa loại món ${response.data.id} thành công.`,

            showConfirmButton:
              false,

            timer:
              1800,

            timerProgressBar:
              true,

            customClass: {
              container:
                'restaurant-toast-container',

              popup:
                'restaurant-toast-popup',

              title:
                'restaurant-toast-title',

              timerProgressBar:
                'restaurant-toast-progress'
            }
          });

          // ==================================================
          // THÊM MỚI DELETE API:
          // LOAD LẠI TOÀN BỘ DỮ LIỆU THẬT
          //
          // Bao gồm:
          // - Danh sách Category.
          // - Thống kê.
          // - Category được chọn.
          // - Lịch sử DELETE.
          // ==================================================

          this.loadCategoryManagementData(
            null
          );
        },

        error: error => {

          this.deletingCategoryId =
            null;

          console.error(
            'Lỗi xóa loại món:',
            error
          );

          this.showDeleteCategoryError(
            this.getDeleteCategoryErrorMessage(
              error
            )
          );
        }
      });
  }

  // ==================================================
  // THÊM MỚI DELETE API:
  // HIỂN THỊ ALERT KHI XÓA THẤT BẠI
  // ==================================================

  private showDeleteCategoryError(
    message:
      string
  ): void {

    Swal.fire({
      icon:
        'error',

      title:
        'Không thể xóa loại món',

      text:
        message,

      confirmButtonText:
        'Đã hiểu',

      confirmButtonColor:
        '#ff6b35'
    });
  }

  // ==================================================
  // THÊM MỚI DELETE API:
  // LẤY THÔNG BÁO LỖI DELETE TỪ BACKEND
  // ==================================================

  private getDeleteCategoryErrorMessage(
    error:
      any
  ): string {

    /*
     * Backend Delete Category trả:
     *
     * {
     *   success: false,
     *   message: "..."
     * }
     */
    if (
      typeof error?.error?.message ===
      'string'
    ) {
      return error
        .error
        .message;
    }

    if (
      typeof error?.error?.title ===
      'string'
    ) {
      return error
        .error
        .title;
    }

    switch (
      error?.status
    ) {
      case 0:

        return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra API hoặc chứng chỉ HTTPS.';

      case 400:

        return 'Không thể xóa loại món vì dữ liệu không hợp lệ hoặc đang có dữ liệu liên quan.';

      case 401:

        return 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.';

      case 403:

        return 'Bạn không có quyền xóa loại món.';

      case 404:

        return 'Không tìm thấy loại món hoặc API xóa loại món.';

      case 409:

        return 'Không thể xóa loại món vì đang có dữ liệu liên quan trong hệ thống.';

      case 500:

        return 'Máy chủ xảy ra lỗi khi xóa loại món.';

      default:

        return 'Đã xảy ra lỗi khi xóa loại món. Vui lòng thử lại.';
    }
  }

  // ==================================================
  // THÊM MỚI DELETE CATEGORY HISTORY:
  // NẠP CSS CHO ALERT XÓA LỊCH SỬ
  //
  // CSS chỉ được thêm một lần vào <head>.
  // Không thay đổi CSS hoặc logic của các chức năng khác.
  // ==================================================

  private ensureDeleteCategoryHistoryAlertStyles():
    void {

    if (
      typeof document ===
      'undefined'
    ) {
      return;
    }

    const styleId =
      'category-history-delete-alert-styles';

    if (
      document.getElementById(
        styleId
      )
    ) {
      return;
    }

    const styleElement =
      document.createElement(
        'style'
      );

    styleElement.id =
      styleId;

    styleElement.textContent = `
      .category-history-delete-container {
        padding: 20px !important;

        background:
          rgba(
            48,
            33,
            24,
            0.58
          ) !important;

        backdrop-filter:
          blur(5px);
      }

      .category-history-delete-popup {
        width:
          min(
            560px,
            calc(100vw - 32px)
          ) !important;

        margin: 0 !important;

        padding:
          27px
          30px
          30px !important;

        overflow: hidden;

        color: #2a201b !important;

        background:
          radial-gradient(
            circle at 50% 0,
            rgba(
              255,
              151,
              89,
              0.11
            ),
            transparent 35%
          ),
          linear-gradient(
            145deg,
            #fffdfb 0%,
            #fff8f3 100%
          ) !important;

        border:
          1px solid
          rgba(
            255,
            126,
            51,
            0.38
          ) !important;

        border-radius:
          22px !important;

        box-shadow:
          0 30px 80px
          rgba(
            57,
            29,
            13,
            0.28
          ) !important;
      }

      .category-history-delete-html {
        margin:
          0 !important;

        padding:
          0 !important;

        overflow:
          visible !important;
      }

      .category-history-delete-dialog {
        width: 100%;

        color: #2a201b;

        font-family:
          "Be Vietnam Pro",
          Arial,
          sans-serif;

        text-align: center;
      }

      .category-history-delete-warning {
        position: relative;

        width: 104px;
        height: 104px;

        margin:
          0
          auto
          19px;

        display: grid;
        place-items: center;
      }

      .category-history-delete-warning-ring {
        position: absolute;

        inset: 0;

        border:
          1px solid
          rgba(
            255,
            112,
            24,
            0.18
          );

        border-radius: 50%;
      }

      .category-history-delete-warning-ring::before,
      .category-history-delete-warning-ring::after {
        content: "";

        position: absolute;

        border:
          1px solid
          rgba(
            255,
            112,
            24,
            0.14
          );

        border-radius: 50%;
      }

      .category-history-delete-warning-ring::before {
        inset: 10px;
      }

      .category-history-delete-warning-ring::after {
        inset: 20px;
      }

      .category-history-delete-warning-dot {
        position: absolute;

        top: 50%;

        width: 7px;
        height: 7px;

        background: #ffae79;

        border:
          2px solid #fff9f5;

        border-radius: 50%;

        transform:
          translateY(-50%);
      }

      .category-history-delete-warning-dot.left {
        left: 0;
      }

      .category-history-delete-warning-dot.right {
        right: 0;
      }

      .category-history-delete-warning-icon {
        position: relative;
        z-index: 2;

        width: 70px;
        height: 70px;

        display: grid;
        place-items: center;

        color: #ff5b00;

        background:
          linear-gradient(
            145deg,
            #fff8f2,
            #ffe8d8
          );

        border:
          1px solid #ffd0b1;

        border-radius: 50%;

        box-shadow:
          0 10px 28px
          rgba(
            255,
            91,
            0,
            0.13
          );
      }

      .category-history-delete-warning-icon
      .material-symbols-outlined {
        font-size: 41px;

        font-variation-settings:
          "FILL" 0,
          "wght" 500,
          "GRAD" 0,
          "opsz" 48;
      }

      .category-history-delete-heading {
        margin:
          0
          0
          12px;

        color: #261c17;

        font-size: 29px;
        font-weight: 850;
        line-height: 1.3;
        letter-spacing: -0.45px;
      }

      .category-history-delete-heading strong {
        color: #ff5a00;

        font-weight: 900;
      }

      .category-history-delete-question {
        margin: 0;

        color: #554943;

        font-size: 15px;
        line-height: 1.55;
      }

      .category-history-delete-warning-text {
        margin:
          4px
          0
          0;

        color: #776a63;

        font-size: 13px;
        line-height: 1.5;
      }

      .category-history-delete-information {
        margin-top: 23px;

        padding:
          8px
          18px;

        overflow: hidden;

        background:
          rgba(
            255,
            251,
            248,
            0.82
          );

        border:
          1px solid #ffc49a;

        border-radius: 14px;

        text-align: left;
      }

      .category-history-delete-row {
        min-height: 54px;

        display: grid;

        grid-template-columns:
          30px
          112px
          minmax(
            0,
            1fr
          );

        gap: 11px;

        align-items: center;
      }

      .category-history-delete-row +
      .category-history-delete-row {
        border-top:
          1px solid #eadbd1;
      }

      .category-history-delete-row-icon {
        width: 30px;
        height: 30px;

        display: grid;
        place-items: center;

        color: #ff5a00;
      }

      .category-history-delete-row-icon
      .material-symbols-outlined {
        font-size: 21px;
      }

      .category-history-delete-row-label {
        color: #81736b;

        font-size: 12px;
        font-weight: 500;
      }

      .category-history-delete-row-value {
        min-width: 0;

        color: #332720;

        font-size: 12px;
        font-weight: 700;
        line-height: 1.5;

        overflow-wrap: anywhere;
      }

      .category-history-delete-note {
        margin-top: 17px;

        padding:
          14px
          17px;

        display: grid;

        grid-template-columns:
          27px
          minmax(
            0,
            1fr
          );

        gap: 11px;

        align-items: center;

        color: #62544d;

        background:
          linear-gradient(
            145deg,
            #fff8f2,
            #fff0e6
          );

        border:
          1px solid #ffc49a;

        border-radius: 13px;

        text-align: left;
      }

      .category-history-delete-note
      .material-symbols-outlined {
        color: #ff5a00;

        font-size: 22px;
      }

      .category-history-delete-note p {
        margin: 0;

        font-size: 11px;
        line-height: 1.55;
      }

      .category-history-delete-actions {
        width: 100% !important;

        margin:
          21px
          0
          0 !important;

        display: grid !important;

        grid-template-columns:
          minmax(
            0,
            1fr
          )
          minmax(
            0,
            1fr
          );

        gap: 13px;
      }

      .category-history-delete-confirm,
      .category-history-delete-cancel {
        width: 100%;

        min-height: 48px;

        margin:
          0 !important;

        padding:
          0
          18px;

        display:
          flex !important;

        align-items:
          center !important;

        justify-content:
          center !important;

        gap: 9px;

        border-radius: 10px;

        font-family:
          "Be Vietnam Pro",
          Arial,
          sans-serif;

        font-size: 12px;
        font-weight: 800;
        line-height: 1;

        white-space: nowrap;

        cursor: pointer;

        transition:
          transform 0.18s ease,
          box-shadow 0.18s ease,
          background-color 0.18s ease;
      }

      .category-history-delete-confirm::before,
      .category-history-delete-cancel::before {
        flex-shrink: 0;

        display: inline-block;

        line-height: 1;
      }

      .category-history-delete-confirm::before {
        content: "delete";

        font-family:
          "Material Symbols Outlined";

        font-size: 19px;
        font-weight: 400;

        font-variation-settings:
          "FILL" 0,
          "wght" 400,
          "GRAD" 0,
          "opsz" 24;
      }

      .category-history-delete-cancel::before {
        content: "×";

        margin-top: -1px;

        font-family:
          Arial,
          sans-serif;

        font-size: 21px;
        font-weight: 400;
      }

      .category-history-delete-confirm {
        color: #ffffff;

        background:
          linear-gradient(
            135deg,
            #ff6f00,
            #ff3d16
          );

        border: 0;

        box-shadow:
          0 12px 27px
          rgba(
            255,
            75,
            20,
            0.25
          );
      }

      .category-history-delete-confirm:hover {
        transform:
          translateY(-1px);

        box-shadow:
          0 15px 31px
          rgba(
            255,
            75,
            20,
            0.33
          );
      }

      .category-history-delete-cancel {
        color: #69615c;

        background: #ffffff;

        border:
          1px solid #ccd4dd;
      }

      .category-history-delete-cancel:hover {
        color: #ff5a00;

        background: #fffaf6;

        border-color: #ffbc91;
      }

      .category-history-delete-confirm:focus-visible,
      .category-history-delete-cancel:focus-visible {
        outline:
          3px solid
          rgba(
            255,
            105,
            43,
            0.22
          );

        outline-offset: 2px;
      }

      .category-history-delete-popup.swal2-show {
        animation:
          categoryHistoryDeleteOpen
          240ms
          cubic-bezier(
            0.16,
            1,
            0.3,
            1
          )
          both;
      }

      .category-history-delete-popup.swal2-hide {
        animation:
          categoryHistoryDeleteClose
          180ms
          ease-in
          both;
      }

      @keyframes categoryHistoryDeleteOpen {
        from {
          opacity: 0;

          transform:
            translateY(18px)
            scale(0.97);
        }

        to {
          opacity: 1;

          transform:
            translateY(0)
            scale(1);
        }
      }

      @keyframes categoryHistoryDeleteClose {
        from {
          opacity: 1;

          transform:
            translateY(0)
            scale(1);
        }

        to {
          opacity: 0;

          transform:
            translateY(12px)
            scale(0.98);
        }
      }

      @media (max-width: 620px) {
        .category-history-delete-container {
          padding:
            12px !important;
        }

        .category-history-delete-popup {
          padding:
            22px
            16px
            20px !important;

          border-radius:
            18px !important;
        }

        .category-history-delete-warning {
          width: 90px;
          height: 90px;

          margin-bottom: 15px;
        }

        .category-history-delete-warning-icon {
          width: 61px;
          height: 61px;
        }

        .category-history-delete-warning-icon
        .material-symbols-outlined {
          font-size: 35px;
        }

        .category-history-delete-heading {
          font-size: 23px;
        }

        .category-history-delete-question {
          font-size: 14px;
        }

        .category-history-delete-information {
          padding:
            8px
            13px;
        }

        .category-history-delete-row {
          grid-template-columns:
            28px
            93px
            minmax(
              0,
              1fr
            );

          gap: 8px;
        }

        .category-history-delete-row-label,
        .category-history-delete-row-value {
          font-size: 10px;
        }

        .category-history-delete-actions {
          grid-template-columns:
            1fr;
        }
      }
    `;

    document.head.appendChild(
      styleElement
    );
  }

  // ==================================================
  // THÊM MỚI DELETE CATEGORY HISTORY:
  // ĐỊNH DẠNG THỜI GIAN CHO ALERT
  //
  // Kết quả:
  // HH:mm:ss dd/MM/yyyy
  // ==================================================

  private formatCategoryHistoryDateTime(
    value:
      string
  ): string {

    const date =
      new Date(
        value
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return (
        value ||
        'Không xác định'
      );
    }

    const pad =
      (
        number:
          number
      ): string =>
        String(
          number
        )
          .padStart(
            2,
            '0'
          );

    return (
      `${pad(date.getHours())}:` +
      `${pad(date.getMinutes())}:` +
      `${pad(date.getSeconds())} ` +
      `${pad(date.getDate())}/` +
      `${pad(date.getMonth() + 1)}/` +
      `${date.getFullYear()}`
    );
  }

  // ==================================================
  // THÊM MỚI DELETE CATEGORY HISTORY:
  // LẤY MÃ CATEGORY TỪ HISTORY
  //
  // Với lịch sử DELETE CATEGORY, CategoryId có thể null.
  // Khi đó thử đọc Id từ OldData hoặc NewData.
  // ==================================================

  private getCategoryIdFromHistory(
    history:
      CategoryHistoryViewModel
  ): string {

    if (
      history.categoryId?.trim()
    ) {
      return history
        .categoryId
        .trim()
        .toUpperCase();
    }

    const serializedDataList = [
      history.newData,
      history.oldData
    ];

    for (
      const serializedData
      of serializedDataList
    ) {
      if (
        !serializedData?.trim()
      ) {
        continue;
      }

      try {
        const parsedData =
          JSON.parse(
            serializedData
          );

        const categoryId =
          parsedData?.id ??
          parsedData?.categoryId ??
          null;

        if (
          typeof categoryId ===
            'string' &&
          categoryId.trim()
        ) {
          return categoryId
            .trim()
            .toUpperCase();
        }
      }
      catch {
        /*
         * OldData/NewData không phải JSON hợp lệ
         * thì bỏ qua và tiếp tục dữ liệu kế tiếp.
         */
      }
    }

    return 'Không xác định';
  }

  // ==================================================
  // THÊM MỚI DELETE CATEGORY HISTORY:
  // MỞ ALERT XÁC NHẬN XÓA LỊCH SỬ
  // ==================================================

  deleteHistory(
    history:
      CategoryHistoryViewModel,

    event?:
      MouseEvent
  ): void {

    event?.stopPropagation();

    if (
      this.deletingCategoryHistoryId !==
        null ||
      this.isLoading
    ) {
      return;
    }

    this.ensureDeleteCategoryHistoryAlertStyles();

    const historyTime =
      this.escapeDeleteAlertHtml(
        this.formatCategoryHistoryDateTime(
          history.createdAt
        )
      );

    const historyUser =
      this.escapeDeleteAlertHtml(
        history.userName ||
        'Không xác định'
      );

    const historyDescription =
      this.escapeDeleteAlertHtml(
        history.description ||
        'Không có nội dung'
      );

    const categoryId =
      this.escapeDeleteAlertHtml(
        this.getCategoryIdFromHistory(
          history
        )
      );

    Swal.fire({
      html:
        `
          <div class="category-history-delete-dialog">

            <div class="category-history-delete-warning">

              <span class="category-history-delete-warning-ring"></span>

              <span
                class="
                  category-history-delete-warning-dot
                  left
                "
              ></span>

              <span
                class="
                  category-history-delete-warning-dot
                  right
                "
              ></span>

              <span class="category-history-delete-warning-icon">
                <span class="material-symbols-outlined">
                  warning
                </span>
              </span>

            </div>

            <h2 class="category-history-delete-heading">
              Xóa
              <strong>lịch sử</strong>
              hoạt động?
            </h2>

            <p class="category-history-delete-question">
              Bạn có chắc chắn muốn xóa lịch sử này?
            </p>

            <p class="category-history-delete-warning-text">
              Thao tác này không thể hoàn tác.
            </p>

            <div class="category-history-delete-information">

              <div class="category-history-delete-row">

                <span class="category-history-delete-row-icon">
                  <span class="material-symbols-outlined">
                    calendar_month
                  </span>
                </span>

                <span class="category-history-delete-row-label">
                  Thời gian:
                </span>

                <strong class="category-history-delete-row-value">
                  ${historyTime}
                </strong>

              </div>

              <div class="category-history-delete-row">

                <span class="category-history-delete-row-icon">
                  <span class="material-symbols-outlined">
                    person
                  </span>
                </span>

                <span class="category-history-delete-row-label">
                  Người thực hiện:
                </span>

                <strong class="category-history-delete-row-value">
                  ${historyUser}
                </strong>

              </div>

              <div class="category-history-delete-row">

                <span class="category-history-delete-row-icon">
                  <span class="material-symbols-outlined">
                    description
                  </span>
                </span>

                <span class="category-history-delete-row-label">
                  Nội dung:
                </span>

                <strong class="category-history-delete-row-value">
                  ${historyDescription}
                </strong>

              </div>

              <div class="category-history-delete-row">

                <span class="category-history-delete-row-icon">
                  <span class="material-symbols-outlined">
                    info
                  </span>
                </span>

                <span class="category-history-delete-row-label">
                  Chi tiết:
                </span>

                <strong class="category-history-delete-row-value">
                  Mã loại: ${categoryId}
                </strong>

              </div>

            </div>

            <div class="category-history-delete-note">

              <span class="material-symbols-outlined">
                info
              </span>

              <p>
                Khi xóa, bản ghi lịch sử sẽ bị loại khỏi hệ thống
                và không thể khôi phục.
              </p>

            </div>

          </div>
        `,

      showCancelButton:
        true,

      confirmButtonText:
        'Xóa lịch sử',

      cancelButtonText:
        'Hủy',

      buttonsStyling:
        false,

      /*
       * Giữ nút Xóa bên trái và nút Hủy bên phải
       * giống đúng UI tham chiếu.
       */
      reverseButtons:
        false,

      focusCancel:
        true,

      customClass: {
        container:
          'category-history-delete-container',

        popup:
          'category-history-delete-popup',

        htmlContainer:
          'category-history-delete-html',

        actions:
          'category-history-delete-actions',

        confirmButton:
          'category-history-delete-confirm',

        cancelButton:
          'category-history-delete-cancel'
      }
    })
      .then(result => {

        if (
          !result.isConfirmed
        ) {
          return;
        }

        this.executeDeleteCategoryHistory(
          history
        );
      });
  }

  // ==================================================
  // THÊM MỚI DELETE CATEGORY HISTORY:
  // GỌI API DELETE CATEGORY HISTORY THẬT
  //
  // DELETE:
  // /api/categories/histories/{historyId}
  // ==================================================

  private executeDeleteCategoryHistory(
    history:
      CategoryHistoryViewModel
  ): void {

    this.deletingCategoryHistoryId =
      history.id;

    /*
     * Phương thức này phải có trong:
     * admin-category-management.service.ts
     *
     * deleteCategoryHistory(historyId)
     */
    this.categoryService
      .deleteCategoryHistory(
        history.id
      )
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({
        next: response => {

          this.deletingCategoryHistoryId =
            null;

          if (
            !response.success
          ) {
            this.showDeleteCategoryHistoryError(
              response.message ||
              'Không thể xóa lịch sử hoạt động.'
            );

            return;
          }

          // ==================================================
          // THÊM MỚI DELETE CATEGORY HISTORY:
          // TOAST THÀNH CÔNG GIỐNG CREATE, UPDATE VÀ DELETE
          // ==================================================

          Swal.fire({
            toast:
              true,

            position:
              'top-end',

            icon:
              'success',

            title:
              'Xóa lịch sử hoạt động thành công.',

            showConfirmButton:
              false,

            timer:
              1800,

            timerProgressBar:
              true,

            customClass: {
              container:
                'restaurant-toast-container',

              popup:
                'restaurant-toast-popup',

              title:
                'restaurant-toast-title',

              timerProgressBar:
                'restaurant-toast-progress'
            }
          });

          // ==================================================
          // THÊM MỚI DELETE CATEGORY HISTORY:
          // LOAD LẠI DỮ LIỆU NHƯNG GIỮ CATEGORY ĐANG CHỌN
          // ==================================================

          this.loadCategoryManagementData(
            this.selectedCategory?.id ??
            null
          );
        },

        error: error => {

          this.deletingCategoryHistoryId =
            null;

          console.error(
            'Lỗi xóa lịch sử loại món:',
            error
          );

          this.showDeleteCategoryHistoryError(
            this.getDeleteCategoryHistoryErrorMessage(
              error
            )
          );
        }
      });
  }

  // ==================================================
  // THÊM MỚI DELETE CATEGORY HISTORY:
  // ALERT LỖI
  // ==================================================

  private showDeleteCategoryHistoryError(
    message:
      string
  ): void {

    Swal.fire({
      icon:
        'error',

      title:
        'Không thể xóa lịch sử',

      text:
        message,

      confirmButtonText:
        'Đã hiểu',

      confirmButtonColor:
        '#ff6b35'
    });
  }

  // ==================================================
  // THÊM MỚI DELETE CATEGORY HISTORY:
  // ĐỌC THÔNG BÁO LỖI TỪ BACKEND
  // ==================================================

  private getDeleteCategoryHistoryErrorMessage(
    error:
      any
  ): string {

    if (
      typeof error?.error?.message ===
      'string'
    ) {
      return error
        .error
        .message;
    }

    if (
      typeof error?.error?.title ===
      'string'
    ) {
      return error
        .error
        .title;
    }

    switch (
      error?.status
    ) {
      case 0:

        return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra API hoặc chứng chỉ HTTPS.';

      case 400:

        return 'Dữ liệu xóa lịch sử hoạt động không hợp lệ.';

      case 401:

        return 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.';

      case 403:

        return 'Bạn không có quyền xóa lịch sử hoạt động.';

      case 404:

        return 'Không tìm thấy lịch sử hoặc API xóa lịch sử hoạt động.';

      case 500:

        return 'Máy chủ xảy ra lỗi khi xóa lịch sử hoạt động.';

      default:

        return 'Đã xảy ra lỗi khi xóa lịch sử hoạt động. Vui lòng thử lại.';
    }
  }

  viewAllHistory(): void {

    console.log(
      'Xem tất cả lịch sử loại món'
    );
  }

  // ==================================================
  // MAP LỊCH SỬ
  // ==================================================

  private mapHistoryToViewModel(
    history:
      CategoryHistory
  ): CategoryHistoryViewModel {

    return {
      ...history,

      roleName:
        'Quản trị viên',

      cssClass:
        this.getHistoryCssClass(
          history.actionType
        )
    };
  }

  private getHistoryCssClass(
    actionType:
      string
  ):
    | 'create'
    | 'update'
    | 'delete'
    | 'status' {

    const normalizedActionType =
      actionType
        ?.trim()
        .toUpperCase();

    switch (
      normalizedActionType
    ) {
      case 'CREATE':
      case 'CREATED':
      case 'ADD':
      case 'INSERT':

        return 'create';

      case 'DELETE':
      case 'DELETED':
      case 'REMOVE':

        return 'delete';

      case 'STATUS':
      case 'STATUS_CHANGE':
      case 'CHANGE_STATUS':
      case 'UPDATE_STATUS':
      case 'HIDE':
      case 'SHOW':

        return 'status';

      default:

        return 'update';
    }
  }

  // ==================================================
  // THÔNG BÁO LỖI API
  // ==================================================

  private getApiErrorMessage(
    error:
      any
  ): string {

    if (
      typeof error?.error?.message ===
      'string'
    ) {
      return error.error.message;
    }

    if (
      typeof error?.error?.title ===
      'string'
    ) {
      return error.error.title;
    }

    switch (
      error?.status
    ) {
      case 0:

        return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra API hoặc chứng chỉ HTTPS.';

      case 400:

        return 'Dữ liệu truy vấn không hợp lệ.';

      case 401:

        return 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.';

      case 403:

        return 'Bạn không có quyền truy cập chức năng quản lý loại món.';

      case 404:

        return 'Không tìm thấy API quản lý loại món.';

      case 500:

        return 'Máy chủ xảy ra lỗi khi xử lý dữ liệu loại món.';

      default:

        return 'Đã xảy ra lỗi khi tải dữ liệu loại món. Vui lòng thử lại.';
    }
  }

  // ==================================================
  // TRACK BY
  // ==================================================

  trackByCategoryId(
    index:
      number,

    category:
      CategoryItem
  ): string {

    return category.id;
  }

  trackByHistoryId(
    index:
      number,

    history:
      CategoryHistoryViewModel
  ): number {

    return history.id;
  }

  trackByPageNumber(
    index:
      number,

    page:
      number
  ): number {

    return page;
  }
}