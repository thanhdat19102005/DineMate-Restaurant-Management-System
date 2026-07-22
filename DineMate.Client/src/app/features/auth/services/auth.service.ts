import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environment/environment';

/* ==================================================
   REGISTER MODEL
================================================== */

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface RegisteredUser {
  id?: string;
  fullName?: string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface RegisterResponse {
  success?: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: RegisteredUser;
  data?: RegisteredUser;
  errors?: string[];
}

/* ==================================================
   LOGIN MODEL
================================================== */

/**
 * Dữ liệu gửi lên API đăng nhập.
 *
 * JSON:
 * {
 *   "emailOrPhone": "hope09023@gmail.com",
 *   "password": "Thanh@Dat123",
 *   "rememberMe": true
 * }
 */
export interface LoginRequest {
  emailOrPhone: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Dữ liệu backend trả về sau khi đăng nhập thành công.
 *
 * JWT không cần trả về Angular vì backend đã
 * lưu JWT vào HttpOnly Cookie.
 */
export interface LoginResponse {
  message: string;
  userId: string;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber?: string | null;
  roles: string[];
}

/* ==================================================
   GOOGLE LOGIN MODEL
================================================== */

/**
 * Dữ liệu backend trả về sau khi
 * đăng nhập Google thành công.
 */
export interface GoogleLoginResponse {
  message: string;
  userId: string;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber?: string | null;
  picture?: string | null;
  roles: string[];
}

/* ==================================================
   PROFILE MODEL
================================================== */

export interface ProfileResponse {
  message: string;
  userId: string;
  fullName: string;
  userName: string;
  email: string;
  roles: string[];
}

/* ==================================================
   LOGOUT MODEL
================================================== */

export interface LogoutResponse {
  message: string;
}

/* ==================================================
   AUTH SERVICE
================================================== */

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Giá trị hiện tại:
   * https://localhost:7018
   */
  private readonly apiUrl =
    environment.apiUrl;

  private readonly registerUrl =
    `${this.apiUrl}/api/auth/register`;

  private readonly loginUrl =
    `${this.apiUrl}/api/auth/login`;

  /*
   * API đăng nhập Google.
   */
  private readonly googleLoginUrl =
    `${this.apiUrl}/api/auth/google-login`;

  private readonly profileUrl =
    `${this.apiUrl}/api/auth/profile`;

  private readonly logoutUrl =
    `${this.apiUrl}/api/auth/logout`;

  constructor(
    private readonly http: HttpClient
  ) {}

  /* ==================================================
     ĐĂNG KÝ
  ================================================== */

  register(
    request: RegisterRequest
  ): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      this.registerUrl,
      request,
      {
        withCredentials: true
      }
    );
  }

  /* ==================================================
     ĐĂNG NHẬP THƯỜNG
  ================================================== */

  login(
    request: LoginRequest
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      this.loginUrl,
      request,
      {
        /*
         * Cho phép trình duyệt nhận cookie accessToken
         * mà backend trả về qua Set-Cookie.
         */
        withCredentials: true
      }
    );
  }

  /* ==================================================
     ĐĂNG NHẬP GOOGLE
  ================================================== */

  googleLogin(
    idToken: string
  ): Observable<GoogleLoginResponse> {
    return this.http.post<GoogleLoginResponse>(
      this.googleLoginUrl,
      {
        idToken
      },
      {
        /*
         * Cho phép trình duyệt nhận Cookie
         * accessToken do backend tạo.
         */
        withCredentials: true
      }
    );
  }

  /* ==================================================
     LẤY THÔNG TIN NGƯỜI ĐĂNG NHẬP
  ================================================== */

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(
      this.profileUrl,
      {
        /*
         * Gửi cookie accessToken lên backend.
         */
        withCredentials: true
      }
    );
  }

  /* ==================================================
     ĐĂNG XUẤT
  ================================================== */

  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(
      this.logoutUrl,
      {},
      {
        /*
         * Gửi cookie lên để backend xác định phiên
         * và xóa cookie accessToken.
         */
        withCredentials: true
      }
    );
  }
}