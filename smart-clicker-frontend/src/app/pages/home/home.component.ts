import { Component, OnInit, OnDestroy } from "@angular/core";
import * as icons from "@ng-icons/heroicons/outline";
import { QotdService } from "../../services/qotd.service";
import { OfficeService } from "../../services/office.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(
    private qotdServ: QotdService, private officeServ: OfficeService,
  ) { }

  icons = icons;
  qotd: string = "";
  currentTime: string = '';
  private clockInterval: any;
  officeSpaceId: string = '';
  private officeSub: Subscription | undefined;

  async ngOnInit(): Promise<void> {
    this.officeSub = this.officeServ.officeId$.subscribe(async (id) => {
      this.officeSpaceId = id;
      await this.loadQotd();
    });
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 60000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.officeSub) {
      this.officeSub.unsubscribe();
    }
  }

  private async loadQotd() {
    try {
      const responseQotd = await this.qotdServ.getQotdTodayForOffice(this.officeSpaceId);
      if (responseQotd) {
        this.qotd = responseQotd.question;
      } else {
        this.qotd = "No QOTD available for today :(";
      }
    } catch (error) {
      this.qotd = "No QOTD available for today :(";
    }
  }

  private updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
}
