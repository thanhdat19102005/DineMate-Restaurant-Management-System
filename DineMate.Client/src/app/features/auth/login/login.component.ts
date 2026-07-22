import { CommonModule } from '@angular/common';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit
} from '@angular/core';

import {
  FormsModule,
  NgForm
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import Swal from 'sweetalert2';

import {
  AuthService,
  GoogleLoginResponse,
  LoginRequest,
  LoginResponse,
  ProfileResponse
} from '../services/auth.service';


import {
  environment
} from '../../../environment/environment';






/*
 * Biến google được cung cấp bởi script:
 *
 * https://accounts.google.com/gsi/client
 *
 * Script này phải được thêm trong index.html.
 */
declare const google: any;

/*
 * Cấu trúc dữ liệu Google trả về
 * sau khi người dùng chọn tài khoản.
 */
interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
  clientId?: string;
}

@Component({
  selector:
    'app-login',

  standalone:
    true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './login.component.html',

  styleUrl:
    './login.component.css'
})
export class LoginComponent
  implements OnInit, AfterViewInit {

  emailOrPhone = '';

  password = '';

  rememberMe = false;

  showPassword = false;

  isLoading = false;

  /*
   * Trạng thái kiểm tra Cookie
   * khi mở trang đăng nhập.
   */
  isCheckingSession = true;

  errorMessage = '';

  /*
   * Google Client ID thật.
   *
   * Giá trị này phải giống với:
   *
   * appsettings.json:
   *
   * "GoogleAuth": {
   *   "ClientId": "..."
   * }
   */
  private readonly googleClientId =
  environment.googleClientId;

  constructor(
    private readonly authService:
      AuthService,

    private readonly router:
      Router,

    private readonly ngZone:
      NgZone,

    private readonly changeDetectorRef:
      ChangeDetectorRef
  ) {}

  // ==================================================
  // KIỂM TRA COOKIE KHI MỞ TRANG LOGIN
  // ==================================================

  ngOnInit(): void {
    /*
     * Bắt đầu kiểm tra phiên đăng nhập cũ.
     */
    this.isCheckingSession =
      true;

    this.authService
      .getProfile()
      .subscribe({
        next: (
          profile:
            ProfileResponse
        ) => {
          /*
           * Cookie accessToken hợp lệ.
           */
          this.isCheckingSession =
            false;

          /*
           * Ép Angular cập nhật giao diện ngay.
           */
          this.changeDetectorRef
            .detectChanges();

          console.log(
            'Phiên đăng nhập hiện tại hợp lệ:',
            profile
          );

          console.log(
            'Role trong phiên đăng nhập:',
            profile.roles
          );

          const normalizedRoles =
            this.normalizeRoles(
              profile.roles
            );

          /*
           * Cookie hợp lệ thì điều hướng
           * thẳng vào trang phù hợp.
           */
          this.redirectAfterLogin(
            normalizedRoles
          );
        },

        error: (
          error:
            HttpErrorResponse
        ) => {
          /*
           * Trường hợp:
           *
           * - Chưa đăng nhập.
           * - Không có Cookie.
           * - Cookie hết hạn.
           * - JWT không hợp lệ.
           *
           * Tắt trạng thái kiểm tra phiên
           * để người dùng có thể đăng nhập.
           */
          this.isCheckingSession =
            false;

          /*
           * Ép Angular cập nhật lại nút đăng nhập.
           *
           * Nút sẽ chuyển từ:
           * "Đang kiểm tra phiên..."
           *
           * về:
           * "Đăng nhập"
           */
          this.changeDetectorRef
            .detectChanges();

          console.log(
            'Chưa có phiên đăng nhập hợp lệ:',
            error.status
          );
        }
      });
  }

  // ==================================================
  // KHỞI TẠO GOOGLE SAU KHI HTML HIỂN THỊ
  // ==================================================

  ngAfterViewInit(): void {
    this.initializeGoogleLogin();
  }

  // ==================================================
  // HIỆN / ẨN MẬT KHẨU
  // ==================================================

  togglePassword(): void {
    if (
      this.isLoading ||
      this.isCheckingSession
    ) {
      return;
    }

    this.showPassword =
      !this.showPassword;
  }

  // ==================================================
  // ĐĂNG NHẬP THƯỜNG
  // ==================================================

  login(
    form:
      NgForm
  ): void {
    /*
     * Không cho nhấn đăng nhập nhiều lần
     * khi request đang chạy hoặc đang
     * kiểm tra phiên cũ.
     */
    if (
      this.isLoading ||
      this.isCheckingSession
    ) {
      return;
    }

    this.errorMessage = '';

    const account =
      this.emailOrPhone.trim();

    /*
     * Kiểm tra validation trong HTML.
     */
    if (
      form.invalid
    ) {
      form.control
        .markAllAsTouched();

      this.showValidationError(
        'Vui lòng nhập đầy đủ và đúng thông tin đăng nhập.'
      );

      return;
    }

    if (
      !account
    ) {
      this.showValidationError(
        'Vui lòng nhập email hoặc số điện thoại.'
      );

      return;
    }

    if (
      !this.password
    ) {
      this.showValidationError(
        'Vui lòng nhập mật khẩu.'
      );

      return;
    }

    if (
      this.password.length < 6
    ) {
      this.showValidationError(
        'Mật khẩu phải có ít nhất 6 ký tự.'
      );

      return;
    }

    const loginData:
      LoginRequest = {
        emailOrPhone:
          account,

        password:
          this.password,

        rememberMe:
          this.rememberMe
      };

    console.log(
      'Dữ liệu đăng nhập:',
      {
        emailOrPhone:
          loginData.emailOrPhone,

        rememberMe:
          loginData.rememberMe
      }
    );

    /*
     * Bắt đầu loading.
     */
    this.isLoading =
      true;

    this.authService
      .login(
        loginData
      )
      .subscribe({
        next: (
          response:
            LoginResponse
        ) => {
          /*
           * API đăng nhập thành công:
           *
           * - Email/số điện thoại đúng.
           * - Mật khẩu đúng.
           * - Backend đã tạo Cookie accessToken.
           */
          this.isLoading =
            false;

          this.errorMessage =
            '';

          this.changeDetectorRef
            .detectChanges();

          console.log(
            'Đăng nhập thành công:',
            response
          );

          console.log(
            'Role nhận từ backend:',
            response.roles
          );

          /*
           * Chuẩn hóa Role.
           */
          const normalizedRoles =
            this.normalizeRoles(
              response.roles
            );

          console.log(
            'Role sau khi chuẩn hóa:',
            normalizedRoles
          );

          this.showSuccessToast(
            response.message ||
            'Đăng nhập thành công.'
          );

          /*
           * Chờ Toast hiển thị rồi
           * chuyển trang.
           */
          setTimeout(() => {
            this.redirectAfterLogin(
              normalizedRoles
            );
          }, 900);
        },

        error: (
          error:
            HttpErrorResponse
        ) => {
          /*
           * Dừng loading khi API trả lỗi.
           */
          this.isLoading =
            false;

          this.changeDetectorRef
            .detectChanges();

          console.error(
            'Lỗi đăng nhập:',
            error
          );

          console.error(
            'HTTP status:',
            error.status
          );

          console.error(
            'Dữ liệu backend trả về:',
            error.error
          );

          this.errorMessage =
            this.getLoginErrorMessage(
              error
            );

          this.showErrorToast(
            this.errorMessage
          );

          /*
           * 401 nghĩa là:
           *
           * - Không tìm thấy email/số điện thoại.
           * - Hoặc mật khẩu không chính xác.
           *
           * Sau 1,5 giây tải lại trang.
           */
          if (
            error.status === 401
          ) {
            setTimeout(() => {
              window.location
                .reload();
            }, 1500);
          }
        }
      });
  }

  // ==================================================
  // KHỞI TẠO GOOGLE IDENTITY SERVICES
  // ==================================================

  private initializeGoogleLogin():
    void {

    const tryInitializeGoogle =
      (): void => {

        /*
         * Script Google được tải bất đồng bộ.
         *
         * Nếu chưa tải xong thì chờ 300ms
         * rồi thử lại.
         */
        if (
          typeof google ===
            'undefined' ||
          !google.accounts ||
          !google.accounts.id
        ) {
          setTimeout(
            tryInitializeGoogle,
            300
          );

          return;
        }

        /*
         * Kiểm tra Google Client ID.
         */
        if (
          !this.googleClientId
        ) {
          console.warn(
            'Bạn chưa cấu hình Google Client ID trong login.component.ts.'
          );

          return;
        }

        /*
         * Khởi tạo Google Sign-In.
         */
        google.accounts.id
          .initialize({
            client_id:
              this.googleClientId,

            callback: (
              response:
                GoogleCredentialResponse
            ) => {
              /*
               * Callback Google có thể chạy
               * bên ngoài Angular Zone.
               *
               * NgZone giúp Angular nhận biết
               * trạng thái đã thay đổi.
               */
              this.ngZone.run(() => {
                this.handleGoogleCredential(
                  response
                );
              });
            },

            auto_select:
              false,

            cancel_on_tap_outside:
              true
          });

        const googleButtonContainer =
          document.getElementById(
            'googleButton'
          );

        if (
          !googleButtonContainer
        ) {
          console.error(
            'Không tìm thấy phần tử HTML có id="googleButton".'
          );

          return;
        }

        /*
         * Xóa nút cũ nếu Component
         * được khởi tạo lại.
         */
        googleButtonContainer
          .innerHTML = '';

        const containerWidth =
          googleButtonContainer
            .getBoundingClientRect()
            .width;

        const buttonWidth =
          Math.min(
            400,

            Math.max(
              200,

              Math.floor(
                containerWidth ||
                400
              )
            )
          );

        /*
         * Render nút Google chính thức.
         */
        google.accounts.id
          .renderButton(
            googleButtonContainer,
            {
              type:
                'standard',

              theme:
                'outline',

              size:
                'large',

              text:
                'signin_with',

              shape:
                'rectangular',

              logo_alignment:
                'left',

              locale:
                'vi',

              width:
                buttonWidth
            }
          );
      };

    tryInitializeGoogle();
  }

  // ==================================================
  // NHẬN GOOGLE ID TOKEN
  // ==================================================

  private handleGoogleCredential(
    response:
      GoogleCredentialResponse
  ): void {

    const idToken =
      response?.credential;

    if (
      !idToken
    ) {
      this.showErrorToast(
        'Không nhận được thông tin đăng nhập từ Google.'
      );

      return;
    }

    console.log(
      'Đã nhận Google ID Token.'
    );

    /*
     * Không in toàn bộ Token ra Console
     * để tránh làm lộ Token.
     */
    this.googleLogin(
      idToken
    );
  }

  // ==================================================
  // GỬI GOOGLE ID TOKEN XUỐNG BACKEND
  // ==================================================

  private googleLogin(
    idToken:
      string
  ): void {

    if (
      this.isLoading ||
      !idToken
    ) {
      return;
    }

    this.isLoading =
      true;

    this.errorMessage =
      '';

    this.changeDetectorRef
      .detectChanges();

    this.authService
      .googleLogin(
        idToken
      )
      .subscribe({
        next: (
          response:
            GoogleLoginResponse
        ) => {
          this.isLoading =
            false;

          this.errorMessage =
            '';

          this.changeDetectorRef
            .detectChanges();

          console.log(
            'Đăng nhập Google thành công:',
            response
          );

          console.log(
            'Role Google nhận từ backend:',
            response.roles
          );

          /*
           * Chuẩn hóa Role giống
           * đăng nhập thông thường.
           */
          const normalizedRoles =
            this.normalizeRoles(
              response.roles
            );

          this.showSuccessToast(
            response.message ||
            'Đăng nhập Google thành công.'
          );

          /*
           * Giữ nguyên logic điều hướng:
           *
           * roles rỗng → /user
           * roles có dữ liệu → /admin
           */
          setTimeout(() => {
            this.redirectAfterLogin(
              normalizedRoles
            );
          }, 900);
        },

        error: (
          error:
            HttpErrorResponse
        ) => {
          this.isLoading =
            false;

          this.changeDetectorRef
            .detectChanges();

          console.error(
            'Đăng nhập Google thất bại:',
            error
          );

          console.error(
            'HTTP status Google Login:',
            error.status
          );

          console.error(
            'Backend Google Login trả về:',
            error.error
          );

          this.errorMessage =
            this.getGoogleLoginErrorMessage(
              error
            );

          this.showErrorToast(
            this.errorMessage
          );
        }
      });
  }

  // ==================================================
  // CHUẨN HÓA DANH SÁCH ROLE
  // ==================================================

  private normalizeRoles(
    roles:
      string[] |
      null |
      undefined
  ): string[] {

    /*
     * Nếu backend trả null hoặc undefined
     * thì xem như không có Role.
     */
    if (
      !Array.isArray(
        roles
      )
    ) {
      return [];
    }

    /*
     * Chuẩn hóa Role:
     *
     * - Xóa khoảng trắng.
     * - Chuyển thành chữ thường.
     * - Loại bỏ Role rỗng.
     */
    return roles
      .map(role =>
        role
          .trim()
          .toLowerCase()
      )
      .filter(role =>
        role.length > 0
      );
  }

  // ==================================================
  // ĐIỀU HƯỚNG SAU ĐĂNG NHẬP
  // ==================================================

  private redirectAfterLogin(
    roles:
      string[]
  ): void {

    /*
     * ROLE RỖNG:
     *
     * AspNetUsers không có liên kết
     * trong AspNetUserRoles.
     *
     * Đây là người dùng mua hàng bình thường.
     */
    if (
      roles.length === 0
    ) {
      console.log(
        'Tài khoản không có Role → chuyển đến /user.'
      );

      this.router
        .navigateByUrl(
          '/user'
        )
        .then(success => {
          console.log(
            'Kết quả điều hướng đến /user:',
            success
          );
        })
        .catch(error => {
          console.error(
            'Lỗi điều hướng đến /user:',
            error
          );
        });

      return;
    }

    /*
     * ROLE KHÔNG RỖNG:
     *
     * AspNetUsers có liên kết với AspNetRoles
     * thông qua AspNetUserRoles.
     *
     * Đây là tài khoản có quyền hệ thống.
     */
    console.log(
      'Tài khoản có Role → chuyển đến /admin.'
    );

    this.router
      .navigateByUrl(
        '/admin'
      )
      .then(success => {
        console.log(
          'Kết quả điều hướng đến /admin:',
          success
        );
      })
      .catch(error => {
        console.error(
          'Lỗi điều hướng đến /admin:',
          error
        );
      });
  }

  // ==================================================
  // VALIDATION FRONTEND
  // ==================================================

  private showValidationError(
    message:
      string
  ): void {

    this.isLoading =
      false;

    this.errorMessage =
      message;

    this.changeDetectorRef
      .detectChanges();

    this.showErrorToast(
      message
    );
  }

  // ==================================================
  // XỬ LÝ LỖI ĐĂNG NHẬP THƯỜNG
  // ==================================================

  private getLoginErrorMessage(
    error:
      HttpErrorResponse
  ): string {

    /*
     * Backend chưa chạy, lỗi CORS,
     * sai URL hoặc lỗi HTTPS.
     */
    if (
      error.status === 0
    ) {
      return (
        'Không thể kết nối đến máy chủ. ' +
        'Hãy kiểm tra backend, HTTPS và CORS.'
      );
    }

    /*
     * Backend trả một chuỗi trực tiếp.
     */
    if (
      typeof error.error ===
        'string' &&
      error.error.trim()
    ) {
      return error.error;
    }

    /*
     * Backend trả:
     *
     * {
     *   message: "Nội dung lỗi"
     * }
     */
    if (
      typeof error.error?.message ===
        'string' &&
      error.error.message.trim()
    ) {
      return error.error.message;
    }

    switch (
      error.status
    ) {
      case 400:
        return (
          'Thông tin đăng nhập không hợp lệ.'
        );

      case 401:
        return (
          'Email, số điện thoại hoặc mật khẩu ' +
          'không chính xác.'
        );

      case 403:
        return (
          'Bạn không có quyền truy cập hệ thống.'
        );

      case 404:
        return (
          'Không tìm thấy API đăng nhập. ' +
          'Hãy kiểm tra endpoint /api/auth/login.'
        );

      case 423:
        return (
          'Tài khoản đang bị khóa. ' +
          'Vui lòng thử lại sau.'
        );

      default:
        if (
          error.status >= 500
        ) {
          return (
            'Máy chủ đang gặp lỗi. ' +
            'Vui lòng thử lại sau.'
          );
        }

        return (
          'Đăng nhập thất bại.'
        );
    }
  }

  // ==================================================
  // XỬ LÝ LỖI GOOGLE LOGIN
  // ==================================================

  private getGoogleLoginErrorMessage(
    error:
      HttpErrorResponse
  ): string {

    if (
      error.status === 0
    ) {
      return (
        'Không thể kết nối đến máy chủ khi đăng nhập Google. ' +
        'Hãy kiểm tra backend, HTTPS và CORS.'
      );
    }

    if (
      typeof error.error ===
        'string' &&
      error.error.trim()
    ) {
      return error.error;
    }

    if (
      typeof error.error?.message ===
        'string' &&
      error.error.message.trim()
    ) {
      return error.error.message;
    }

    switch (
      error.status
    ) {
      case 400:
        return (
          'Dữ liệu đăng nhập Google không hợp lệ.'
        );

      case 401:
        return (
          'Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn.'
        );

      case 403:
        return (
          'Tài khoản Google không có quyền truy cập.'
        );

      case 404:
        return (
          'Không tìm thấy API Google Login. ' +
          'Hãy kiểm tra endpoint /api/auth/google-login.'
        );

      default:
        if (
          error.status >= 500
        ) {
          return (
            'Máy chủ gặp lỗi khi xử lý đăng nhập Google.'
          );
        }

        return (
          'Đăng nhập Google thất bại.'
        );
    }
  }

  // ==================================================
  // SWEETALERT
  // ==================================================

  private showSuccessToast(
    message:
      string
  ): void {

    Swal.fire({
      toast:
        true,

      position:
        'top-end',

      icon:
        'success',

      title:
        message,

      showConfirmButton:
        false,

      timer:
        1800,

      timerProgressBar:
        true,

      // ==================================================
      // BỔ SUNG:
      // DÙNG GIAO DIỆN TOAST CHUNG CỦA HỆ THỐNG
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
      },

      didOpen: toast => {
        toast.addEventListener(
          'mouseenter',
          Swal.stopTimer
        );

        toast.addEventListener(
          'mouseleave',
          Swal.resumeTimer
        );
      }
    });
  }

  private showErrorToast(
    message:
      string
  ): void {

    Swal.fire({
      toast:
        true,

      position:
        'top-end',

      icon:
        'error',

      title:
        message,

      showConfirmButton:
        false,

      timer:
        1800,

      timerProgressBar:
        true,

      // ==================================================
      // BỔ SUNG:
      // DÙNG GIAO DIỆN TOAST CHUNG CỦA HỆ THỐNG
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
      },

      didOpen: toast => {
        toast.addEventListener(
          'mouseenter',
          Swal.stopTimer
        );

        toast.addEventListener(
          'mouseleave',
          Swal.resumeTimer
        );
      }
    });
  }

  // ==================================================
  // ĐĂNG NHẬP GOOGLE CŨ
  // ==================================================

  /*
   * Hàm này giữ lại để không làm mất
   * logic cũ của Component.
   *
   * Nút Google chính thức hiện được xử lý
   * bởi initializeGoogleLogin().
   */
  loginWithGoogle(): void {
    if (
      this.isLoading ||
      this.isCheckingSession
    ) {
      return;
    }

    Swal.fire({
      toast:
        true,

      position:
        'top-end',

      icon:
        'info',

      title:
        'Vui lòng sử dụng nút đăng nhập Google bên dưới.',

      showConfirmButton:
        false,

      timer:
        2300,

      timerProgressBar:
        true,

      // ==================================================
      // BỔ SUNG:
      // DÙNG GIAO DIỆN TOAST CHUNG CỦA HỆ THỐNG
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
  }

  // ==================================================
  // CHUYỂN TRANG
  // ==================================================

  goToForgotPassword(): void {
    if (
      this.isLoading ||
      this.isCheckingSession
    ) {
      return;
    }

    this.router.navigate([
      '/forgot-password'
    ]);
  }

  goToRegister(): void {
    if (
      this.isLoading ||
      this.isCheckingSession
    ) {
      return;
    }

    this.router.navigate([
      '/register'
    ]);
  }
}