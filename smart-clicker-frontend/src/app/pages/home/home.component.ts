import { Component, OnInit } from "@angular/core";
import { GuardService } from "../../services/guard.service";
import * as icons from "@ng-icons/heroicons/outline";
import { QotdService } from "../../services/qotd.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  constructor(
    private guardServ: GuardService,
    private qotdService: QotdService
  ) { }

  icons = icons;
  qotd: string = "";

  async ngOnInit(): Promise<void> {
    try {
      const responseQotd = await this.qotdService.getQotdTodayForOffice(
        "f17120a9-4d72-402a-812e-6cd2b7482d6a"
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
