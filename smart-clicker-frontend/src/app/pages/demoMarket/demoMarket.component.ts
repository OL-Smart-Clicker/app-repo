import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import * as icons from "@ng-icons/heroicons/outline";
import { AngularToastifyModule, ToastService } from "angular-toastify";
import axios from "axios";

@Component({
    selector: "app-home",
    templateUrl: "./demoMarket.component.html",
    imports: [AngularToastifyModule, CommonModule],
})
export class DemoMarketComponent implements OnInit {
    constructor(private toastService: ToastService) { }

    icons = icons;
    votes: number = 0;
    clicked: boolean = false;

    async ngOnInit(): Promise<void> {
        this.clicked = localStorage.getItem("demoClicked") === "true";
        await this.getData();
    }

    async getData(): Promise<void> {
        const response = await axios.get('https://68409fba5b39a8039a58aace.mockapi.io/demo/res/1');
        this.votes = response.data.votes;
        setTimeout(() => {
            this.getData();
        }, 1000);
    }

    async onClick(): Promise<void> {
        await axios.put('https://68409fba5b39a8039a58aace.mockapi.io/demo/res/1', { id: 1, votes: this.votes + 1 }).then(async () => {
            const response = await axios.get('https://68409fba5b39a8039a58aace.mockapi.io/demo/res/1');
            this.votes = response.data.votes;
            localStorage.setItem("demoClicked", "true");
            this.clicked = true;
            this.toastService.success("Thank you for your input!");
        });
    }
}
