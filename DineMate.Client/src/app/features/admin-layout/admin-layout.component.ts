import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { filter } from 'rxjs';

interface AdminMenuItem {
  label: string;
  icon: string;
  route: string;
  pageNumber?: number;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent
  implements OnDestroy {

  // ==================================================
  // TRẠNG THÁI SIDEBAR
  // ==================================================

  /*
   * Trạng thái mở sidebar trên tablet/mobile.
   */
  sidebarOpen = false;

  /*
   * true:
   * Sidebar luôn mở rộng.
   *
   * false:
   * Sidebar thu gọn.
   * Khi rê chuột vào thì mở rộng tạm thời.
   */
  sidebarPinned = true;

  /*
   * Kiểm tra chuột có đang nằm
   * trên sidebar hay không.
   */
  sidebarHovered = false;

  /*
   * Trạng thái dropdown tài khoản.
   */
  accountMenuOpen = false;

  // ==================================================
  // THÔNG TIN TRANG
  // ==================================================

  pageTitle = 'Dashboard';
  pageNumber = 1;

  adminName = 'Admin';
  adminRole = 'Quản trị viên';

  notificationCount = 3;

  // ==================================================
  // ĐỒNG HỒ
  // ==================================================

  /*
   * Thời gian dạng chữ.
   */
  currentTime = '';
  currentDate = '';
  currentWeekday = '';

  /*
   * Góc quay của các kim đồng hồ.
   */
  clockHourRotation = 0;
  clockMinuteRotation = 0;
  clockSecondRotation = 0;

  /*
   * Lưu ID của setInterval để xóa khi
   * component bị hủy.
   */
  private clockIntervalId:
    ReturnType<typeof setInterval> | null =
      null;

  // ==================================================
  // MENU SIDEBAR
  // ==================================================

// ==================================================
// MENU SIDEBAR
// ==================================================

menuItems: AdminMenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/admin/dashboard',
    pageNumber: 1
  },

  {
    label: 'Quản lý bàn',
    icon: 'table_restaurant',
    route: '/admin/tables',
    pageNumber: 2
  },

  // ==================================================
  // THÊM MỚI:
  // QUẢN LÝ LOẠI MÓN
  //
  // Trang này quản lý các nhóm như:
  // - Đồ ăn
  // - Đồ uống
  // - Lẩu
  // - Nướng
  // - Combo
  // - Tráng miệng
  // ==================================================

  {
    label: 'Quản lý loại',
    icon: 'category',
    route: '/admin/categories',
    pageNumber: 3
  },

  /*
   * Quản lý các món cụ thể thuộc từng loại.
   *
   * Ví dụ:
   * - Cơm chiên
   * - Lẩu Thái
   * - Coca-Cola
   * - Trà đào
   */
  {
    label: 'Quản lý món ăn',
    icon: 'restaurant',
    route: '/admin/foods',
    pageNumber: 4
  },

  {
    label: 'Đơn hàng',
    icon: 'receipt_long',
    route: '/admin/orders',
    pageNumber: 5
  },

  {
    label: 'Màn hình bếp',
    icon: 'soup_kitchen',
    route: '/admin/kitchen',
    pageNumber: 6
  },

  {
    label: 'Thanh toán',
    icon: 'payments',
    route: '/admin/payments',
    pageNumber: 7
  },

  {
    label: 'Nhân viên',
    icon: 'groups',
    route: '/admin/employees',
    pageNumber: 8
  },

  {
    label: 'Phân quyền',
    icon: 'shield_person',
    route: '/admin/permissions',
    pageNumber: 9
  }
];

  constructor(
    private readonly router: Router,
    private readonly ngZone: NgZone,
    private readonly changeDetectorRef:
      ChangeDetectorRef
  ) {
    /*
     * Khôi phục trạng thái ghim sidebar.
     */
    this.restoreSidebarPinState();

    /*
     * Hiển thị thời gian ngay khi mở trang.
     */
    this.updateClock();

    /*
     * Cập nhật đồng hồ mỗi giây.
     *
     * NgZone.run() đảm bảo Angular nhận biết
     * dữ liệu đã thay đổi và cập nhật HTML.
     *
     * Vì vậy đồng hồ sẽ chạy liên tục,
     * không cần hover vào sidebar.
     */
    this.clockIntervalId =
      setInterval(() => {
        this.ngZone.run(() => {
          this.updateClock();

          /*
           * Báo cho Angular kiểm tra và
           * cập nhật lại giao diện.
           */
          this.changeDetectorRef
            .markForCheck();
        });
      }, 1000);

    /*
     * Cập nhật tiêu đề theo URL hiện tại.
     */
    this.updatePageInformation(
      this.router.url
    );

    /*
     * Theo dõi sự kiện chuyển route.
     */
    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(event => {
        const navigation =
          event as NavigationEnd;

        this.updatePageInformation(
          navigation.urlAfterRedirects
        );

        /*
         * Sau khi chọn menu trên mobile
         * thì đóng sidebar.
         */
        this.sidebarOpen = false;

        /*
         * Đóng dropdown tài khoản
         * sau khi chuyển trang.
         */
        this.accountMenuOpen = false;
      });
  }

  // ==================================================
  // SIDEBAR CÓ ĐANG MỞ RỘNG KHÔNG
  // ==================================================

  get sidebarExpanded(): boolean {
    /*
     * Sidebar mở rộng khi:
     *
     * - Đang được ghim.
     * - Hoặc người dùng đang hover.
     */
    return (
      this.sidebarPinned ||
      this.sidebarHovered
    );
  }

  // ==================================================
  // SIDEBAR MOBILE
  // ==================================================

  toggleSidebar(): void {
    this.sidebarOpen =
      !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  // ==================================================
  // GHIM SIDEBAR
  // ==================================================

  toggleSidebarPin(): void {
    this.sidebarPinned =
      !this.sidebarPinned;

    /*
     * Lưu trạng thái ghim để sau khi
     * tải lại trang vẫn giữ nguyên.
     */
    localStorage.setItem(
      'adminSidebarPinned',
      String(this.sidebarPinned)
    );
  }

  onSidebarMouseEnter(): void {
    this.sidebarHovered = true;
  }

  onSidebarMouseLeave(): void {
    this.sidebarHovered = false;
  }

  private restoreSidebarPinState(): void {
    const savedPinState =
      localStorage.getItem(
        'adminSidebarPinned'
      );

    /*
     * Nếu chưa từng lưu trạng thái,
     * mặc định sidebar được ghim.
     */
    if (savedPinState === null) {
      this.sidebarPinned = true;
      return;
    }

    this.sidebarPinned =
      savedPinState === 'true';
  }

  // ==================================================
  // MENU TÀI KHOẢN
  // ==================================================

  toggleAccountMenu(): void {
    this.accountMenuOpen =
      !this.accountMenuOpen;
  }

  goToProfile(): void {
    this.accountMenuOpen = false;

    this.router.navigate([
      '/admin/profile'
    ]);
  }

  goToSettings(): void {
    this.accountMenuOpen = false;

    this.router.navigate([
      '/admin/settings'
    ]);
  }

  logout(): void {
    /*
     * Sau này gọi API logout tại đây:
     *
     * this.authService.logout().subscribe({
     *   next: () => {
     *     this.router.navigate(['/login']);
     *   }
     * });
     */

    this.accountMenuOpen = false;

    this.router.navigate([
      '/login'
    ]);
  }

  // ==================================================
  // CẬP NHẬT ĐỒNG HỒ
  // ==================================================

  private updateClock(): void {
    const now =
      new Date();

    /*
     * Ví dụ:
     * 12:30:45
     */
    this.currentTime =
      now.toLocaleTimeString(
        'vi-VN',
        {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }
      );

    /*
     * Ví dụ:
     * 12/07/2026
     */
    this.currentDate =
      now.toLocaleDateString(
        'vi-VN',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }
      );

    /*
     * Ví dụ:
     * Chủ Nhật
     */
    this.currentWeekday =
      now.toLocaleDateString(
        'vi-VN',
        {
          weekday: 'long'
        }
      );

    const hours =
      now.getHours() % 12;

    const minutes =
      now.getMinutes();

    const seconds =
      now.getSeconds();

    /*
     * Kim giờ:
     *
     * Mỗi giờ = 30 độ.
     * Mỗi phút làm kim giờ dịch thêm 0,5 độ.
     */
    this.clockHourRotation =
      hours * 30 +
      minutes * 0.5;

    /*
     * Kim phút:
     *
     * Mỗi phút = 6 độ.
     * Mỗi giây làm kim phút dịch thêm 0,1 độ.
     */
    this.clockMinuteRotation =
      minutes * 6 +
      seconds * 0.1;

    /*
     * Kim giây:
     *
     * Mỗi giây = 6 độ.
     */
    this.clockSecondRotation =
      seconds * 6;
  }

  // ==================================================
  // CẬP NHẬT THÔNG TIN TRANG
  // ==================================================

  private updatePageInformation(
    currentUrl: string
  ): void {
    const matchedMenu =
      this.menuItems.find(menu =>
        currentUrl.startsWith(
          menu.route
        )
      );

    if (!matchedMenu) {
      this.pageTitle =
        'Quản trị hệ thống';

      this.pageNumber = 1;

      return;
    }

    this.pageTitle =
      matchedMenu.label;

    this.pageNumber =
      matchedMenu.pageNumber ?? 1;
  }

  // ==================================================
  // HỦY INTERVAL KHI COMPONENT BỊ HỦY
  // ==================================================

  ngOnDestroy(): void {
    if (
      this.clockIntervalId !== null
    ) {
      clearInterval(
        this.clockIntervalId
      );

      this.clockIntervalId = null;
    }
  }
}