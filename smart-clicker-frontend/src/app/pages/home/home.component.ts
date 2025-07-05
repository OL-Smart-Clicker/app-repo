import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import * as icons from "@ng-icons/heroicons/outline";
import { QotdService } from "../../services/qotd.service";
import { OfficeService } from "../../services/office.service";
import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { BarChartComponent, EngagementChartComponent, SpinnerComponent } from '../../components';
import { ClickerService } from "../../services/clicker.service";
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  imports: [CommonModule, SpinnerComponent, NgIconsModule, BarChartComponent, EngagementChartComponent],
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(
    private qotdServ: QotdService, private officeServ: OfficeService, private clickerServ: ClickerService
  ) { }

  icons = icons;
  qotd: string = "";
  currentTime: string = '';
  private clockInterval: any;
  officeSpaceId: string = '';
  private officeSub: Subscription | undefined;
  office: any = null;
  anchors: { id: number, x: number, y: number }[] = [];
  floorPlan: string = '';
  detailsImageWidth = 0;
  detailsImageHeight = 0;
  resizeObserver: ResizeObserver | null = null;
  @ViewChild('floorImg') floorImgRef!: any;
  loading = false;

  clicksWeek: number = 0;
  clicksAll: number = 0;
  clickerDataToday: any[] = [];
  clickerDataWeek: any[] = [];
  clickerDataYear: any[] = [];

  // Replace single distances/trilateratedPos with arrays for multiple clickers
  clickerDataObjects: { id: string, distances: number[] }[] = [];
  trilateratedPos: { x: number, y: number } | null = null;
  trilateratedPositions: { x: number, y: number }[] = [];

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.officeSub = this.officeServ.officeId$.subscribe(async (id) => {
      this.loading = true;
      this.officeSpaceId = id;
      await Promise.all([
        this.loadQotd(),
        this.loadOffice(),
        this.loadClickerData()
      ]);
      this.updateTrilaterationMarkers();
      this.loading = false;
    });
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 60000);
  }

  ngAfterViewInit() {
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.officeSub) {
      this.officeSub.unsubscribe();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    window.removeEventListener('resize', this.handleWindowResize, false);
  }

  async loadQotd() {
    try {
      const responseQotd = await this.qotdServ.getQotdTodayForOffice(this.officeSpaceId);
      if (responseQotd) {
        this.qotd = responseQotd.question;
      } else {
        this.qotd = "No QOTD available for today";
      }
    } catch (error) {
      this.qotd = "No QOTD available for today";
    }
  }

  updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  async loadOffice() {
    if (!this.officeSpaceId) return;
    const offices = await this.officeServ.getAllOffices();
    this.office = offices.find(o => o.id === this.officeSpaceId);
    this.anchors = this.office?.anchors || [];
    this.floorPlan = this.office?.floorPlan || '';
    this.updateTrilaterationMarkers();
  }

  setupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    setTimeout(() => {
      if (this.floorImgRef && this.floorImgRef.nativeElement) {
        this.resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            const img = entry.target as HTMLImageElement;
            this.detailsImageWidth = img.clientWidth;
            this.detailsImageHeight = img.clientHeight;
          }
        });
        this.resizeObserver.observe(this.floorImgRef.nativeElement);
      }
    }, 0);
    window.addEventListener('resize', this.handleWindowResize, false);
  }

  handleWindowResize = () => {
    if (this.floorImgRef && this.floorImgRef.nativeElement) {
      const img = this.floorImgRef.nativeElement as HTMLImageElement;
      this.detailsImageWidth = img.clientWidth;
      this.detailsImageHeight = img.clientHeight;
      this.updateTrilaterationMarkers();
    }
  }

  onDetailsImageLoad(img: HTMLImageElement) {
    this.detailsImageWidth = img.clientWidth;
    this.detailsImageHeight = img.clientHeight;
    this.setupResizeObserver();
    this.updateTrilaterationMarkers();
  }

  updateTrilaterationMarkers() {
    if (!this.anchors || this.anchors.length < 3) {
      this.trilateratedPositions = [];
      return;
    }
    const scale = this.office?.scale || 40;
    this.trilateratedPositions = this.clickerDataToday.map(cd =>
      this.trilaterateLeastSquares(
        this.anchors,
        // Convert number[] to {id, distance}[] by pairing with anchor ids
        (cd.uwb.distances || []).map((distance: number, i: number) => ({
          id: this.anchors[i]?.id,
          distance
        })).filter((d: { id: number | undefined, distance: number }) => d.id !== undefined),
        this.detailsImageWidth,
        this.detailsImageHeight,
        scale
      )
    ).filter(pos => pos !== null) as { x: number, y: number }[];
  }

  trilaterateLeastSquares(
    anchors: { id: number, x: number, y: number }[],
    distances: { id: number, distance: number }[],
    imageWidth: number,
    imageHeight: number,
    scale: number
  ): { x: number, y: number } | null {
    if (!anchors || !distances || anchors.length < 3 || distances.length < 3) return null;
    // Match anchors and distances by id
    const anchorMap = new Map(anchors.map(a => [a.id, a]));
    const validPairs = distances
      .map(d => {
        const anchor = anchorMap.get(d.id);
        return anchor ? { anchor, distance: d.distance } : null;
      })
      .filter((pair): pair is { anchor: { id: number, x: number, y: number }, distance: number } => !!pair);
    if (validPairs.length < 3) return null;
    const points = validPairs.map(p => ({
      x: p.anchor.x * imageWidth,
      y: p.anchor.y * imageHeight
    }));
    const dists = validPairs.map(p => p.distance * scale);
    let x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    let y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    for (let iter = 0; iter < 100; iter++) {
      let gradX = 0, gradY = 0;
      for (let i = 0; i < points.length; i++) {
        const dx = x - points[i].x;
        const dy = y - points[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1e-6;
        const diff = dist - dists[i];
        gradX += (diff * dx) / dist;
        gradY += (diff * dy) / dist;
      }
      gradX *= 2 / points.length;
      gradY *= 2 / points.length;
      x -= 0.2 * gradX;
      y -= 0.2 * gradY;
    }
    return { x, y };
  }

  async loadClickerData() {
    try {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      const weekStartDate = monday;
      const yearStartDate = new Date(today.getFullYear(), 0, 1);
      this.clicksWeek = await this.clickerServ.getClicksWeek(this.officeSpaceId);
      this.clicksAll = await this.clickerServ.getClicksAll(this.officeSpaceId);
      this.clickerDataToday = await this.clickerServ.getClickerDataByDate(this.officeSpaceId, new Date(), new Date());
      this.clickerDataWeek = await this.clickerServ.getClickerDataByDate(this.officeSpaceId, weekStartDate, new Date());
      this.clickerDataYear = await this.clickerServ.getClickerDataByDate(this.officeSpaceId, yearStartDate, new Date());
    } catch (error) {
      console.error('Error loading clicker data:', error);
    }
  }
}
