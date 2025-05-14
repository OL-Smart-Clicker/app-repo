import { AfterViewInit, Component, HostListener, OnInit } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import * as icons from '@ng-icons/heroicons/outline'
import { GuardService } from "../../services/guard.service";
import { Router } from "@angular/router";
import { Permission } from "../../types/permission";

@Component({
    selector: 'app-layout',
    standalone: false,
    templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit, AfterViewInit {

    constructor(private authServ: AuthService, private guardServ: GuardService, private router: Router) { }

    interacted: boolean = true;
    loading: boolean = true;
    sidebarVisible: boolean = true;
    textVisible: boolean = true;
    dropdownVisible: boolean = false;
    icons = icons;
    navItems: any[] = [];
    routes: any[] = [
        {
            path: '/home',
            name: 'Home',
            icon: icons.heroHome,
            // permission: Permission.QuestionViewToday,
            permission: '',
            order: 1
        },
        {
            path: '/qotd',
            name: 'Question of the Day',
            icon: icons.heroQuestionMarkCircle,
            // permission: Permission.QuestionViewAll,
            permission: '',
            order: 2
        },
        {
            path: '/data',
            name: 'Data Overview',
            icon: icons.heroCircleStack,
            // permission: Permission.DataViewTenant,
            permission: '',
            order: 3
        },
    ]

    toggleSidebar() {
        this.interacted = !this.interacted;
        this.sidebarVisible = !this.sidebarVisible;
        if (this.textVisible) {
            this.textVisible = !this.textVisible;
        }
        else {
            setTimeout(() => {
                this.textVisible = !this.textVisible;
            }, 250)
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
            if (route.permission !== '') {
                if (await this.guardServ.hasAccess(route.permission)) {
                    this.navItems.push(route);
                }
            }
            else {
                this.navItems.push(route);
            }
            this.navItems.sort((a, b) => a.order - b.order);
        })
    }

    ngAfterViewInit(): void {
        this.loading = false;
    }

    /*
        until here
    */

    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        if (window.innerWidth <= 768) {
            this.sidebarVisible = false;
            this.textVisible = false;
        }
        else if (this.interacted) {
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