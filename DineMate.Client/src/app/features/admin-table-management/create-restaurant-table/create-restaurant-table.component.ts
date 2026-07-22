import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  QRCodeComponent
} from 'angularx-qrcode';

import {
  finalize
} from 'rxjs';

// ==================================================
// THÊM MỚI:
// IMPORT THƯ VIỆN SWEETALERT2
// ==================================================

import Swal from 'sweetalert2';

import {
  AdminTableManagementService,
  CreatedRestaurantTable,
  CreateRestaurantTableRequest
} from '../admin-table-management.service';

@Component({
  selector:
    'app-create-restaurant-table',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    QRCodeComponent
  ],

  templateUrl:
    './create-restaurant-table.component.html',

  styleUrl:
    './create-restaurant-table.component.css'
})
export class CreateRestaurantTableComponent
  implements OnDestroy {

  // ==================================================
  // NHẬN TRẠNG THÁI TỪ COMPONENT CHA
  // ==================================================

  /*
   * true:
   * Hiển thị modal.
   *
   * false:
   * Ẩn modal.
   */
  @Input()
  isOpen = false;

  // ==================================================
  // GỬI SỰ KIỆN ĐÓNG LÊN COMPONENT CHA
  // ==================================================

  @Output()
  closed =
    new EventEmitter<void>();

  // ==================================================
  // GỬI BÀN MỚI LÊN COMPONENT CHA
  // ==================================================

  @Output()
  created =
    new EventEmitter<
      CreatedRestaurantTable
    >();

  // ==================================================
  // DỮ LIỆU FORM
  // ==================================================

  form:
    CreateRestaurantTableRequest = {
      id: '',
      tableName: '',
      capacity: 4,
      tableType: '',
      areaName: '',
      note: ''
    };

  /*
   * Trạng thái mã QR xem trước.
   */
  qrGenerated = false;

  /*
   * Trạng thái đang gọi API.
   */
  isSubmitting = false;

  /*
   * Nội dung lỗi hiển thị trên form.
   */
  errorMessage = '';

  // ==================================================
  // TRẠNG THÁI ANIMATION ĐÓNG MODAL
  // ==================================================

  /*
   * false:
   * Modal đang mở bình thường.
   *
   * true:
   * Modal đang chạy hiệu ứng đóng.
   */
  isClosing = false;

  /*
   * Thời gian 250ms phải khớp với CSS:
   *
   * animation: modal-hide 0.25s;
   */
  private closeAnimationDuration:
    number = 250;

  /*
   * Dùng number vì đang sử dụng:
   *
   * window.setTimeout(...)
   */
  private closeTimer:
    number | null = null;

  constructor(
    private readonly tableService:
      AdminTableManagementService
  ) {}

  // ==================================================
  // HỦY TIMER KHI COMPONENT BỊ HỦY
  // ==================================================

  ngOnDestroy(): void {
    if (
      this.closeTimer !== null
    ) {
      window.clearTimeout(
        this.closeTimer
      );

      this.closeTimer = null;
    }
  }

  // ==================================================
  // DỮ LIỆU XEM TRƯỚC
  // ==================================================

  get previewCode(): string {
    return (
      this.form.id
        .trim()
        .toUpperCase() ||
      'A01'
    );
  }

  get previewName(): string {
    return (
      this.form.tableName
        .trim() ||
      'Bàn A01'
    );
  }

  get previewArea(): string {
    return (
      this.form.areaName
        ?.trim() ||
      'Khu A'
    );
  }

  get previewCapacity(): number {
    return (
      Number(
        this.form.capacity
      ) || 4
    );
  }

  /*
   * QR xem trước.
   *
   * QR chính thức vẫn do backend tạo.
   */
  get previewQrUrl(): string {
    return (
      'http://localhost:4200/order/' +
      encodeURIComponent(
        this.previewCode
      )
    );
  }

  get noteLength(): number {
    return (
      this.form.note?.length ??
      0
    );
  }

  // ==================================================
  // TẠO QR XEM TRƯỚC
  // ==================================================

  generateQr(): void {
    /*
     * Không cho thao tác khi modal đang đóng
     * hoặc API đang xử lý.
     */
    if (
      this.isClosing ||
      this.isSubmitting
    ) {
      return;
    }

    this.errorMessage = '';

    if (
      !this.form.id.trim()
    ) {
      this.errorMessage =
        'Vui lòng nhập mã bàn trước khi tạo mã QR.';

      return;
    }

    this.form.id =
      this.form.id
        .trim()
        .toUpperCase();

    this.qrGenerated = true;
  }

  // ==================================================
  // ĐÓNG MODAL
  // ==================================================

  closeModal(): void {
    /*
     * Không cho đóng khi đang gọi API.
     */
    if (
      this.isSubmitting
    ) {
      return;
    }

    /*
     * Không chạy animation nhiều lần
     * nếu người dùng bấm liên tục.
     */
    if (
      this.isClosing
    ) {
      return;
    }

    /*
     * Không đóng ngay.
     * Chạy hiệu ứng trước.
     */
    this.startClosingAnimation();
  }

  /*
   * Chỉ đóng khi bấm đúng vào nền mờ.
   *
   * Bấm bên trong modal sẽ không đóng.
   */
  onBackdropClick(
    event: MouseEvent
  ): void {
    if (
      event.target ===
      event.currentTarget
    ) {
      this.closeModal();
    }
  }

  // ==================================================
  // CHẠY HIỆU ỨNG ĐÓNG MODAL
  // ==================================================

  private startClosingAnimation():
    void {

    if (
      this.isClosing
    ) {
      return;
    }

    /*
     * Khi isClosing = true,
     * HTML sẽ nhận class closing.
     */
    this.isClosing = true;

    /*
     * Xóa timer cũ nếu còn tồn tại.
     */
    if (
      this.closeTimer !== null
    ) {
      window.clearTimeout(
        this.closeTimer
      );

      this.closeTimer = null;
    }

    /*
     * Chờ animation CSS chạy xong.
     */
    this.closeTimer =
      window.setTimeout(() => {
        /*
         * Reset form sau khi modal đã mờ đi.
         */
        this.resetForm();

        /*
         * Trả trạng thái về ban đầu.
         */
        this.isClosing = false;

        this.closeTimer = null;

        /*
         * Báo component cha đóng modal.
         */
        this.closed.emit();
      }, this.closeAnimationDuration);
  }

  // ==================================================
  // TẠO BÀN
  // ==================================================

  createTable(): void {
    /*
     * Không gọi API khi:
     *
     * - Modal đang đóng.
     * - API đang xử lý.
     */
    if (
      this.isClosing ||
      this.isSubmitting
    ) {
      return;
    }

    this.errorMessage = '';

    const validationMessage =
      this.validateForm();

    if (
      validationMessage
    ) {
      this.errorMessage =
        validationMessage;

      return;
    }

    const request:
      CreateRestaurantTableRequest = {
        id:
          this.form.id
            .trim()
            .toUpperCase(),

        tableName:
          this.form.tableName
            .trim(),

        capacity:
          Number(
            this.form.capacity
          ),

        tableType:
          this.form.tableType
            .trim(),

        areaName:
          this.form.areaName
            ?.trim() ||
          null,

        note:
          this.form.note
            ?.trim() ||
          null
      };

    this.isSubmitting = true;

    this.tableService
      .createRestaurantTable(
        request
      )
      .pipe(
        finalize(() => {
          this.isSubmitting =
            false;
        })
      )
      .subscribe({
        next: response => {
          if (
            !response.success ||
            !response.data
          ) {
            this.errorMessage =
              response.message ||
              'Tạo bàn thất bại.';

            return;
          }

          /*
           * Gửi dữ liệu bàn vừa tạo
           * lên component cha.
           */
          this.created.emit(
            response.data
          );

          // ==================================================
          // THÊM MỚI:
          // THÔNG BÁO TẠO BÀN THÀNH CÔNG
          // ==================================================

       Swal.fire({
  toast: true,

  position: 'top-end',

  icon: 'success',

  title:
    `Tạo bàn ${response.data.id} thành công.`,

  showConfirmButton: false,

  timer: 1800,

  timerProgressBar: true,

  /*
   * THÊM MỚI:
   * Gắn class riêng để giới hạn chiều rộng
   * và thiết kế toast trong styles.css.
   */
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
          // GIỮ NGUYÊN LOGIC CŨ:
          // ĐÓNG MODAL CÓ ANIMATION
          // ==================================================

          /*
           * Chạy animation đóng modal trước,
           * sau đó mới reset form và emit closed.
           */
          this.startClosingAnimation();
        },

        error: error => {
          console.error(
            'Lỗi tạo bàn:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            error.error?.title ||
            'Không thể tạo bàn mới.';
        }
      });
  }

  // ==================================================
  // VALIDATE FRONTEND
  // ==================================================

  private validateForm():
    string | null {

    if (
      !this.form.id.trim()
    ) {
      return (
        'Mã bàn không được để trống.'
      );
    }

    if (
      this.form.id
        .trim()
        .length > 50
    ) {
      return (
        'Mã bàn không được vượt quá 50 ký tự.'
      );
    }

    if (
      !this.form.tableName.trim()
    ) {
      return (
        'Tên bàn không được để trống.'
      );
    }

    if (
      this.form.tableName
        .trim()
        .length > 200
    ) {
      return (
        'Tên bàn không được vượt quá 200 ký tự.'
      );
    }

    if (
      !this.form.capacity ||
      Number(
        this.form.capacity
      ) <= 0
    ) {
      return (
        'Sức chứa phải lớn hơn 0.'
      );
    }

    if (
      Number(
        this.form.capacity
      ) > 100
    ) {
      return (
        'Sức chứa không được vượt quá 100 người.'
      );
    }

    if (
      !this.form.tableType.trim()
    ) {
      return (
        'Vui lòng chọn loại bàn.'
      );
    }

    if (
      this.form.areaName &&
      this.form.areaName
        .trim()
        .length > 200
    ) {
      return (
        'Tên khu vực không được vượt quá 200 ký tự.'
      );
    }

    if (
      this.form.note &&
      this.form.note.length > 1000
    ) {
      return (
        'Ghi chú không được vượt quá 1000 ký tự.'
      );
    }

    return null;
  }

  // ==================================================
  // RESET FORM
  // ==================================================

  private resetForm(): void {
    this.form = {
      id: '',
      tableName: '',
      capacity: 4,
      tableType: '',
      areaName: '',
      note: ''
    };

    this.qrGenerated = false;

    this.errorMessage = '';
  }
}