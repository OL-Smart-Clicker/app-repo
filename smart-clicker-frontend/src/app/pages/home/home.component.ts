import { Component, OnInit } from "@angular/core";
import { GuardService } from "../../services/guard.service";
import * as icons from "@ng-icons/heroicons/outline";
import { ClickerService } from "../../services/clicker.service";
import { QotdService } from "../../services/qotd.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  constructor(
    private guardServ: GuardService,
    private clickerServ: ClickerService,
    private qotdService: QotdService
  ) {}

  icons = icons;
  qotd: string = "";

  async ngOnInit(): Promise<void> {
    const response = await this.clickerServ.getClickerData();
    console.log(response);
    try {
      const responseQotd = await this.qotdService.getQotdTodayForOffice(
        "Office_A1"
      );
      if (responseQotd) {
        this.qotd = responseQotd.question;
      } else {
        this.qotd = "No QOTD available for today :(";
      }
    } catch (error) {
      this.qotd = "No QOTD available for today :(";
    }
  }
}
