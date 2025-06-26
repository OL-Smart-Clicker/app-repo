import { Component, HostListener, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import * as icons from "@ng-icons/heroicons/outline";
import { GuardService } from "../../services/guard.service";
import { Router, RouterModule } from "@angular/router";
import { Permission } from "../../types/permission";
import { CommonModule } from "@angular/common";
import { NgIconsModule } from "@ng-icons/core";
import { AngularToastifyModule } from "angular-toastify";
import { RoleService } from "../../services/role.service";
import { OfficeService } from "../../services/office.service";
import { Office } from "../../types/office";
import { FormsModule } from '@angular/forms';
import { Subscription } from "rxjs";

@Component({
  selector: "app-layout",
  templateUrl: "./layout.component.html",
  imports: [CommonModule, NgIconsModule, RouterModule, AngularToastifyModule, FormsModule],
})
export class LayoutComponent implements OnInit {
  constructor(
    private authServ: AuthService,
    private guardServ: GuardService,
    private router: Router,
    private roleServ: RoleService,
    private officeServ: OfficeService
  ) { }

  fullscreen: boolean = false;
  showFullscreenButton: boolean = false;
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
  offices: Office[] = [];
  selectedOfficeId: string | null = null;
  private officeSub: Subscription | undefined;
  private officesSub: Subscription | undefined;

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

  async ngOnInit(): Promise<void> {
    // Set showFullscreenButton on initial load
    this.showFullscreenButton = this.router.url.startsWith('/home');

    this.officesSub = this.officeServ.offices$.subscribe((offices) => {
      this.offices = offices;
      if (!this.selectedOfficeId && this.offices.length > 0) {
        this.selectedOfficeId = this.offices[0].id!;
        this.officeServ.setOfficeId(this.selectedOfficeId);
      }
    });

    if (!this.offices || this.offices.length === 0) {
      await this.officeServ.refreshOffices();
    }

    this.officeSub = this.officeServ.officeId$.subscribe((id) => {
      this.selectedOfficeId = id;
    });

    const role = await this.roleServ.getUserRole();
    this.routes.forEach(async (route: any) => {
      if (route.permission !== "") {
        if (role) {
          if (await this.guardServ.hasAccess(role, route.permission)) {
            this.navItems.push(route);
          }
        }
      } else {
        this.navItems.push(route);
      }
      this.navItems.sort((a, b) => a.order - b.order);
    });

    this.router.events.subscribe(() => {
      this.showFullscreenButton = this.router.url.startsWith('/home');
      if (!this.showFullscreenButton && this.fullscreen) {
        this.fullscreen = false;
      }
    });
    this.loading = false;
  }

  ngOnDestroy(): void {
    if (this.officeSub) {
      this.officeSub.unsubscribe();
    }
    if (this.officesSub) {
      this.officesSub.unsubscribe();
    }
  }

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

  async getOffices(): Promise<void> {
    try {
      this.offices = await this.officeServ.getAllOffices();
    } catch (error) {
      console.error("Error loading offices:", error);
    }
  }

  onOfficeChange(event: any) {
    this.officeServ.setOfficeId(event.target.value);
  }

  toggleFullscreen() {
    this.fullscreen = !this.fullscreen;
  }
}
