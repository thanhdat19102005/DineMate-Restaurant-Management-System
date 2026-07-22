import { CommonModule } from '@angular/common';

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';

import {
  finalize
} from 'rxjs';

import Swal from 'sweetalert2';

import {
  AdminTableManagementService,
  DeleteRestaurantTableResponse,
  RestaurantTableItem
} from '../admin-table-management.service';

/*
 * Dữ liệu component con gửi về component cha
 * sau khi xóa thành công.
 */
export interface DeletedRestaurantTableEvent {
  id: string;
  message: string;
}

@Component({
  selector:
    'app-delete-restaurant-table',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './delete-restaurant-table.component.html',

  styleUrl:
    './delete-restaurant-table.component.css'
})
export class DeleteRestaurantTableComponent
  implements OnDestroy {

  // ==================================================
  // NHẬN TRẠNG THÁI MỞ TỪ COMPONENT CHA
  // ==================================================

  /*
   * true:
   * Hiển thị form xác nhận xóa.
   *
   * false:
   * Ẩn form xác nhận xóa.
   */
  @Input()
  isOpen = false;

  // ==================================================
  // NHẬN BÀN CẦN XÓA TỪ COMPONENT CHA
  // ==================================================

  /*
   * Component cha truyền đối tượng bàn
   * đang được chọn để xóa vào đây.
   */
  @Input()
  table:
    RestaurantTableItem | null =
      null;

  // ==================================================
  // GỬI SỰ KIỆN ĐÓNG LÊN COMPONENT CHA
  // ==================================================

  @Output()
  closed =
    new EventEmitter<void>();

  // ==================================================
  // GỬI KẾT QUẢ XÓA THÀNH CÔNG LÊN CHA
  // ==================================================

  @Output()
  deleted =
    new EventEmitter<
      DeletedRestaurantTableEvent
    >();

  // ==================================================
  // TRẠNG THÁI XỬ LÝ
  // ==================================================

  /*
   * true:
   * Đang gọi API xóa bàn.
   */
  isDeleting = false;

  /*
   * true:
   * Modal đang chạy animation đóng.
   */
  isClosing = false;

  /*
   * Nội dung lỗi từ frontend hoặc backend.
   */
  errorMessage = '';

  /*
   * Thời gian phải trùng với CSS:
   *
   * animation: delete-modal-hide 0.25s;
   */
  private closeAnimationDuration:
    number = 250;

  /*
   * Timer dùng để chờ animation kết thúc.
   */
  private closeTimer:
    number | null = null;

  constructor(
    private readonly tableService:
      AdminTableManagementService
  ) {}

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
  // DỮ LIỆU HIỂN THỊ
  // ==================================================

  get tableId(): string {
    return (
      this.table?.id ||
      ''
    );
  }

  get tableName(): string {
    return (
      this.table?.tableName ||
      ''
    );
  }

  get tableArea(): string {
    return (
      this.table?.areaName ||
      'Chưa phân khu'
    );
  }

  get tableCapacity(): number {
    return (
      this.table?.capacity ||
      0
    );
  }

  get tableStatusName(): string {
    return (
      this.table?.statusName ||
      'Không xác định'
    );
  }

  // ==================================================
  // ĐÓNG MODAL
  // ==================================================

  closeModal(): void {
    /*
     * Không cho đóng khi API đang xóa.
     */
    if (
      this.isDeleting ||
      this.isClosing
    ) {
      return;
    }

    this.startClosingAnimation(
      false
    );
  }

  /*
   * Chỉ đóng khi nhấn trực tiếp vào nền mờ.
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
  // ANIMATION ĐÓNG
  // ==================================================

  private startClosingAnimation(
    deleteSucceeded: boolean,
    responseMessage: string = ''
  ): void {
    if (
      this.isClosing
    ) {
      return;
    }

    this.isClosing = true;

    if (
      this.closeTimer !== null
    ) {
      window.clearTimeout(
        this.closeTimer
      );
    }

    this.closeTimer =
      window.setTimeout(() => {
        const deletedTableId =
          this.tableId;

        this.isClosing = false;

        this.closeTimer = null;

        this.errorMessage = '';

        /*
         * Nếu xóa thành công,
         * gửi thông tin bàn đã xóa lên cha.
         */
        if (
          deleteSucceeded
        ) {
          this.deleted.emit({
            id:
              deletedTableId,

            message:
              responseMessage ||
              `Xóa bàn ${deletedTableId} thành công.`
          });

          return;
        }

        /*
         * Nếu người dùng chỉ nhấn Hủy,
         * gửi sự kiện đóng.
         */
        this.closed.emit();
      }, this.closeAnimationDuration);
  }

  // ==================================================
  // XÓA BÀN
  // ==================================================

  confirmDelete(): void {
    /*
     * Không gọi lại API khi:
     *
     * - Đang xóa.
     * - Modal đang đóng.
     */
    if (
      this.isDeleting ||
      this.isClosing
    ) {
      return;
    }

    this.errorMessage = '';

    if (
      !this.table
    ) {
      this.errorMessage =
        'Không tìm thấy thông tin bàn cần xóa.';

      return;
    }

    /*
     * Không cho phép xóa bàn đang phục vụ.
     *
     * Backend vẫn phải kiểm tra lại,
     * nhưng frontend cảnh báo trước.
     */
    if (
      this.table.status === 1
    ) {
      this.errorMessage =
        `Bàn ${this.table.id} đang phục vụ. ` +
        `Vui lòng chuyển trạng thái bàn trước khi xóa.`;

      return;
    }

    this.isDeleting = true;

    this.tableService
      .deleteRestaurantTable(
        this.table.id
      )
      .pipe(
        finalize(() => {
          this.isDeleting = false;
        })
      )
      .subscribe({
        next: (
          response:
            DeleteRestaurantTableResponse
        ) => {
          if (
            !response.success
          ) {
            this.errorMessage =
              response.message ||
              'Xóa bàn thất bại.';

            return;
          }

          /*
           * Hiển thị thông báo thành công.
           */
          Swal.fire({
            toast: true,

            position:
              'top-end',

            icon:
              'success',

            title:
              response.message ||
              `Xóa bàn ${this.tableId} thành công.`,

            showConfirmButton:
              false,

            timer:
              1800,

            timerProgressBar:
              true,

            // ==================================================
            // BỔ SUNG:
            // DÙNG CHUNG GIAO DIỆN TOAST VỚI CREATE VÀ UPDATE
            // ==================================================

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
           * Chạy animation đóng trước,
           * sau đó báo cho component cha.
           */
          this.startClosingAnimation(
            true,
            response.message
          );
        },

        error: error => {
          console.error(
            'Lỗi xóa bàn:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            error.error?.title ||
            'Không thể xóa bàn.';
        }
      });
  }
}