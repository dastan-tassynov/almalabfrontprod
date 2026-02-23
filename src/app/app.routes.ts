import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { DocumentsComponent } from './documents/documents.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { authGuard } from './auth/auth.guard';
import {PdfViewerComponent} from './documents/pdf-viewer.component';
import {VerifyComponent} from './verify/verify.component';
import {GuestViewComponent} from './verify/guest-view.component';

export const appRoutes: Routes = [
  { path: 'verify/:id', component: VerifyComponent },
  { path: 'guest/:orgName', component: GuestViewComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'documents', component: DocumentsComponent }
    ]
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'documents', component: DocumentsComponent },
      { path: 'documents/:id/view', component: PdfViewerComponent }
    ]
  },

  { path: '**', redirectTo: 'login' }
];


