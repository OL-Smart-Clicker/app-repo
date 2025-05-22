import { Component, OnInit } from '@angular/core';
import { GuardService } from '../../services/guard.service';
import * as icons from '@ng-icons/heroicons/outline';
import { ClickerService } from '../../services/clicker.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {

    constructor(private guardServ: GuardService, private clickerServ: ClickerService) { }

    icons = icons;
    clickerData: any;

    async ngOnInit(): Promise<void> {
        const response = await this.clickerServ.getClickerData();
        this.clickerData = response;
        console.log(response);
    }

}
