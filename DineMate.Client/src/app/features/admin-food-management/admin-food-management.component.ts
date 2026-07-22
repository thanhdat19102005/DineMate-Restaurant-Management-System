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

// ==================================================
// TRẠNG THÁI PRODUCT
//
// 0 = Hết hàng
// 1 = Còn hàng
// ==================================================

export type ProductStatus =
  0 | 1;

// ==================================================
// DỮ LIỆU PRODUCT HIỂN THỊ TRÊN FRONTEND
//
// Các trường chính bám theo ProductModel backend.
// categoryName là dữ liệu lấy từ navigation Category.
// ==================================================

export interface ProductItem {
  id: string;

  name: string;

  description: string;

  price: number;

  imageUrl?: string | null;

  categoryId: string;

  categoryName: string;

  unit: string;

  status: ProductStatus;

  isFeatured: boolean;

  isBestSeller: boolean;

  createdAt: string;

  updatedAt?: string | null;
}

// ==================================================
// LỊCH SỬ HOẠT ĐỘNG PRODUCT
// ==================================================

export interface ProductHistoryItem {
  id: number;

  productId: string;

  userName: string;

  roleName: string;

  actionType:
    | 'CREATE'
    | 'UPDATE'
    | 'STATUS_CHANGE'
    | 'DELETE';

  description: string;

  createdAt: string;
}

// ==================================================
// CARD THỐNG KÊ
// ==================================================

interface ProductStatisticCard {
  label: string;

  value: number;

  percentage: number;

  icon: string;

  cssClass:
    | 'total'
    | 'selling'
    | 'out-of-stock'
    | 'featured';
}

// ==================================================
// OPTION TRẠNG THÁI
// ==================================================

interface ProductStatusOption {
  value:
    ProductStatus |
    null;

  label: string;
}

@Component({
  selector:
    'app-admin-food-management',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './admin-food-management.component.html',

  styleUrl:
    './admin-food-management.component.css'
})
export class AdminFoodManagementComponent
  implements OnInit, OnDestroy {

  // ==================================================
  // TÌM KIẾM VÀ LỌC
  // ==================================================

  searchKeyword = '';

  selectedStatus:
    ProductStatus |
    null = null;

  readonly statusOptions:
    ProductStatusOption[] = [
      {
        value: null,
        label: 'Tất cả trạng thái'
      },
      {
        value: 1,
        label: 'Còn hàng'
      },
      {
        value: 0,
        label: 'Hết hàng'
      }
    ];

  // ==================================================
  // PHÂN TRANG
  // ==================================================

  currentPage = 1;

  pageSize = 11;

  // ==================================================
  // TRẠNG THÁI GIAO DIỆN
  // ==================================================

  selectedProduct:
    ProductItem |
    null = null;

  isSelectionLoading = false;

  pendingProductId:
    string |
    null = null;

  failedImageIds =
    new Set<string>();

  private selectionTimer?:
    ReturnType<typeof setTimeout>;

  // ==================================================
  // DỮ LIỆU FAKE
  //
  // Sau này thay products và histories bằng dữ liệu API.
  // ==================================================

  products:
    ProductItem[] = [];

  histories:
    ProductHistoryItem[] = [
      {
        id: 1,
        productId: 'COMTAM01',
        userName: 'Admin',
        roleName: 'Quản trị viên',
        actionType: 'UPDATE',
        description: 'Cập nhật món COMTAM01 (Cơm tấm sườn bì chả) thay đổi: 55.000 đ',
        createdAt: '2026-07-20T21:40:21'
      },
      {
        id: 2,
        productId: 'COMTAM01',
        userName: 'Linh',
        roleName: 'Nhân viên',
        actionType: 'UPDATE',
        description: 'Cập nhật món COMTAM01 (Cơm tấm sườn bì chả) cập nhật mô tả',
        createdAt: '2026-07-15T17:30:12'
      },
      {
        id: 3,
        productId: 'COMTAM01',
        userName: 'Admin',
        roleName: 'Quản trị viên',
        actionType: 'STATUS_CHANGE',
        description: 'Cập nhật món COMTAM01 (Cơm tấm sườn bì chả) thay đổi trạng thái',
        createdAt: '2026-05-10T16:05:22'
      },
      {
        id: 4,
        productId: 'COMTAM01',
        userName: 'Admin',
        roleName: 'Quản trị viên',
        actionType: 'UPDATE',
        description: 'Cập nhật món COMTAM01 (Cơm tấm sườn bì chả) thay đổi giá: 50.000 đ',
        createdAt: '2026-05-05T10:15:32'
      },
      {
        id: 5,
        productId: 'COMTAM01',
        userName: 'Admin',
        roleName: 'Quản trị viên',
        actionType: 'CREATE',
        description: 'Thêm mới món COMTAM01 (Cơm tấm sườn bì chả)',
        createdAt: '2026-01-15T09:16:22'
      },
      {
        id: 6,
        productId: 'PHOBO01',
        userName: 'Admin',
        roleName: 'Quản trị viên',
        actionType: 'UPDATE',
        description: 'Cập nhật món PHOBO01 - Phở bò tái',
        createdAt: '2026-07-18T14:20:00'
      },
      {
        id: 7,
        productId: 'LAUTHAI01',
        userName: 'Admin',
        roleName: 'Quản trị viên',
        actionType: 'CREATE',
        description: 'Thêm mới món LAUTHAI01 - Lẩu Thái hải sản',
        createdAt: '2026-07-17T12:30:00'
      }
    ];

  private readonly baseProducts:
    ProductItem[] = [
      {
        id: 'COMTAM01',
        name: 'Cơm tấm sườn bì chả',
        description: 'Cơm tấm sườn nướng, bì, chả trứng',
        price: 55000,
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80',
        categoryId: 'COM',
        categoryName: 'Cơm',
        unit: 'phần',
        status: 1,
        isFeatured: true,
        isBestSeller: true,
        createdAt: '2026-01-15T09:16:22',
        updatedAt: '2026-05-20T21:40:21'
      },
      {
        id: 'P9X6GO01',
        name: 'Phở bò tái',
        description: 'Phở bò tái mềm, nước dùng đậm đà',
        price: 45000,
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=500&q=80',
        categoryId: 'PHO',
        categoryName: 'Phở',
        unit: 'tô',
        status: 1,
        isFeatured: false,
        isBestSeller: true,
        createdAt: '2026-02-01T08:30:00',
        updatedAt: null
      },
      {
        id: 'LAUTHAI01',
        name: 'Lẩu Thái hải sản',
        description: 'Lẩu chua cay Thái, hải sản tươi ngon',
        price: 299000,
        imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=80',
        categoryId: 'LAU',
        categoryName: 'Lẩu',
        unit: 'nồi',
        status: 1,
        isFeatured: true,
        isBestSeller: true,
        createdAt: '2026-02-05T10:00:00',
        updatedAt: null
      },
      {
        id: 'BUNBO01',
        name: 'Bún bò Huế',
        description: 'Bún bò Huế cay nồng, đậm đà',
        price: 50000,
        imageUrl: 'https://images.unsplash.com/photo-1576577445504-6af96477db52?auto=format&fit=crop&w=500&q=80',
        categoryId: 'BUN',
        categoryName: 'Bún',
        unit: 'tô',
        status: 1,
        isFeatured: false,
        isBestSeller: true,
        createdAt: '2026-02-10T09:20:00',
        updatedAt: null
      },
      {
        id: 'GOICUON01',
        name: 'Gỏi cuốn tôm thịt',
        description: 'Gỏi cuốn tôm thịt, rau sống, bún',
        price: 35000,
        imageUrl: 'https://images.unsplash.com/photo-1562967916-eb82221dfb36?auto=format&fit=crop&w=500&q=80',
        categoryId: 'KHAIVI',
        categoryName: 'Khai vị',
        unit: 'phần',
        status: 1,
        isFeatured: false,
        isBestSeller: false,
        createdAt: '2026-02-12T11:15:00',
        updatedAt: null
      },
      {
        id: 'NUONG01',
        name: 'Ba rọi heo nướng',
        description: 'Ba rọi heo nướng thấm vị, thơm ngon',
        price: 120000,
        imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=500&q=80',
        categoryId: 'NUONG',
        categoryName: 'Nướng',
        unit: 'phần',
        status: 1,
        isFeatured: true,
        isBestSeller: false,
        createdAt: '2026-02-15T12:00:00',
        updatedAt: null
      },
      {
        id: 'TRASUA01',
        name: 'Trà sữa thái chay',
        description: 'Trà sữa thơm béo, trân châu dai',
        price: 28000,
        imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=500&q=80',
        categoryId: 'DOUONG',
        categoryName: 'Đồ uống',
        unit: 'ly',
        status: 1,
        isFeatured: false,
        isBestSeller: true,
        createdAt: '2026-02-18T13:00:00',
        updatedAt: null
      },
      {
        id: 'CHE01',
        name: 'Chè khúc bạch',
        description: 'Chè khúc bạch thanh mát',
        price: 30000,
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80',
        categoryId: 'TRANGMIENG',
        categoryName: 'Tráng miệng',
        unit: 'chén',
        status: 1,
        isFeatured: false,
        isBestSeller: false,
        createdAt: '2026-02-20T14:10:00',
        updatedAt: null
      },
      {
        id: 'VITQUAY01',
        name: 'Vịt quay Bắc Kinh',
        description: 'Vịt quay da giòn, thịt mềm thơm',
        price: 450000,
        imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=500&q=80',
        categoryId: 'DACBIET',
        categoryName: 'Món đặc biệt',
        unit: 'phần',
        status: 1,
        isFeatured: true,
        isBestSeller: true,
        createdAt: '2026-02-22T15:20:00',
        updatedAt: null
      },
      {
        id: 'CAFE01',
        name: 'Cà phê sữa đá',
        description: 'Cà phê đậm đà, sữa đặc, đá lạnh',
        price: 22000,
        imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80',
        categoryId: 'DOUONG',
        categoryName: 'Đồ uống',
        unit: 'ly',
        status: 0,
        isFeatured: false,
        isBestSeller: true,
        createdAt: '2026-02-25T16:30:00',
        updatedAt: null
      },
      {
        id: 'MIXAO01',
        name: 'Mì xào hải sản',
        description: 'Mì xào hải sản tươi ngon',
        price: 65000,
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80',
        categoryId: 'MONCHINH',
        categoryName: 'Món chính',
        unit: 'phần',
        status: 1,
        isFeatured: true,
        isBestSeller: false,
        createdAt: '2026-03-01T17:00:00',
        updatedAt: null
      },
      {
        id: 'BANHFLAN01',
        name: 'Bánh flan',
        description: 'Bánh flan mềm mịn, vị caramel',
        price: 20000,
        imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80',
        categoryId: 'TRANGMIENG',
        categoryName: 'Tráng miệng',
        unit: 'phần',
        status: 0,
        isFeatured: false,
        isBestSeller: false,
        createdAt: '2026-03-03T11:30:00',
        updatedAt: null
      }
    ];

  // ==================================================
  // KHỞI TẠO
  // ==================================================

  ngOnInit(): void {

    this.products =
      this.buildFakeProducts(
        48
      );

    this.selectedProduct =
      this.products.find(
        product =>
          product.id === 'COMTAM01'
      ) ??
      this.products[0] ??
      null;
  }

  // ==================================================
  // THỐNG KÊ FAKE THEO MẪU UI
  //
  // Khi nối API thật, thay các giá trị này bằng
  // dữ liệu statistics do backend trả về.
  // ==================================================

  get statistics():
    ProductStatisticCard[] {

    return [
      {
        label: 'Tổng số món',
        value: 48,
        percentage: 100,
        icon: 'room_service',
        cssClass: 'total'
      },
      {
        label: 'Đang bán',
        value: 39,
        percentage: 81.3,
        icon: 'inventory_2',
        cssClass: 'selling'
      },
      {
        label: 'Hết hàng',
        value: 6,
        percentage: 12.5,
        icon: 'delete_forever',
        cssClass: 'out-of-stock'
      },
      {
        label: 'Món nổi bật',
        value: 12,
        percentage: 25,
        icon: 'star',
        cssClass: 'featured'
      }
    ];
  }

  // ==================================================
  // LỌC DỮ LIỆU
  // ==================================================

  get filteredProducts():
    ProductItem[] {

    const keyword =
      this.searchKeyword
        .trim()
        .toLocaleLowerCase(
          'vi-VN'
        );

    return this.products.filter(
      product => {

        const matchesKeyword =
          !keyword ||
          product.id
            .toLocaleLowerCase('vi-VN')
            .includes(keyword) ||
          product.name
            .toLocaleLowerCase('vi-VN')
            .includes(keyword) ||
          product.description
            .toLocaleLowerCase('vi-VN')
            .includes(keyword) ||
          product.categoryName
            .toLocaleLowerCase('vi-VN')
            .includes(keyword);

        const matchesStatus =
          this.selectedStatus === null ||
          product.status ===
            this.selectedStatus;

        return (
          matchesKeyword &&
          matchesStatus
        );
      }
    );
  }

  get displayedProducts():
    ProductItem[] {

    const startIndex =
      (
        this.currentPage -
        1
      ) *
      this.pageSize;

    return this.filteredProducts.slice(
      startIndex,
      startIndex +
      this.pageSize
    );
  }

  get totalItems(): number {

    return this.filteredProducts.length;
  }

  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.totalItems /
        this.pageSize
      )
    );
  }

  get startItem(): number {

    if (
      this.totalItems === 0
    ) {
      return 0;
    }

    return (
      (
        this.currentPage -
        1
      ) *
      this.pageSize +
      1
    );
  }

  get endItem(): number {

    if (
      this.totalItems === 0
    ) {
      return 0;
    }

    return Math.min(
      this.startItem +
      this.displayedProducts.length -
      1,
      this.totalItems
    );
  }

  get visiblePageNumbers():
    number[] {

    const maximumVisiblePages =
      3;

    let startPage =
      Math.max(
        1,
        this.currentPage -
        1
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

    const pages:
      number[] = [];

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

  get selectedProductHistories():
    ProductHistoryItem[] {

    if (
      !this.selectedProduct
    ) {
      return [];
    }

    return this.histories
      .filter(
        history =>
          history.productId ===
          this.selectedProduct?.id
      )
      .sort(
        (
          first,
          second
        ) =>
          new Date(
            second.createdAt
          ).getTime() -
          new Date(
            first.createdAt
          ).getTime()
      );
  }

  // ==================================================
  // SỰ KIỆN BỘ LỌC
  // ==================================================

  onSearchChange(): void {

    this.currentPage = 1;

    this.ensureSelectedProduct();
  }

  onStatusChange(): void {

    this.currentPage = 1;

    this.ensureSelectedProduct();
  }

  onPageSizeChange(): void {

    this.currentPage = 1;

    this.ensureSelectedProduct();
  }

  private ensureSelectedProduct(): void {

    if (
      this.filteredProducts.length ===
      0
    ) {
      this.selectedProduct = null;

      return;
    }

    const selectedStillExists =
      this.selectedProduct &&
      this.filteredProducts.some(
        product =>
          product.id ===
          this.selectedProduct?.id
      );

    if (
      !selectedStillExists
    ) {
      this.selectedProduct =
        this.filteredProducts[0];
    }
  }

  // ==================================================
  // CHỌN PRODUCT
  // ==================================================

  selectProduct(
    product:
      ProductItem
  ): void {

    if (
      this.selectedProduct?.id ===
        product.id &&
      !this.isSelectionLoading
    ) {
      return;
    }

    if (
      this.selectionTimer
    ) {
      clearTimeout(
        this.selectionTimer
      );
    }

    this.selectedProduct =
      product;

    this.pendingProductId =
      product.id;

    this.isSelectionLoading =
      true;

    this.selectionTimer =
      setTimeout(() => {

        this.isSelectionLoading =
          false;

        this.pendingProductId =
          null;

      }, 320);
  }

  isSelectedProduct(
    product:
      ProductItem
  ): boolean {

    return (
      this.selectedProduct?.id ===
        product.id ||
      this.pendingProductId ===
        product.id
    );
  }

  isProductSelectionLoading(
    product:
      ProductItem
  ): boolean {

    return (
      this.isSelectionLoading &&
      this.pendingProductId ===
        product.id
    );
  }

  viewProduct(
    product:
      ProductItem,
    event?:
      MouseEvent
  ): void {

    event?.stopPropagation();

    this.selectProduct(
      product
    );
  }

  changePage(
    page:
      number
  ): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage =
      page;

    const firstProduct =
      this.displayedProducts[0];

    if (
      firstProduct
    ) {
      this.selectProduct(
        firstProduct
      );
    }
  }

  // ==================================================
  // CÁC CHỨC NĂNG FAKE
  // ==================================================

  addProduct(): void {

    console.log(
      'Mở form thêm món mới'
    );
  }

  editProduct(
    product:
      ProductItem,
    event?:
      MouseEvent
  ): void {

    event?.stopPropagation();

    console.log(
      'Sửa món:',
      product
    );
  }

  deleteProduct(
    product:
      ProductItem,
    event?:
      MouseEvent
  ): void {

    event?.stopPropagation();

    console.log(
      'Xóa món:',
      product
    );
  }

  deleteHistory(
    history:
      ProductHistoryItem,
    event?:
      MouseEvent
  ): void {

    event?.stopPropagation();

    console.log(
      'Xóa lịch sử món:',
      history
    );
  }

  viewAllHistory(): void {

    console.log(
      'Xem tất cả lịch sử món ăn'
    );
  }

  // ==================================================
  // HIỂN THỊ TRẠNG THÁI
  // ==================================================

  getStatusLabel(
    status:
      ProductStatus
  ): string {

    return status === 1
      ? 'Còn hàng'
      : 'Hết hàng';
  }

  getStatusClass(
    status:
      ProductStatus
  ):
    | 'available'
    | 'out-of-stock' {

    return status === 1
      ? 'available'
      : 'out-of-stock';
  }

  getHistoryClass(
    actionType:
      string
  ):
    | 'create'
    | 'update'
    | 'status'
    | 'delete' {

    switch (
      actionType
        .trim()
        .toUpperCase()
    ) {
      case 'CREATE':
        return 'create';

      case 'STATUS_CHANGE':
        return 'status';

      case 'DELETE':
        return 'delete';

      default:
        return 'update';
    }
  }

  // ==================================================
  // HÌNH ẢNH
  // ==================================================

  onProductImageError(
    productId:
      string
  ): void {

    this.failedImageIds.add(
      productId
    );
  }

  canShowProductImage(
    product:
      ProductItem
  ): boolean {

    return (
      !!product.imageUrl &&
      !this.failedImageIds.has(
        product.id
      )
    );
  }

  // ==================================================
  // FORMAT
  // ==================================================

  formatPrice(
    price:
      number
  ): string {

    return (
      new Intl.NumberFormat(
        'vi-VN'
      ).format(
        price
      ) +
      ' đ'
    );
  }

  // ==================================================
  // TRACK BY
  // ==================================================

  trackByProductId(
    index:
      number,
    product:
      ProductItem
  ): string {

    return product.id;
  }

  trackByHistoryId(
    index:
      number,
    history:
      ProductHistoryItem
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

  // ==================================================
  // TẠO DỮ LIỆU FAKE
  // ==================================================

  private buildFakeProducts(
    total:
      number
  ): ProductItem[] {

    const result:
      ProductItem[] = [];

    for (
      let index = 0;
      index < total;
      index++
    ) {
      const baseProduct =
        this.baseProducts[
          index %
          this.baseProducts.length
        ];

      const cycle =
        Math.floor(
          index /
          this.baseProducts.length
        );

      const isOriginal =
        cycle === 0;

      result.push({
        ...baseProduct,

        id:
          isOriginal
            ? baseProduct.id
            : `${baseProduct.id}${cycle + 1}`,

        name:
          isOriginal
            ? baseProduct.name
            : `${baseProduct.name} ${cycle + 1}`,

        status:
          index % 8 === 7
            ? 0
            : baseProduct.status,

        isFeatured:
          index % 4 === 0,

        isBestSeller:
          index % 3 === 0,

        createdAt:
          new Date(
            2026,
            index % 6,
            Math.max(
              1,
              15 -
              index % 12
            ),
            8 +
            index % 9,
            10 +
            index % 40,
            0
          ).toISOString(),

        updatedAt:
          index % 3 === 0
            ? new Date(
                2026,
                4,
                20,
                21,
                40,
                21
              ).toISOString()
            : null
      });
    }

    return result;
  }

  // ==================================================
  // HỦY COMPONENT
  // ==================================================

  ngOnDestroy(): void {

    if (
      this.selectionTimer
    ) {
      clearTimeout(
        this.selectionTimer
      );
    }
  }
}