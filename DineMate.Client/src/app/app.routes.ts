import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AuthGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  // ==================================================
  // ĐĂNG NHẬP
  // ==================================================

  {
    path: 'login',
    component: LoginComponent
  },

  // ==================================================
  // ĐĂNG KÝ
  // ==================================================

  {
    path: 'register',
    component: RegisterComponent
  },

  // ==================================================
  // KHU VỰC QUẢN TRỊ
  // ==================================================

  {
    path: 'admin',

    /*
     * AdminLayoutComponent là component cha.
     *
     * Component này chứa:
     * - Sidebar
     * - Topbar
     * - <router-outlet>
     */
    loadComponent: () =>
      import(
        './features/admin-layout/admin-layout.component'
      ).then(
        module =>
          module.AdminLayoutComponent
      ),

    title: 'Quản trị hệ thống',

    /*
     * Giữ nguyên AuthGuard cũ.
     *
     * Người dùng phải có phiên đăng nhập
     * hợp lệ mới được vào /admin.
     */
    canActivate: [
      AuthGuard
    ],

    /*
     * Các component con sẽ được hiển thị
     * trong <router-outlet> của
     * AdminLayoutComponent.
     */
    children: [
      // ==============================================
      // QUẢN LÝ BÀN
      // URL: /admin/tables
      // ==============================================

      {
        path: 'tables',

        loadComponent: () =>
          import(
            './features/admin-table-management/admin-table-management.component'
          ).then(
            module =>
              module.AdminTableManagementComponent
          ),

        title: 'Quản lý bàn'
      },


      
// QUẢN LÝ LOẠI MÓN ĂN
// URL: /admin/categories
// ==============================================

{
  path: 'categories',

  /*
   * Component con được hiển thị bên trong
   * <router-outlet> của AdminLayoutComponent.
   */
  loadComponent: () =>
    import(
      './features/admin-category-management/admin-category-management.component'
    ).then(
      module =>
        module.AdminCategoryManagementComponent
    ),

  title: 'Quản lý loại món ăn'
},


// URL: /admin/foods
// ==============================================

{
  path: 'foods',

  loadComponent: () =>
    import(
      './features/admin-food-management/admin-food-management.component'
    ).then(
      module =>
        module.AdminFoodManagementComponent
    ),

  title: 'Quản lý món ăn'
}





    ]
  },

  // ==================================================
  // ROUTE MẶC ĐỊNH
  // ==================================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // ==================================================
  // ROUTE KHÔNG TỒN TẠI
  // ==================================================

  {
    path: '**',
    redirectTo: 'login'
  }
];