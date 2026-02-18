import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { authInterceptor } from './auth/auth.interceptor'; // Проверь название файла!

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]) // Регистрация интерцептора
    )
  ]
};
