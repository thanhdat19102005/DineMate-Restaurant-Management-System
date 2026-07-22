import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router
} from '@angular/router';

import {
  Observable,
  catchError,
  map,
  of
} from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService
      .getProfile()
      .pipe(
        map(response => {
          console.log(
            'Phiên đăng nhập hợp lệ:',
            response
          );

          return true;
        }),

        catchError(error => {
          console.error(
            'Phiên đăng nhập không hợp lệ:',
            error
          );

          this.router.navigate([
            '/login'
          ]);

          return of(false);
        })
      );
  }
}