import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { ShipUserDashboardComponent } from './sfd/ship-user-dashboard/ship-user-dashboard.component';
import { LogComponent } from './shared/components/log/log.component';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';

const routes: Routes = [
  { path: 'login', component: LogComponent },
  { path: 'home', component: HomeComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  // { path: 'newlogin', component: LogComponent },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard], // Protect all child routes with AuthGuard
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'sfd',
        loadChildren: () => import('./sfd/sfd.module').then((m) => m.SfdModule),
      },
      {
        path: 'masters',
        loadChildren: () =>
          import('./masters/masters.module').then((m) => m.MastersModule),
        data: {
          breadcrumb: 'Masters'
        },
      },
      {
        path: 'maintop',
        loadChildren: () =>
          import('./maintop/maintop.module').then((m) => m.MaintopModule),
      },
      {
        path: 'dart',
        loadChildren: () =>
          import('./dart/dart.module').then((m) => m.DartModule),
      },
      {
        path:'srar',
        loadChildren:()=> import('./srar/srar.module').then((m)=>m.SrarModule)
      },
      {
        path: 'setup',
        loadChildren: () =>
          import('./setup/setup.module').then((m) => m.SetupModule),
      }
    ],
  },
  // { path: 'masters', loadChildren: () => import('./masters/masters.module').then(m => m.MastersModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
