import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BrowserUtils } from "@azure/msal-browser";
import { LayoutComponent } from "./components/layout/layout.component";
import { MsalGuard } from "@azure/msal-angular";
import { GuardService } from "./services/guard.service";
import { DemoMarketComponent } from "./pages/demoMarket/demoMarket.component";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "demo",
    pathMatch: "full",
  },
  {
    path: "demo",
    component: DemoMarketComponent,
    pathMatch: "full",
  },
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "home",
        loadComponent: () =>
          import("./pages/home/home.component").then((m) => m.HomeComponent),
        canActivate: [MsalGuard],
      },
      {
        path: "qotd",
        loadComponent: () =>
          import("./pages/qotd/qotd.component").then((m) => m.QotdComponent),
        canActivate: [MsalGuard],
      }, {
        path: "roles",
        loadComponent: () =>
          import("./pages/roles/roles.component").then((m) => m.RolesComponent),
        canActivate: [MsalGuard],
      }, {
        path: "users",
        loadComponent: () =>
          import("./pages/users/users.component").then((m) => m.UsersComponent),
        canActivate: [MsalGuard],
      },
      {
        path: "offices",
        loadComponent: () =>
          import("./pages/offices/offices.component").then((m) => m.OfficesComponent),
        canActivate: [MsalGuard],
      },
      {
        path: "docs",
        loadComponent: () =>
          import("./pages/swagger/swagger.component").then(
            (m) => m.SwaggerComponent
          ),
        canActivate: [MsalGuard],
        pathMatch: "full",
      },
    ],
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: "top",
      anchorScrolling: "enabled",
      initialNavigation:
        !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup()
          ? "enabledNonBlocking"
          : "disabled",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
