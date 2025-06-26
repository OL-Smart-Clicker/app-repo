import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import * as icons from "@ng-icons/heroicons/outline";
import { QotdService } from "../../services/qotd.service";
import { OfficeService } from "../../services/office.service";
import { Subscription } from "rxjs";
import { ClickerService } from "../../services/clicker.service";
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { NgIconsModule } from "@ng-icons/core";
import { TimelineChartComponent } from '../../components/timeline-chart/timeline-chart.component';
import { SpinnerComponent } from "../../components";
import { ToastService } from "angular-toastify";

@Component({
    selector: "app-home",
    templateUrl: "./data.component.html",
    standalone: true,
    imports: [FormsModule, CommonModule, NgIconsModule, TimelineChartComponent, SpinnerComponent],
})
export class DataComponent implements OnInit, OnDestroy, AfterViewInit {
    constructor(
        private qotdServ: QotdService, private officeServ: OfficeService, private clickerServ: ClickerService, private toastService: ToastService
    ) { }

    icons = icons;
    qotd: string = "";
    currentTime: string = '';
    officeSpaceId: string = '';
    private officeSub: Subscription | undefined;
    clickerData: any[] = [];
    startDate: string = '';
    endDate: string = '';
    office: any = null;

    floorPlan: string = '';
    anchors: { id: number, x: number, y: number }[] = [];

    clickerDataObjects: { id: string, distances: number[] }[] = [];
    trilateratedPos: { x: number, y: number } | null = null;
    trilateratedPositions: { x: number, y: number }[] = [];

    detailsImageWidth = 0;
    detailsImageHeight = 0;
    resizeObserver: ResizeObserver | null = null;
    @ViewChild('floorImg') floorImgRef!: any;
    @ViewChild('timelineChart') timelineChartRef!: ElementRef<HTMLDivElement>;
    loading = true;

    // Summary/statistics properties
    totalClicks: number = 0;
    busiestLabel: string = '';
    busiestCount: number = 0;
    avgTimeBetweenClicks: string = 'N/A';

    async ngOnInit(): Promise<void> {
        this.officeSub = this.officeServ.officeId$.subscribe(async (id) => {
            this.loading = true;
            this.officeSpaceId = id;
            const today = new Date();
            this.startDate = today.toISOString().slice(0, 10);
            this.endDate = today.toISOString().slice(0, 10);
            await Promise.all([
                this.loadOffice(),
                this.loadQotd(),
                this.loadClickerData()
            ]);
            this.updateTrilaterationMarkers();
            this.loading = false;
        });
    }

    ngAfterViewInit() {
        this.setupResizeObserver();
    }

    ngOnDestroy(): void {
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
                this.qotd = "No QOTD available for today :(";
            }
        } catch (error) {
            this.qotd = "No QOTD available for today :(";
        }
    }

    async loadClickerData() {
        try {
            const start = this.startDate ? new Date(this.startDate) : new Date();
            const end = this.endDate ? new Date(this.endDate) : new Date();
            this.clickerData = await this.clickerServ.getClickerDataByDate(this.officeSpaceId, start, end);
            this.computeSummaryStatistics();
        } catch (error) {
            console.error('Error loading clicker data:', error);
        }
    }

    computeSummaryStatistics() {
        const data = Array.isArray(this.clickerData) && this.clickerData;
        if (!data || data.length === 0) {
            this.totalClicks = 0;
            this.busiestLabel = '';
            this.busiestCount = 0;
            this.avgTimeBetweenClicks = 'N/A';
            return;
        }
        // Assume each entry has a timestamp property (ms since epoch)
        const timestamps = data.map(d => d.timestamp).filter(Boolean).sort((a, b) => a - b);
        this.totalClicks = timestamps.length;
        // Busiest day only
        const dayCounts: { [day: string]: number } = {};
        timestamps.forEach(ts => {
            const date = new Date(ts * 1000);
            const dayKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
            dayCounts[dayKey] = (dayCounts[dayKey] || 0) + 1;
        });
        // Find busiest day
        let maxDay = '', maxDayCount = 0;
        for (const [day, count] of Object.entries(dayCounts)) {
            if (count > maxDayCount) {
                maxDay = new Date(day).toDateString();
                maxDayCount = count;
            }
        }
        this.busiestLabel = maxDay;
        this.busiestCount = maxDayCount;
        // Average time between clicks
        if (timestamps.length < 2) {
            this.avgTimeBetweenClicks = 'N/A';
        } else {
            let totalDiff = 0;
            for (let i = 1; i < timestamps.length; i++) {
                totalDiff += (timestamps[i] * 1000 - timestamps[i - 1] * 1000);
            }
            const avgMs = totalDiff / (timestamps.length - 1);
            // Format as hh:mm:ss
            const avgSec = Math.floor(avgMs / 1000);
            const h = Math.floor(avgSec / 3600);
            const m = Math.floor((avgSec % 3600) / 60);
            const s = avgSec % 60;
            this.avgTimeBetweenClicks = `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
        }
    }

    async loadOffice() {
        if (!this.officeSpaceId) return;
        const offices = await this.officeServ.getAllOffices();
        this.office = offices.find(o => o.id === this.officeSpaceId);
        this.anchors = this.office?.anchors || [];
        this.floorPlan = this.office?.floorPlan || '';
        this.updateTrilaterationMarkers();
    }

    async downloadCSV() {
        const start = this.startDate ? new Date(this.startDate) : new Date();
        const end = this.endDate ? new Date(this.endDate) : new Date();
        try {
            await this.clickerServ.downloadClickerDataCSV(this.officeSpaceId, start, end);
            this.toastService.success('CSV downloaded successfully.');
        } catch (error) {
            this.toastService.error('Failed to download CSV.');
        }
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
        this.trilateratedPositions = this.clickerData.map(cd =>
            this.trilaterateLeastSquares(
                this.anchors,
                (cd.distances || []).map((distance: number, i: number) => ({
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
}