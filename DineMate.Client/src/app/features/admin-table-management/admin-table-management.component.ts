import { CommonModule } from '@angular/common';

import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  finalize,
  takeUntil
} from 'rxjs';

import Swal from 'sweetalert2';

import {
  AdminTableManagementService,
  CreatedRestaurantTable,
  RestaurantTableDetail,
  RestaurantTableHistory,
  RestaurantTableItem,
  RestaurantTableStatistics,
  UpdatedRestaurantTable
} from './admin-table-management.service';

import {
  CreateRestaurantTableComponent
} from './create-restaurant-table/create-restaurant-table.component';

import {
  DeleteRestaurantTableComponent,
  DeletedRestaurantTableEvent
} from './delete-restaurant-table/delete-restaurant-table.component';

import {
  UpdateRestaurantTableComponent
} from './update-restaurant-table/update-restaurant-table.component';

interface StatusStatistic {
  label: string;
  value: number;
  percentage: number;
  icon: string;
  cssClass: string;
}

@Component({
  selector:
    'app-admin-table-management',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    CreateRestaurantTableComponent,
    DeleteRestaurantTableComponent,
    UpdateRestaurantTableComponent
  ],

  templateUrl:
    './admin-table-management.component.html',

  styleUrl:
    './admin-table-management.component.css'
})
export class AdminTableManagementComponent
  implements OnInit, OnDestroy {

  searchKeyword = '';
  selectedArea = '';

  selectedStatus:
    number | null = null;

  selectedCapacity:
    number | null = null;

  currentPage = 1;
  pageSize = 8;
  totalItems = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  pageSizeOptions = [
    5,
    8,
    10,
    20
  ];

  tables:
    RestaurantTableItem[] = [];

  selectedTable:
    RestaurantTableDetail | null =
      null;

  histories:
    RestaurantTableHistory[] = [];

  areas: string[] = [];
  capacities: number[] = [];

  tableStatistics:
    RestaurantTableStatistics = {
      total: 0,
      empty: 0,
      serving: 0,
      maintenance: 0,
      reserved: 0,
      locked: 0,
      emptyPercentage: 0,
      servingPercentage: 0,
      maintenancePercentage: 0,
      reservedPercentage: 0,
      lockedPercentage: 0
    };

  isLoading = false;
  errorMessage = '';

  isCreateTableOpen = false;

  isDeleteTableOpen = false;

  tableWaitingDelete:
    RestaurantTableItem | null =
      null;

  deletingHistoryId:
    number | null =
      null;

  isUpdateTableOpen = false;

  tableBeingUpdated:
    RestaurantTableDetail | null =
      null;

  private readonly searchSubject =
    new Subject<string>();

  private readonly destroy$ =
    new Subject<void>();

  constructor(
    private readonly tableService:
      AdminTableManagementService
  ) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadManagementData();
      });

    this.loadManagementData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.tableWaitingDelete =
      null;

    this.deletingHistoryId =
      null;
  }

  loadManagementData(
    selectedTableId?: string
  ): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tableService
      .getManagementData({
        search:
          this.searchKeyword,

        areaName:
          this.selectedArea ||
          undefined,

        status:
          this.selectedStatus,

        capacity:
          this.selectedCapacity,

        pageNumber:
          this.currentPage,

        pageSize:
          this.pageSize,

        selectedTableId,

        historySize: 10
      })
      .pipe(
        takeUntil(this.destroy$),

        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: response => {
          const data =
            response.data;

          this.tableStatistics =
            data.statistics;

          this.tables =
            data.tables.items;

          this.currentPage =
            data.tables.pageNumber;

          this.pageSize =
            data.tables.pageSize;

          this.totalItems =
            data.tables.totalItems;

          this.totalPages =
            data.tables.totalPages;

          this.hasPreviousPage =
            data.tables.hasPreviousPage;

          this.hasNextPage =
            data.tables.hasNextPage;

          this.selectedTable =
            data.selectedTable ?? null;

          this.histories =
            data.histories;

          this.areas =
            data.areas;

          this.capacities =
            data.capacities;
        },

        error: error => {
          console.error(
            'Lỗi tải dữ liệu quản lý bàn:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Không thể tải dữ liệu quản lý bàn.';

          this.tables = [];
          this.selectedTable = null;
        }
      });
  }

  onSearchChange(
    value: string
  ): void {
    this.searchKeyword = value;
    this.searchSubject.next(value);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadManagementData();
  }

  get visiblePages(): number[] {
    if (this.totalPages <= 0) {
      return [];
    }

    const pages: number[] = [];

    let start =
      Math.max(
        1,
        this.currentPage - 2
      );

    const end =
      Math.min(
        this.totalPages,
        start + 4
      );

    start =
      Math.max(
        1,
        end - 4
      );

    for (
      let page = start;
      page <= end;
      page++
    ) {
      pages.push(page);
    }

    return pages;
  }

  get firstDisplayedItem(): number {
    if (this.totalItems === 0) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.pageSize +
      1
    );
  }

  get lastDisplayedItem(): number {
    return Math.min(
      this.currentPage *
        this.pageSize,
      this.totalItems
    );
  }

  changePage(
    page: number
  ): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.loadManagementData();
  }

  onPageSizeChange(): void {
    this.pageSize =
      Number(this.pageSize);

    this.currentPage = 1;
    this.loadManagementData();
  }

  selectTable(
    table: RestaurantTableItem
  ): void {
    if (
      this.selectedTable?.id ===
      table.id
    ) {
      return;
    }

    this.loadManagementData(
      table.id
    );
  }

  isSelectedTable(
    table: RestaurantTableItem
  ): boolean {
    return (
      this.selectedTable?.id ===
      table.id
    );
  }

  viewTable(
    table: RestaurantTableItem,
    event?: MouseEvent
  ): void {
    event?.stopPropagation();
    this.selectTable(table);
  }

  get statistics():
    StatusStatistic[] {

    return [
      {
        label: 'Tổng số bàn',
        value:
          this.tableStatistics.total,
        percentage:
          this.tableStatistics.total > 0
            ? 100
            : 0,
        icon:
          'table_restaurant',
        cssClass:
          'total'
      },
      {
        label:
          'Bàn trống',
        value:
          this.tableStatistics.empty,
        percentage:
          this.tableStatistics
            .emptyPercentage,
        icon:
          'chair',
        cssClass:
          'available'
      },
      {
        label:
          'Bàn đang phục vụ',
        value:
          this.tableStatistics.serving,
        percentage:
          this.tableStatistics
            .servingPercentage,
        icon:
          'room_service',
        cssClass:
          'serving'
      },
      {
        label:
          'Bàn đã đặt trước',
        value:
          this.tableStatistics.reserved,
        percentage:
          this.tableStatistics
            .reservedPercentage,
        icon:
          'event_available',
        cssClass:
          'reserved'
      },
      {
        label:
          'Bàn tạm khóa',
        value:
          this.tableStatistics.locked,
        percentage:
          this.tableStatistics
            .lockedPercentage,
        icon:
          'lock',
        cssClass:
          'locked'
      }
    ];
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

  getHistoryClass(
    actionType: string
  ): string {
    switch (
      actionType
        .trim()
        .toUpperCase()
    ) {
      case 'CREATE':
        return 'create';
      case 'DELETE':
        return 'delete';
      case 'STATUS_CHANGE':
      case 'LOCK':
      case 'UNLOCK':
      case 'RESERVE':
        return 'status';
      default:
        return 'update';
    }
  }

  getHistoryChangeSummary(
    history:
      RestaurantTableHistory
  ): string {
    const oldData =
      this.parseJson(
        history.oldData
      );

    const newData =
      this.parseJson(
        history.newData
      );

    if (
      oldData?.['status'] !==
        undefined &&
      newData?.['status'] !==
        undefined
    ) {
      return (
        `Từ ${this.getStatusLabel(
          Number(
            oldData['status']
          )
        )} → ${this.getStatusLabel(
          Number(
            newData['status']
          )
        )}`
      );
    }

    if (
      oldData?.['capacity'] !==
        undefined &&
      newData?.['capacity'] !==
        undefined
    ) {
      return (
        `Thay đổi sức chứa: ` +
        `${oldData['capacity']} → ` +
        `${newData['capacity']}`
      );
    }

    if (
      oldData?.['tableName'] &&
      newData?.['tableName']
    ) {
      return (
        `Từ “${oldData['tableName']}” ` +
        `→ “${newData['tableName']}”`
      );
    }

    if (
      !oldData &&
      newData
    ) {
      const parts:
        string[] = [];

      if (
        newData['areaName']
      ) {
        parts.push(
          `Khu vực: ` +
          `${newData['areaName']}`
        );
      }

      if (
        newData['capacity'] !==
        undefined
      ) {
        parts.push(
          `Sức chứa: ` +
          `${newData['capacity']}`
        );
      }

      return (
        parts.join(', ') ||
        'Đã tạo dữ liệu bàn mới.'
      );
    }

    if (
      oldData &&
      !newData
    ) {
      return (
        oldData['note']
          ? `Ghi chú: ${oldData['note']}`
          : 'Dữ liệu bàn đã được xóa.'
      );
    }

    return (
      history.restaurantTableId
        ? `Mã bàn: ` +
          `${history.restaurantTableId}`
        : 'Thao tác hệ thống'
    );
  }

  private parseJson(
    value?: string | null
  ): Record<string, unknown> | null {
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(
        value
      ) as Record<
        string,
        unknown
      >;
    }
    catch {
      return null;
    }
  }

  isDeletingHistory(
    history:
      RestaurantTableHistory
  ): boolean {
    return (
      this.deletingHistoryId ===
      history.id
    );
  }

  async deleteHistory(
    history:
      RestaurantTableHistory,

    event?:
      MouseEvent
  ): Promise<void> {
    event?.stopPropagation();

    if (
      this.deletingHistoryId !==
      null
    ) {
      return;
    }

    const formattedDate =
      this.formatHistoryDate(
        history.createdAt
      );

    const safeUserName =
      this.escapeHtml(
        history.userName ||
        'Hệ thống'
      );

    const safeDescription =
      this.escapeHtml(
        history.description ||
        'Không có nội dung'
      );

    const safeSummary =
      this.escapeHtml(
        this.getHistoryChangeSummary(
          history
        )
      );

    const result =
      await Swal.fire({
        html: `
          <div class="restaurant-delete-content">
            <div class="restaurant-delete-icon">
              <span class="material-symbols-outlined">
                warning
              </span>
            </div>

            <h2 class="restaurant-delete-title">
              Xóa
              <span class="restaurant-delete-code">
                lịch sử
              </span>
              hoạt động?
            </h2>

            <p class="restaurant-delete-question">
              Bạn có chắc chắn muốn xóa lịch sử này?
            </p>

            <p class="restaurant-delete-unrecoverable">
              Thao tác này không thể hoàn tác.
            </p>

            <div class="history-delete-information">
              <div class="history-delete-information-row">
                <span class="material-symbols-outlined">
                  calendar_month
                </span>

                <span class="history-delete-information-label">
                  Thời gian:
                </span>

                <strong>
                  ${formattedDate}
                </strong>
              </div>

              <div class="history-delete-information-row">
                <span class="material-symbols-outlined">
                  person
                </span>

                <span class="history-delete-information-label">
                  Nhân viên:
                </span>

                <strong>
                  ${safeUserName}
                </strong>
              </div>

              <div class="history-delete-information-row">
                <span class="material-symbols-outlined">
                  description
                </span>

                <span class="history-delete-information-label">
                  Nội dung:
                </span>

                <strong>
                  ${safeDescription}
                </strong>
              </div>

              <div class="history-delete-information-row">
                <span class="material-symbols-outlined">
                  info
                </span>

                <span class="history-delete-information-label">
                  Chi tiết:
                </span>

                <strong>
                  ${safeSummary}
                </strong>
              </div>
            </div>

            <div class="restaurant-delete-notice">
              <span class="material-symbols-outlined">
                info
              </span>

              <span>
                Khi xóa, bản ghi lịch sử sẽ bị loại
                khỏi hệ thống và không thể khôi phục.
              </span>
            </div>
          </div>
        `,

        showCancelButton:
          true,

        showConfirmButton:
          true,

        confirmButtonText: `
          <span class="material-symbols-outlined">
            delete
          </span>

          <span>
            Xóa lịch sử
          </span>
        `,

        cancelButtonText: `
          <span class="material-symbols-outlined">
            close
          </span>

          <span>
            Hủy
          </span>
        `,

        buttonsStyling:
          false,

        focusCancel:
          true,

        allowOutsideClick:
          false,

        allowEscapeKey:
          true,

        heightAuto:
          false,

        scrollbarPadding:
          false,

        returnFocus:
          false,

        customClass: {
          container:
            'restaurant-delete-container',

          popup:
            'restaurant-delete-popup',

          htmlContainer:
            'restaurant-delete-html',

          actions:
            'restaurant-delete-actions',

          confirmButton:
            'restaurant-delete-confirm-button',

          cancelButton:
            'restaurant-delete-cancel-button'
        },

        showClass: {
          popup:
            'restaurant-delete-show'
        },

        hideClass: {
          popup:
            'restaurant-delete-hide'
        }
      });

    if (
      !result.isConfirmed
    ) {
      return;
    }

    this.deletingHistoryId =
      history.id;

    this.errorMessage =
      '';

    this.tableService
      .deleteRestaurantTableHistory(
        history.id
      )
      .pipe(
        takeUntil(
          this.destroy$
        ),

        finalize(() => {
          this.deletingHistoryId =
            null;
        })
      )
      .subscribe({
        next: response => {
          if (
            !response.success
          ) {
            this.errorMessage =
              response.message ||
              'Xóa lịch sử hoạt động thất bại.';

            return;
          }

          this.histories =
            this.histories.filter(
              item =>
                item.id !==
                history.id
            );

          Swal.fire({
            toast:
              true,

            position:
              'top-end',

            icon:
              'success',

            title:
              response.message ||
              'Xóa lịch sử hoạt động thành công.',

            showConfirmButton:
              false,

            timer:
              1800,

            timerProgressBar:
              true,

            heightAuto:
              false,

            scrollbarPadding:
              false,

            returnFocus:
              false,

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
        },

        error: error => {
          console.error(
            'Lỗi xóa lịch sử hoạt động:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            error.error?.title ||
            'Không thể xóa lịch sử hoạt động.';

          Swal.fire({
            toast:
              true,

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

            heightAuto:
              false,

            scrollbarPadding:
              false,

            returnFocus:
              false,

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

  private formatHistoryDate(
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
      return this.escapeHtml(
        value
      );
    }

    return date.toLocaleString(
      'vi-VN',
      {
        day:
          '2-digit',

        month:
          '2-digit',

        year:
          'numeric',

        hour:
          '2-digit',

        minute:
          '2-digit',

        second:
          '2-digit',

        hour12:
          false
      }
    );
  }

  private escapeHtml(
    value:
      string
  ): string {
    return value
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

  addTable(): void {
    this.isCreateTableOpen =
      true;
  }

  closeCreateTable(): void {
    this.isCreateTableOpen =
      false;
  }

  onTableCreated(
    table:
      CreatedRestaurantTable
  ): void {
    this.isCreateTableOpen =
      false;

    this.currentPage = 1;

    this.loadManagementData(
      table.id
    );
  }

  editTable(
    table: RestaurantTableItem,
    event?: MouseEvent
  ): void {
    event?.stopPropagation();

    if (
      this.selectedTable?.id ===
      table.id
    ) {
      this.tableBeingUpdated =
        this.selectedTable;

      this.isUpdateTableOpen =
        true;

      return;
    }

    this.isLoading = true;

    this.tableService
      .getManagementData({
        search:
          this.searchKeyword,

        areaName:
          this.selectedArea ||
          undefined,

        status:
          this.selectedStatus,

        capacity:
          this.selectedCapacity,

        pageNumber:
          this.currentPage,

        pageSize:
          this.pageSize,

        selectedTableId:
          table.id,

        historySize:
          10
      })
      .pipe(
        takeUntil(
          this.destroy$
        ),

        finalize(() => {
          this.isLoading =
            false;
        })
      )
      .subscribe({
        next: response => {
          const selected =
            response.data
              .selectedTable;

          if (!selected) {
            this.errorMessage =
              'Không tìm thấy thông tin bàn cần sửa.';

            return;
          }

          this.selectedTable =
            selected;

          this.tableBeingUpdated =
            selected;

          this.isUpdateTableOpen =
            true;
        },

        error: error => {
          console.error(
            'Lỗi tải bàn cần sửa:',
            error
          );

          this.errorMessage =
            error.error?.message ||
            'Không thể tải thông tin bàn cần sửa.';
        }
      });
  }

  closeUpdateTable(): void {
    this.isUpdateTableOpen =
      false;

    this.tableBeingUpdated =
      null;
  }

  onTableUpdated(
    table: UpdatedRestaurantTable
  ): void {
    this.isUpdateTableOpen =
      false;

    this.tableBeingUpdated =
      null;

    this.loadManagementData(
      table.id
    );
  }

  deleteTable(
    table: RestaurantTableItem,
    event?: MouseEvent
  ): void {
    event?.stopPropagation();

    if (
      table.status === 1
    ) {
      this.errorMessage =
        `Bàn ${table.id} đang phục vụ. ` +
        `Vui lòng chuyển trạng thái trước khi xóa.`;

      return;
    }

    this.tableWaitingDelete =
      table;

    this.isDeleteTableOpen =
      true;
  }

  closeDeleteTable(): void {
    this.isDeleteTableOpen =
      false;

    this.tableWaitingDelete =
      null;
  }

  onTableDeleted(
    event:
      DeletedRestaurantTableEvent
  ): void {
    this.isDeleteTableOpen =
      false;

    this.tableWaitingDelete =
      null;

    if (
      this.tables.length === 1 &&
      this.currentPage > 1
    ) {
      this.currentPage--;
    }

    if (
      this.selectedTable?.id ===
      event.id
    ) {
      this.selectedTable =
        null;
    }

    this.loadManagementData();
  }

  viewAllHistory(): void {
    console.log(
      'Xem tất cả lịch sử'
    );
  }

  retryLoad(): void {
    this.loadManagementData(
      this.selectedTable?.id
    );
  }

  trackByTableId(
    index: number,
    table: RestaurantTableItem
  ): string {
    return table.id;
  }

  trackByHistoryId(
    index: number,
    history:
      RestaurantTableHistory
  ): number {
    return history.id;
  }
}