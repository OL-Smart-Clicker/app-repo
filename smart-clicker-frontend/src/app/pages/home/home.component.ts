import { Component, OnInit } from '@angular/core';
import { GuardService } from '../../services/guard.service';
import * as icons from '@ng-icons/heroicons/outline';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

    constructor(private guardServ: GuardService) { }

    icons = icons;

    ngOnInit(): void {
    }

}
