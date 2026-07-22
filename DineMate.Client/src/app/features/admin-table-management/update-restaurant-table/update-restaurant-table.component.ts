import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  QRCodeComponent
} from 'angularx-qrcode';

import {
  finalize
} from 'rxjs';

import Swal from 'sweetalert2';

// ==================================================
// THÊM MỚI:
// LẤY ĐỊA CHỈ FRONTEND TỪ ENVIRONMENT
// ==================================================

import {
  environment
} from '../../../environment/environment';

import {
  AdminTableManagementService,
  RestaurantTableDetail,
  RestaurantTableStatus,
  UpdatedRestaurantTable,
  UpdateRestaurantTableRequest
} from '../admin-table-management.service';

@Component({
  selector:
    'app-update-restaurant-table',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    QRCodeComponent
  ],

  templateUrl:
    './update-restaurant-table.component.html',

  styleUrl:
    './update-restaurant-table.component.css'
})
export class UpdateRestaurantTableComponent
  implements OnChanges, OnDestroy {

  // ==================================================
  // INPUT TỪ COMPONENT CHA
  // ==================================================

  /*
   * true:
   * Hiển thị form chỉnh sửa.
   *
   * false:
   * Ẩn form chỉnh sửa.
   */
  @Input()
  isOpen = false;

  /*
   * Bàn được component cha truyền xuống.
   */
  @Input()
  table:
    RestaurantTableDetail | null =
      null;

  /*
   * Danh sách khu vực hiện có.
   */
  @Input()
  areas: string[] = [];

  /*
   * Danh sách sức chứa hiện có.
   */
  @Input()
  capacities: number[] = [];

  // ==================================================
  // OUTPUT GỬI LÊN COMPONENT CHA
  // ==================================================

  /*
   * Báo component cha đóng form.
   */
  @Output()
  closed =
    new EventEmitter<void>();

  /*
   * Gửi dữ liệu bàn vừa cập nhật
   * lên component cha.
   */
  @Output()
  updated =
    new EventEmitter<
      UpdatedRestaurantTable
    >();

  // ==================================================
  // DỮ LIỆU FORM
  // ==================================================

  form:
    UpdateRestaurantTableRequest = {
      tableName: '',
      capacity: 4,
      tableType: '',
      areaName: '',
      status: 0,
      note: ''
    };

  /*
   * Mã bàn không được chỉnh sửa.
   */
  tableId = '';

  /*
   * QR Code hiện tại lấy từ backend.
   */
  currentQrCode = '';

  /*
   * QR xem trước.
   */
  qrGenerated = false;

  /*
   * Trạng thái đang gọi API.
   */
  isSubmitting = false;

  /*
   * Nội dung lỗi.
   */
  errorMessage = '';

  /*
   * Trạng thái chạy animation đóng form.
   */
  isClosing = false;

  /*
   * Thời gian phải trùng với CSS:
   * animation: update-modal-hide 0.25s
   */
  private closeAnimationDuration:
    number = 250;

  /*
   * Timer đóng modal.
   */
  private closeTimer:
    number | null = null;

  constructor(
    private readonly tableService:
      AdminTableManagementService
  ) {}

  // ==================================================
  // NHẬN DỮ LIỆU MỚI TỪ COMPONENT CHA
  // ==================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {
    /*
     * Khi component cha truyền bàn mới xuống,
     * sao chép dữ liệu vào form.
     */
    if (
      changes['table'] &&
      this.table
    ) {
      this.fillFormFromTable(
        this.table
      );
    }

    /*
     * Mỗi lần mở modal,
     * đảm bảo animation đóng đã được reset.
     */
    if (
      changes['isOpen'] &&
      this.isOpen
    ) {
      this.isClosing = false;

      this.errorMessage = '';

      if (this.table) {
        this.fillFormFromTable(
          this.table
        );
      }
    }
  }

  // ==================================================
  // HỦY TIMER
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
      this.tableId ||
      'A01'
    );
  }

  get previewName(): string {
    return (
      this.form.tableName
        .trim() ||
      `Bàn ${this.previewCode}`
    );
  }

  get previewArea(): string {
    return (
      this.form.areaName
        ?.trim() ||
      'Chưa phân khu'
    );
  }

  get previewCapacity(): number {
    return (
      Number(
        this.form.capacity
      ) || 1
    );
  }

  // ==================================================
  // THAY ĐỔI:
  // KHÔNG GHI CỨNG LOCALHOST:4200
  // ==================================================

  get previewQrUrl(): string {
    /*
     * Ưu tiên dùng nội dung QR từ backend.
     *
     * Nếu backend đã trả về QR Code thì giữ nguyên.
     */
    if (
      this.currentQrCode
    ) {
      return this.currentQrCode;
    }

    /*
     * Nếu backend chưa có nội dung QR,
     * tạo URL xem trước từ environment.apiUrl.
     *
     * Loại bỏ dấu "/" ở cuối clientUrl
     * để tránh tạo đường dẫn dạng:
     *
     * http://localhost:4200//order/A01
     */
    const clientUrl =
      environment.apiUrl
        .replace(
          /\/+$/,
          ''
        );

    return (
      `${clientUrl}/order/` +
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

  get statusLabel(): string {
    return this.getStatusLabel(
      this.form.status
    );
  }

  get statusClass(): string {
    return this.getStatusClass(
      this.form.status
    );
  }

  // ==================================================
  // DANH SÁCH SỨC CHỨA
  // ==================================================

  get capacityOptions(): number[] {
    /*
     * Gộp sức chứa hiện tại với các giá trị
     * phổ biến và loại bỏ phần tử trùng.
     */
    const values = [
      1,
      2,
      4,
      6,
      8,
      10,
      12,
      15,
      20,
      ...this.capacities,
      Number(this.form.capacity)
    ];

    return [
      ...new Set(
        values.filter(
          value =>
            Number.isFinite(value) &&
            value > 0
        )
      )
    ].sort(
      (first, second) =>
        first - second
    );
  }

  // ==================================================
  // TẠO QR XEM TRƯỚC
  // ==================================================

  generateQr(): void {
    if (
      this.isClosing ||
      this.isSubmitting
    ) {
      return;
    }

    this.errorMessage = '';

    if (!this.tableId.trim()) {
      this.errorMessage =
        'Không xác định được mã bàn.';

      return;
    }

    this.qrGenerated = true;
  }

  // ==================================================
  // ĐÓNG MODAL
  // ==================================================

  closeModal(): void {
    if (
      this.isSubmitting ||
      this.isClosing
    ) {
      return;
    }

    this.startClosingAnimation();
  }

  /*
   * Chỉ đóng khi click chính xác
   * vào phần nền mờ.
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

  private startClosingAnimation():
    void {

    if (this.isClosing) {
      return;
    }

    this.isClosing = true;

    if (
      this.closeTimer !== null
    ) {
      window.clearTimeout(
        this.closeTimer
      );

      this.closeTimer = null;
    }

    this.closeTimer =
      window.setTimeout(() => {
        this.isClosing = false;

        this.closeTimer = null;

        this.errorMessage = '';

        this.closed.emit();
      }, this.closeAnimationDuration);
  }

  // ==================================================
  // GỌI API CẬP NHẬT
  // ==================================================

  updateTable(): void {
    if (
      this.isClosing ||
      this.isSubmitting
    ) {
      return;
    }

    this.errorMessage = '';

    const validationMessage =
      this.validateForm();

    if (validationMessage) {
      this.errorMessage =
        validationMessage;

      return;
    }

    const request:
      UpdateRestaurantTableRequest = {
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

        status:
          Number(
            this.form.status
          ) as RestaurantTableStatus,

        note:
          this.form.note
            ?.trim() ||
          null
      };

    this.isSubmitting = true;

    this.tableService
      .updateRestaurantTable(
        this.tableId,
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
              'Cập nhật bàn thất bại.';

            return;
          }

          /*
           * Gửi dữ liệu bàn vừa cập nhật
           * lên component cha.
           */
          this.updated.emit(
            response.data
          );

          // ==================================================
          // THAY ĐỔI:
          // TOAST THÀNH CÔNG DÙNG GIAO DIỆN CHUNG
          // ==================================================

          Swal.fire({
            toast: true,

            position:
              'top-end',

            icon:
              'success',

            title:
              response.message ||
              `Cập nhật bàn ${this.tableId} thành công.`,

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
           * Đóng modal bằng animation.
           */
          this.startClosingAnimation();
        },

        error: error => {
          console.error(
            'Lỗi cập nhật bàn:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            error.error?.title ||
            'Không thể cập nhật thông tin bàn.';

          // ==================================================
          // THAY ĐỔI:
          // TOAST LỖI DÙNG GIAO DIỆN CHUNG
          // ==================================================

          Swal.fire({
            toast: true,

            position:
              'top-end',

            icon:
              'error',

            title:
              this.errorMessage,

            showConfirmButton:
              false,

            timer:
              2800,

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
        }
      });
  }

  // ==================================================
  // COPY LINK QR
  // ==================================================

  copyQrUrl(): void {
    if (!this.previewQrUrl) {
      return;
    }

    navigator.clipboard
      .writeText(
        this.previewQrUrl
      )
      .then(() => {
        // ==================================================
        // THAY ĐỔI:
        // TOAST COPY THÀNH CÔNG
        // ==================================================

        Swal.fire({
          toast: true,

          position:
            'top-end',

          icon:
            'success',

          title:
            'Đã sao chép đường dẫn QR.',

          showConfirmButton:
            false,

          timer:
            1500,

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
      })
      .catch(() => {
        // ==================================================
        // THAY ĐỔI:
        // TOAST COPY THẤT BẠI
        // ==================================================

        Swal.fire({
          toast: true,

          position:
            'top-end',

          icon:
            'error',

          title:
            'Không thể sao chép đường dẫn.',

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
      });
  }

  // ==================================================
  // STATUS
  // ==================================================

  getStatusLabel(
    status: number
  ): string {
    switch (status) {
      case 0:
        return 'Trống';

      case 1:
        return 'Đang phục vụ';

      case 2:
        return 'Đang bảo trì';

      case 3:
        return 'Đã đặt trước';

      case 4:
        return 'Tạm khóa';

      default:
        return 'Không xác định';
    }
  }

  getStatusClass(
    status: number
  ): string {
    switch (status) {
      case 0:
        return 'available';

      case 1:
        return 'serving';

      case 2:
        return 'maintenance';

      case 3:
        return 'reserved';

      case 4:
        return 'locked';

      default:
        return 'unknown';
    }
  }

  // ==================================================
  // ĐỔ DỮ LIỆU BÀN VÀO FORM
  // ==================================================

  private fillFormFromTable(
    table: RestaurantTableDetail
  ): void {
    this.tableId =
      table.id;

    this.currentQrCode =
      table.qrCode ||
      '';

    this.form = {
      tableName:
        table.tableName,

      capacity:
        table.capacity,

      tableType:
        table.tableType,

      areaName:
        table.areaName ||
        '',

      status:
        table.status,

      note:
        table.note ||
        ''
    };

    /*
     * Nếu backend đã có QR thì hiển thị luôn.
     */
    this.qrGenerated =
      Boolean(
        table.qrCode
      );

    this.errorMessage = '';
  }

  // ==================================================
  // VALIDATE FRONTEND
  // ==================================================

  private validateForm():
    string | null {

    if (!this.tableId.trim()) {
      return (
        'Không xác định được mã bàn.'
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
      this.form.status < 0 ||
      this.form.status > 4
    ) {
      return (
        'Trạng thái bàn không hợp lệ.'
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
}