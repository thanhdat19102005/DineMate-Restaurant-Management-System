import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import Swal from 'sweetalert2';

import {
  AuthService,
  RegisterRequest,
  RegisterResponse
} from '../services/auth.service';

interface RegisterFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerData: RegisterFormData =
    this.createEmptyRegisterData();

  showPassword = false;
  showConfirmPassword = false;

  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  private createEmptyRegisterData(): RegisterFormData {
    return {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword =
      !this.showConfirmPassword;
  }

  register(form: NgForm): void {
    if (this.isLoading) {
      return;
    }

    this.errorMessage = '';

    if (form.invalid) {
      form.control.markAllAsTouched();

      this.handleClientValidationError(
        'Vui lòng nhập đầy đủ và đúng thông tin.'
      );

      return;
    }

    if (!this.isValidFullName()) {
      this.handleClientValidationError(
        'Họ và tên phải có ít nhất 2 ký tự.'
      );

      return;
    }

    if (!this.isValidEmail()) {
      this.handleClientValidationError(
        'Địa chỉ email không hợp lệ.'
      );

      return;
    }

    if (!this.isValidPhoneNumber()) {
      this.handleClientValidationError(
        'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.'
      );

      return;
    }

    if (!this.isValidPassword()) {
      this.handleClientValidationError(
        'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.'
      );

      return;
    }

    if (!this.passwordsMatch()) {
      this.handleClientValidationError(
        'Mật khẩu xác nhận không khớp.'
      );

      return;
    }

    if (!this.registerData.agreeToTerms) {
      this.handleClientValidationError(
        'Bạn phải đồng ý với điều khoản sử dụng và chính sách bảo mật.'
      );

      return;
    }

    const request: RegisterRequest = {
      fullName:
        this.registerData.fullName.trim(),

      email:
        this.registerData.email
          .trim()
          .toLowerCase(),

      phoneNumber:
        this.registerData.phoneNumber.trim(),

      password:
        this.registerData.password,

      confirmPassword:
        this.registerData.confirmPassword
    };

    console.log(
      'Dữ liệu gửi lên API đăng ký:',
      request
    );

    this.isLoading = true;

    this.authService
      .register(request)
      .pipe(
        finalize(() => {
          /*
           * Luôn chạy khi request kết thúc:
           * - Thành công
           * - Thất bại
           *
           * Vì vậy nút sẽ không còn xoay mãi.
           */
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: RegisterResponse) => {
          this.errorMessage = '';

          console.log(
            'Kết quả đăng ký:',
            response
          );

          const successMessage =
            response?.message ||
            'Đăng ký tài khoản thành công!';

          this.resetForm(form);

          this.showSuccessToast(
            successMessage
          );

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1800);
        },

        error: (error: HttpErrorResponse) => {
          console.error(
            'Toàn bộ lỗi đăng ký:',
            error
          );

          console.error(
            'HTTP status:',
            error.status
          );

          console.error(
            'Dữ liệu lỗi backend trả về:',
            error.error
          );

          this.errorMessage =
            this.getRegisterErrorMessage(error);

          this.showErrorToast(
            this.errorMessage
          );
        }
      });
  }

  private handleClientValidationError(
    message: string
  ): void {
    this.errorMessage = message;
    this.showErrorToast(message);
  }

  private showSuccessToast(
    message: string
  ): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,

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
    message: string
  ): void {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 3200,
      timerProgressBar: true,

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

  private getRegisterErrorMessage(
    error: HttpErrorResponse
  ): string {
    if (error.status === 0) {
      return (
        'Không thể kết nối đến máy chủ. ' +
        'Hãy kiểm tra backend, HTTPS và cấu hình CORS.'
      );
    }

    if (
      typeof error.error === 'string' &&
      error.error.trim()
    ) {
      return error.error;
    }

    const backendMessage =
      error.error?.message;

    if (
      typeof backendMessage === 'string' &&
      backendMessage.trim()
    ) {
      return backendMessage;
    }

    const backendError =
      error.error?.error;

    if (
      typeof backendError === 'string' &&
      backendError.trim()
    ) {
      return backendError;
    }

    const validationMessage =
      this.extractValidationErrors(
        error.error?.errors
      );

    if (validationMessage) {
      return validationMessage;
    }

    switch (error.status) {
      case 400:
        return 'Dữ liệu đăng ký không hợp lệ.';

      case 401:
        return 'Bạn không có quyền thực hiện thao tác này.';

      case 403:
        return 'Yêu cầu đăng ký đã bị từ chối.';

      case 404:
        return (
          'Không tìm thấy API đăng ký. ' +
          'Hãy kiểm tra lại đường dẫn trong AuthService.'
        );

      case 409:
        return (
          'Email hoặc số điện thoại ' +
          'đã được đăng ký.'
        );

      case 422:
        return 'Dữ liệu đăng ký chưa hợp lệ.';

      default:
        if (error.status >= 500) {
          return (
            'Máy chủ đang gặp lỗi. ' +
            'Vui lòng thử lại sau.'
          );
        }

        return 'Đăng ký tài khoản thất bại.';
    }
  }

  private extractValidationErrors(
    errors: unknown
  ): string {
    if (
      !errors ||
      typeof errors !== 'object'
    ) {
      return '';
    }

    const messages: string[] = [];

    Object.values(
      errors as Record<string, unknown>
    ).forEach(value => {
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (
            typeof item === 'string' &&
            item.trim()
          ) {
            messages.push(item);
          }
        });

        return;
      }

      if (
        typeof value === 'string' &&
        value.trim()
      ) {
        messages.push(value);
      }
    });

    return messages.join(' ');
  }

  private resetForm(
    form: NgForm
  ): void {
    const emptyData =
      this.createEmptyRegisterData();

    this.registerData = emptyData;

    form.resetForm(emptyData);

    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  isValidFullName(): boolean {
    return (
      this.registerData.fullName
        .trim()
        .length >= 2
    );
  }

  isValidEmail(): boolean {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(
      this.registerData.email.trim()
    );
  }

  isValidPhoneNumber(): boolean {
    const phonePattern =
      /^0\d{9}$/;

    return phonePattern.test(
      this.registerData.phoneNumber.trim()
    );
  }

  isValidPassword(): boolean {
    const password =
      this.registerData.password;

    const hasMinimumLength =
      password.length >= 8;

    const hasUppercase =
      /[A-Z]/.test(password);

    const hasLowercase =
      /[a-z]/.test(password);

    const hasNumber =
      /\d/.test(password);

    return (
      hasMinimumLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumber
    );
  }

  passwordsMatch(): boolean {
    const password =
      this.registerData.password;

    const confirmPassword =
      this.registerData.confirmPassword;

    return (
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword
    );
  }

  registerWithGoogle(): void {
    if (this.isLoading) {
      return;
    }

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title:
        'Chức năng đăng ký Google đang được phát triển.',
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true
    });
  }

  goToLogin(): void {
    if (this.isLoading) {
      return;
    }

    this.router.navigate(['/login']);
  }

  openTerms(): void {
    Swal.fire({
      icon: 'info',
      title: 'Điều khoản sử dụng',
      text:
        'Nội dung điều khoản sử dụng sẽ được cập nhật sau.',
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#ff5a00'
    });
  }

  openPrivacyPolicy(): void {
    Swal.fire({
      icon: 'info',
      title: 'Chính sách bảo mật',
      text:
        'Thông tin người dùng được bảo vệ và chỉ sử dụng cho hoạt động của hệ thống.',
      confirmButtonText: 'Đóng',
      confirmButtonColor: '#ff5a00'
    });
  }
}