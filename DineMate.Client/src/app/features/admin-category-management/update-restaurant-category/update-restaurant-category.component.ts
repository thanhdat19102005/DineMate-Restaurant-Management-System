import {
  CommonModule
} from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  finalize,
  Subject,
  takeUntil
} from 'rxjs';

// ==================================================
// THÔNG BÁO SWEETALERT2
// ==================================================

import Swal from 'sweetalert2';

import {
  AdminCategoryManagementService,
  CategoryStatus,
  UpdatedCategoryData,
  UpdateCategoryRequest
} from '../admin-category-management.service';

// ==================================================
// TRẠNG THÁI CATEGORY
// ==================================================

export type UpdateRestaurantCategoryStatus =
  CategoryStatus;

// ==================================================
// DỮ LIỆU CATEGORY NHẬN TỪ COMPONENT CHA
//
// Có cấu trúc tương thích với CategoryItem
// và CategoryDetail của hệ thống.
// ==================================================

export interface UpdateRestaurantCategorySource {
  id: string;

  name: string;

  description?: string | null;

  status: UpdateRestaurantCategoryStatus;

  imageUrl?: string | null;

  productCount?: number;

  createdAt?: string;

  updatedAt?: string | null;
}

// ==================================================
// DỮ LIỆU FORM UPDATE CATEGORY
// ==================================================

export interface UpdateRestaurantCategoryFormModel {
  id: string;

  name: string;

  description: string;

  status: UpdateRestaurantCategoryStatus;
}

@Component({
  selector:
    'app-update-restaurant-category',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './update-restaurant-category.component.html',

  styleUrl:
    './update-restaurant-category.component.css'
})
export class UpdateRestaurantCategoryComponent
  implements OnChanges, OnDestroy {

  // ==================================================
  // HỦY SUBSCRIBE
  // ==================================================

  private readonly destroy$ =
    new Subject<void>();

  // ==================================================
  // TRẠNG THÁI ĐÓNG / MỞ MODAL
  // ==================================================

  @Input()
  isOpen = true;

  // ==================================================
  // CATEGORY CẦN CẬP NHẬT
  //
  // Component cha truyền CategoryItem đang được sửa.
  // ==================================================

  @Input()
  category:
    UpdateRestaurantCategorySource |
    null = null;

  // ==================================================
  // NGƯỜI CẬP NHẬT LẦN CUỐI
  //
  // Response danh sách hiện tại chưa có UpdatedBy,
  // nên giữ Input này để component cha có thể truyền vào.
  // ==================================================

  @Input()
  lastUpdatedBy =
    'Quản trị viên';

  // ==================================================
  // SỰ KIỆN TRẢ VỀ COMPONENT CHA
  // ==================================================

  @Output()
  closed =
    new EventEmitter<void>();

  /*
   * Trả Category thật do backend vừa cập nhật.
   */
  @Output()
  updated =
    new EventEmitter<
      UpdatedCategoryData
    >();

  // ==================================================
  // CẤU HÌNH FORM
  // ==================================================

  readonly descriptionMaxLength =
    255;

  readonly statusOptions:
    {
      value:
        UpdateRestaurantCategoryStatus;

      label:
        string;
    }[] = [
      {
        value: 1,
        label: 'Đang hoạt động'
      },
      {
        value: 0,
        label: 'Đã ẩn'
      }
    ];

  // ==================================================
  // FORM HIỆN TẠI
  //
  // Không còn sử dụng dữ liệu fake.
  // Dữ liệu được nạp từ Input category.
  // ==================================================

  form:
    UpdateRestaurantCategoryFormModel = {
      id: '',

      name: '',

      description: '',

      status: 1
    };

  // ==================================================
  // TRẠNG THÁI GIAO DIỆN
  // ==================================================

  isSubmitting = false;

  isClosing = false;

  errorMessage = '';

  private closeTimer?:
    ReturnType<typeof setTimeout>;

  constructor(
    private readonly categoryService:
      AdminCategoryManagementService
  ) {}

  // ==================================================
  // NHẬN CATEGORY MỚI TỪ COMPONENT CHA
  // ==================================================

  ngOnChanges(
    changes:
      SimpleChanges
  ): void {

    if (
      changes['category'] ||
      (
        changes['isOpen'] &&
        this.isOpen
      )
    ) {
      this.loadCategoryToForm();
    }
  }

  // ==================================================
  // DỮ LIỆU XEM TRƯỚC
  // ==================================================

  get previewId(): string {

    return (
      this.form.id
        ?.trim()
        .toUpperCase() ||
      'MÃ LOẠI'
    );
  }

  get previewName(): string {

    return (
      this.form.name
        ?.trim() ||
      'Tên loại món'
    );
  }

  get previewDescription(): string {

    return (
      this.form.description
        ?.trim() ||
      'Chưa có mô tả cho loại món.'
    );
  }

  get statusLabel(): string {

    return this.form.status === 1
      ? 'Đang hoạt động'
      : 'Đã ẩn';
  }

  get statusClass():
    'active' |
    'hidden' {

    return this.form.status === 1
      ? 'active'
      : 'hidden';
  }

  // ==================================================
  // THỜI GIAN CẬP NHẬT LẦN CUỐI
  //
  // Ưu tiên UpdatedAt.
  // Nếu chưa từng cập nhật thì dùng CreatedAt.
  // ==================================================

  get lastUpdatedDate():
    string |
    null {

    return (
      this.category?.updatedAt ??
      this.category?.createdAt ??
      null
    );
  }

  // ==================================================
  // ĐÓNG FORM
  // ==================================================

  closeForm(): void {

    if (
      this.isSubmitting ||
      this.isClosing
    ) {
      return;
    }

    this.startCloseAnimation();
  }

  // ==================================================
  // NGĂN ĐÓNG KHI CLICK BÊN TRONG MODAL
  // ==================================================

  stopModalClick(
    event:
      MouseEvent
  ): void {

    event.stopPropagation();
  }

  // ==================================================
  // GỌI API PUT CẬP NHẬT CATEGORY THẬT
  // ==================================================

  submitCategoryUpdate(): void {

    if (
      this.isSubmitting ||
      this.isClosing
    ) {
      return;
    }

    this.errorMessage = '';

    if (
      !this.category
    ) {
      this.errorMessage =
        'Không tìm thấy loại món cần cập nhật.';

      return;
    }

    const normalizedCategoryId =
      this.category.id
        .trim()
        .toUpperCase();

    const normalizedName =
      this.form.name
        .trim();

    const normalizedDescription =
      this.form.description
        .trim();

    // ==================================================
    // GIỮ NGUYÊN VALIDATION CŨ
    // ==================================================

    if (
      !normalizedName
    ) {
      this.errorMessage =
        'Vui lòng nhập tên loại món.';

      return;
    }

    if (
      normalizedName.length < 2 ||
      normalizedName.length > 100
    ) {
      this.errorMessage =
        'Tên loại món phải có từ 2 đến 100 ký tự.';

      return;
    }

    if (
      normalizedDescription.length >
      this.descriptionMaxLength
    ) {
      this.errorMessage =
        `Mô tả không được vượt quá ${this.descriptionMaxLength} ký tự.`;

      return;
    }

    const request:
      UpdateCategoryRequest = {
        name:
          normalizedName,

        description:
          normalizedDescription ||
          null,

        status:
          this.form.status
      };

    this.isSubmitting = true;

    this.categoryService
      .updateCategory(
        normalizedCategoryId,
        request
      )
      .pipe(
        takeUntil(
          this.destroy$
        ),

        finalize(() => {
          this.isSubmitting =
            false;
        })
      )
      .subscribe({
        next: response => {

          if (
            !response.success
          ) {
            this.errorMessage =
              response.message ||
              'Không thể cập nhật loại món.';

            return;
          }

          if (
            !response.data
          ) {
            this.errorMessage =
              'API thông báo thành công nhưng không trả về dữ liệu loại món vừa cập nhật.';

            return;
          }

          // ==================================================
          // THÔNG BÁO CẬP NHẬT CATEGORY THÀNH CÔNG
          //
          // Sử dụng cùng customClass với Create Category
          // và Restaurant Table để giữ nguyên giao diện toast.
          // ==================================================

          Swal.fire({
            toast:
              true,

            position:
              'top-end',

            icon:
              'success',

            title:
              `Cập nhật loại món ${response.data.id} thành công.`,

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

          /*
           * Giữ nguyên logic đóng form cũ:
           *
           * - Chạy animation đóng.
           * - Sau 220ms phát updated.
           * - Component cha load lại dữ liệu thật.
           */
          this.startCloseAnimation(
            response.data
          );
        },

        error: error => {

          console.error(
            'Lỗi cập nhật loại món:',
            error
          );

          this.errorMessage =
            this.getApiErrorMessage(
              error
            );
        }
      });
  }

  // ==================================================
  // LOAD CATEGORY THẬT VÀO FORM
  // ==================================================

  private loadCategoryToForm():
    void {

    if (
      !this.category
    ) {
      this.form = {
        id: '',

        name: '',

        description: '',

        status: 1
      };

      this.errorMessage = '';

      return;
    }

    this.form = {
      id:
        this.category.id
          .trim()
          .toUpperCase(),

      name:
        this.category.name ??
        '',

      description:
        this.category.description ??
        '',

      status:
        this.category.status
    };

    this.errorMessage = '';

    this.isSubmitting = false;

    this.isClosing = false;
  }

  // ==================================================
  // ANIMATION ĐÓNG FORM
  // ==================================================

  private startCloseAnimation(
    updatedCategory?:
      UpdatedCategoryData
  ): void {

    if (
      this.isClosing
    ) {
      return;
    }

    this.isClosing = true;

    if (
      this.closeTimer
    ) {
      clearTimeout(
        this.closeTimer
      );
    }

    /*
     * 220ms phải khớp animation trong CSS.
     */
    this.closeTimer =
      setTimeout(() => {

        if (
          updatedCategory
        ) {
          this.updated.emit(
            updatedCategory
          );
        }

        this.closed.emit();

      }, 220);
  }

  // ==================================================
  // LẤY THÔNG BÁO LỖI TỪ API
  // ==================================================

  private getApiErrorMessage(
    error:
      any
  ): string {

    /*
     * Backend Update Category trả:
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

        return 'Dữ liệu cập nhật loại món không hợp lệ.';

      case 401:

        return 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.';

      case 403:

        return 'Bạn không có quyền cập nhật loại món.';

      case 404:

        return 'Không tìm thấy loại món hoặc API cập nhật loại món.';

      case 409:

        return 'Tên loại món đã được sử dụng bởi loại món khác.';

      case 500:

        return 'Máy chủ xảy ra lỗi khi cập nhật loại món.';

      default:

        return 'Đã xảy ra lỗi khi cập nhật loại món. Vui lòng thử lại.';
    }
  }

  // ==================================================
  // DỌN TIMER VÀ SUBSCRIBE
  // ==================================================

  ngOnDestroy(): void {

    if (
      this.closeTimer
    ) {
      clearTimeout(
        this.closeTimer
      );
    }

    this.destroy$.next();

    this.destroy$.complete();
  }
}