import { AfterViewInit, Component, HostListener, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import * as icons from "@ng-icons/heroicons/outline";
import { GuardService } from "../../services/guard.service";
import { Router, RouterModule } from "@angular/router";
import { Permission } from "../../types/permission";
import { CommonModule } from "@angular/common";
import { NgIconsModule } from "@ng-icons/core";
import { AngularToastifyModule } from "angular-toastify";

@Component({
  selector: "app-layout",
  templateUrl: "./layout.component.html",
  imports: [CommonModule, NgIconsModule, RouterModule, AngularToastifyModule],
})
export class LayoutComponent implements OnInit, AfterViewInit {
  constructor(
    private authServ: AuthService,
    private guardServ: GuardService,
    private router: Router
  ) { }

  interacted: boolean = true;
  loading: boolean = true;
  sidebarVisible: boolean = true;
  textVisible: boolean = true;
  dropdownVisible: boolean = false;
  icons = icons;
  navItems: any[] = [];
  routes: any[] = [
    {
      path: "/home",
      name: "Home",
      icon: icons.heroHome,
      permission: "",
      order: 1,
    },
    {
      path: "/qotd",
      name: "Question of the Day",
      icon: icons.heroQuestionMarkCircle,
      permission: Permission.QuestionView,
      order: 2,
    },
    {
      path: "/data",
      name: "Data Overview",
      icon: icons.heroCircleStack,
      permission: Permission.DataView,
      order: 3,
    }, {
      path: "/roles",
      name: "Role Management",
      icon: icons.heroShieldCheck,
      permission: Permission.RolesView,
      order: 4,
    }, {
      path: "/users",
      name: "User Management",
      icon: icons.heroUsers,
      permission: Permission.RolesAssign,
      order: 5,
    },
    {
      path: "/offices",
      name: "Office Management",
      icon: icons.heroBuildingOffice,
      permission: Permission.OfficeView,
      order: 6,
    },
  ];

  toggleSidebar() {
    this.interacted = !this.interacted;
    this.sidebarVisible = !this.sidebarVisible;
    if (this.textVisible) {
      this.textVisible = !this.textVisible;
    } else {
      setTimeout(() => {
        this.textVisible = !this.textVisible;
      }, 250);
    }
  }

  async toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  onClickLogout() {
    this.authServ.logout();
  }

  /*
        this block might need to be changed to bring back the timeout for the loading
        it depends on how quickly we are able to load the permissions for each nav option, as well as how many options there are
    */

  async ngOnInit(): Promise<void> {
    this.routes.forEach(async (route: any) => {
      if (route.permission !== "") {
        if (await this.guardServ.hasAccess(route.permission)) {
          this.navItems.push(route);
        }
      } else {
        this.navItems.push(route);
      }
      this.navItems.sort((a, b) => a.order - b.order);
    });
  }

  ngAfterViewInit(): void {
    this.loading = false;
  }

  /*
        until here
    */

  @HostListener("window:resize", ["$event"])
  onResize(event: Event): void {
    if (window.innerWidth <= 768) {
      this.sidebarVisible = false;
      this.textVisible = false;
    } else if (this.interacted) {
      this.sidebarVisible = true;
      this.textVisible = true;
    }
  }

  onFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;
    const dropdownElement = event.currentTarget as HTMLElement;
    if (!dropdownElement.contains(relatedTarget)) {
      this.dropdownVisible = false;
    }
  }

  getRoute() {
    return this.router.url;
  }
}
