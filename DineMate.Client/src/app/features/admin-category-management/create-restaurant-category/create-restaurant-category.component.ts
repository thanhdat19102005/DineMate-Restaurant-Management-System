import {
  CommonModule
} from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
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
  CreatedCategoryData,
  CreateCategoryRequest
} from '../admin-category-management.service';

// ==================================================
// DỮ LIỆU FORM TẠO CATEGORY
// ==================================================

export interface CreateRestaurantCategoryFormModel {
  id: string;

  name: string;

  description: string;

  status: CategoryStatus;
}

@Component({
  selector:
    'app-create-restaurant-category',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './create-restaurant-category.component.html',

  styleUrl:
    './create-restaurant-category.component.css'
})
export class CreateRestaurantCategoryComponent
  implements OnDestroy {

  // ==================================================
  // HỦY SUBSCRIBE
  // ==================================================

  private readonly destroy$ =
    new Subject<void>();

  // ==================================================
  // HIỂN THỊ MODAL
  // ==================================================

  @Input()
  isOpen = true;

  // ==================================================
  // SỰ KIỆN TRẢ VỀ COMPONENT CHA
  // ==================================================

  @Output()
  closed =
    new EventEmitter<void>();

  /*
   * Trả Category thật do backend vừa tạo.
   *
   * Component cha có thể dùng id của Category
   * để load lại danh sách và chọn đúng Category mới.
   */
  @Output()
  created =
    new EventEmitter<
      CreatedCategoryData
    >();

  // ==================================================
  // CẤU HÌNH FORM
  // ==================================================

  readonly descriptionMaxLength =
    255;

  readonly statusOptions:
    {
      value: CategoryStatus;

      label: string;
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
  // DỮ LIỆU FORM BAN ĐẦU
  //
  // Để chuỗi rỗng để input chỉ hiện placeholder.
  // ==================================================

  form:
    CreateRestaurantCategoryFormModel = {
      id: '',

      name: '',

      description: '',

      status: 1
    };

  // ==================================================
  // TRẠNG THÁI GIAO DIỆN
  // ==================================================

  isSubmitting = false;

  /*
   * Chạy animation đóng trước khi
   * component cha gỡ modal khỏi DOM.
   */
  isClosing = false;

  errorMessage = '';

  private closeTimer?:
    ReturnType<typeof setTimeout>;

  constructor(
    private readonly categoryService:
      AdminCategoryManagementService
  ) {}

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
  // CHUẨN HÓA MÃ LOẠI
  // ==================================================

  onCategoryIdChange(
    value:
      string
  ): void {

    this.form.id =
      (value ?? '')
        .toUpperCase()
        .replace(
          /\s+/g,
          ''
        )
        .replace(
          /[^A-Z0-9_-]/g,
          ''
        );

    this.errorMessage = '';
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
  // CHẠY ANIMATION ĐÓNG
  // ==================================================

  private startCloseAnimation(
    createdCategory?:
      CreatedCategoryData
  ): void {

    this.isClosing = true;

    if (
      this.closeTimer
    ) {
      clearTimeout(
        this.closeTimer
      );
    }

    /*
     * 220ms phải khớp animation đóng
     * trong file CSS.
     */
    this.closeTimer =
      setTimeout(() => {

        if (
          createdCategory
        ) {
          this.created.emit(
            createdCategory
          );
        }

        this.closed.emit();

      }, 220);
  }

  // ==================================================
  // NGĂN ĐÓNG KHI CLICK VÀO MODAL
  // ==================================================

  stopModalClick(
    event:
      MouseEvent
  ): void {

    event.stopPropagation();
  }

  // ==================================================
  // GỌI API POST TẠO CATEGORY THẬT
  // ==================================================

  submitCategory(): void {

    if (
      this.isSubmitting ||
      this.isClosing
    ) {
      return;
    }

    this.errorMessage = '';

    const normalizedId =
      this.form.id
        .trim()
        .toUpperCase();

    const normalizedName =
      this.form.name
        .trim();

    const normalizedDescription =
      this.form.description
        .trim();

    // ==================================================
    // KIỂM TRA NHANH Ở FRONTEND
    //
    // Backend vẫn kiểm tra lại bằng CategoryRules.
    // ==================================================

    if (
      !normalizedId
    ) {
      this.errorMessage =
        'Vui lòng nhập mã loại món.';

      return;
    }

    if (
      normalizedId.length < 2 ||
      normalizedId.length > 50
    ) {
      this.errorMessage =
        'Mã loại món phải có từ 2 đến 50 ký tự.';

      return;
    }

    if (
      !/^[A-Z0-9_-]+$/.test(
        normalizedId
      )
    ) {
      this.errorMessage =
        'Mã loại món chỉ được chứa chữ in hoa, chữ số, dấu gạch ngang hoặc dấu gạch dưới.';

      return;
    }

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
      CreateCategoryRequest = {
        id:
          normalizedId,

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
      .createCategory(
        request
      )
      .pipe(
        takeUntil(
          this.destroy$
        )
      )
      .subscribe({
        next: response => {

          this.isSubmitting =
            false;

          if (
            !response.success
          ) {
            this.errorMessage =
              response.message ||
              'Không thể tạo loại món mới.';

            return;
          }

          if (
            !response.data
          ) {
            this.errorMessage =
              'API thông báo thành công nhưng không trả về dữ liệu loại món vừa tạo.';

            return;
          }

          // ==================================================
          // THÔNG BÁO TẠO CATEGORY THÀNH CÔNG
          //
          // Sử dụng cùng customClass với Restaurant Table
          // để giữ nguyên giao diện toast hiện tại.
          // ==================================================

          Swal.fire({
            toast:
              true,

            position:
              'top-end',

            icon:
              'success',

            title:
              `Tạo loại món ${response.data.id} thành công.`,

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
           * Giữ nguyên logic cũ:
           *
           * - Chạy animation đóng.
           * - Sau 220ms phát created.
           * - Component cha load lại dữ liệu.
           */
          this.startCloseAnimation(
            response.data
          );
        },

        error: error => {

          this.isSubmitting =
            false;

          this.errorMessage =
            this.getApiErrorMessage(
              error
            );
        }
      });
  }

  // ==================================================
  // LẤY THÔNG BÁO LỖI TỪ API
  // ==================================================

  private getApiErrorMessage(
    error:
      any
  ): string {

    /*
     * Backend Create Category trả:
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
        return 'Dữ liệu tạo loại món không hợp lệ.';

      case 401:
        return 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.';

      case 403:
        return 'Bạn không có quyền tạo loại món.';

      case 404:
        return 'Không tìm thấy API tạo loại món.';

      case 409:
        return 'Mã loại hoặc tên loại món đã tồn tại.';

      case 500:
        return 'Máy chủ xảy ra lỗi khi tạo loại món.';

      default:
        return 'Đã xảy ra lỗi khi tạo loại món mới. Vui lòng thử lại.';
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