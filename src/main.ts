import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { jwtInterceptor } from './app/auth/jwt.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideRouter(appRoutes)
  ]
});
