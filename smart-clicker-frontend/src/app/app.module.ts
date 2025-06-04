import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { AppRoutingModule, routes } from "./app.routes";
import {
  LayoutComponent,
  ModalComponent,
  SpinnerComponent,
} from "./components";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";

import {
  IPublicClientApplication,
  PublicClientApplication,
  BrowserCacheLocation,
  LogLevel,
  InteractionType,
} from "@azure/msal-browser";
import {
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalInterceptorConfiguration,
  MSAL_GUARD_CONFIG,
  MsalGuardConfiguration,
  MsalBroadcastService,
  MsalService,
  MsalGuard,
  MsalRedirectComponent,
  MsalModule,
  MsalInterceptor,
} from "@azure/msal-angular";

import { NgIconsModule, provideNgIconsConfig } from "@ng-icons/core";
import * as icons from "@ng-icons/heroicons/outline";
import { ToastService, AngularToastifyModule } from "angular-toastify";
import { env } from "../environments/environment";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { CalendarModule, DateAdapter } from "angular-calendar";
import { adapterFactory } from "angular-calendar/date-adapters/date-fns";

const APP_CONTAINERS = [LayoutComponent, ModalComponent, SpinnerComponent];

const isIE =
  window.navigator.userAgent.indexOf("MSIE ") > -1 ||
  window.navigator.userAgent.indexOf("Trident/") > -1;

// export function loggerCallback(logLevel: LogLevel, message: string) {
//   // console.log(message);
// }

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: env.CLIENT_ID,
      authority: env.AUTHORITY,
      redirectUri: env.REDIRECT_URL,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.SessionStorage,
      storeAuthStateInCookie: isIE,
    },
    system: {
      loggerOptions: {
        // loggerCallback,
        logLevel: LogLevel.Info,
        piiLoggingEnabled: false,
      },
    },
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set("https://graph.microsoft.com/", [".default"]);
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: ["openid", "profile", `${env.TOKEN_SCOPE}`, "user.read"],
    },
  };
}

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    MsalModule,
    AngularToastifyModule,
    NgIconsModule.withIcons(icons),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    ...APP_CONTAINERS,
  ],
  declarations: [AppComponent],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    ToastService,
    provideNgIconsConfig({
      size: "1.5rem",
    }),
    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent, MsalRedirectComponent],
})
export class AppModule { }
