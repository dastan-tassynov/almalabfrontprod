import { appRoutes } from './app.routes';
import { provideRouter } from '@angular/router';

export const appConfig = {
  providers: [
    provideRouter(appRoutes)
  ]
};
