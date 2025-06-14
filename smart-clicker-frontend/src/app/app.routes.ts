import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BrowserUtils } from "@azure/msal-browser";
import { LayoutComponent } from "./components/layout/layout.component";
import { MsalGuard } from "@azure/msal-angular";
import { GuardService } from "./services/guard.service";
import { Permission } from "./types/permission";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full",
  },
  {
    path: "home",
    loadComponent: () =>
      import("./pages/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "admin",
    component: LayoutComponent,
    canActivate: [MsalGuard],
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./pages/home/home.component").then((m) => m.HomeComponent),
        canActivate: [MsalGuard],
        pathMatch: "full",
      },
      {
        path: "qotd",
        loadComponent: () =>
          import("./pages/qotd/qotd.component").then((m) => m.QotdComponent),
        canActivate: [MsalGuard, GuardService],
        pathMatch: "full",
        data: { permission: Permission.QuestionView }
      },
      {
        path: "roles",
        loadComponent: () =>
          import("./pages/roles/roles.component").then((m) => m.RolesComponent),
        canActivate: [MsalGuard, GuardService],
        pathMatch: "full",
        data: { permission: Permission.RolesView }
      },
      {
        path: "users",
        loadComponent: () =>
          import("./pages/users/users.component").then((m) => m.UsersComponent),
        canActivate: [MsalGuard, GuardService],
        pathMatch: "full",
        data: { permission: Permission.RolesAssign }
      },
      {
        path: "offices",
        loadComponent: () =>
          import("./pages/offices/offices.component").then((m) => m.OfficesComponent),
        canActivate: [MsalGuard, GuardService],
        pathMatch: "full",
        data: { permission: Permission.OfficeView }
      },
      {
        path: "docs",
        loadComponent: () =>
          import("./pages/swagger/swagger.component").then(
            (m) => m.SwaggerComponent
          ),
        canActivate: [MsalGuard, GuardService],
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
