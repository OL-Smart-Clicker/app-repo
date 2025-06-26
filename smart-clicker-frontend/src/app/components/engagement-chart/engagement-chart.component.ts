import { Component, Input, ElementRef, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-engagement-chart',
    standalone: true,
    templateUrl: './engagement-chart.component.html',
    styleUrl: './engagement-chart.component.css',
})
export class EngagementChartComponent implements OnChanges, AfterViewInit {
    @Input() data: { timestamp: number }[] = [];

    private container: any;

    constructor(private el: ElementRef) { }

    ngAfterViewInit() {
        this.container = d3.select(this.el.nativeElement).select('.engagement-calendar-container');
        this.renderChart();
    }

    ngOnChanges(_: SimpleChanges) {
        if (this.container) {
            this.renderChart();
        }
    }

    private renderChart() {
        this.container.selectAll('*').remove();
        if (!this.data || this.data.length === 0) return;

        // Aggregate by week of month
        const parseWeek = (date: Date) => {
            const first = new Date(date.getFullYear(), date.getMonth(), 1);
            return Math.floor((date.getDate() + first.getDay() - 1) / 7);
        };
        const weekCounts: { [key: string]: number } = {};
        this.data.forEach(d => {
            const date = new Date(d.timestamp);
            const key = `${date.getFullYear()}-${date.getMonth()}-${parseWeek(date)}`;
            weekCounts[key] = (weekCounts[key] || 0) + 1;
        });

        // Get all months of the year (Jan to Dec of the current year)
        const year = new Date().getFullYear();
        const months = Array.from({ length: 12 }, (_, i) => `${year}-${i}`);

        // Prepare chart dimensions (horizontal layout with gap)
        const cellSize = 24;
        const colGap = 8; // gap between months
        const width = months.length * cellSize + (months.length - 1) * colGap;
        const height = cellSize * 5;

        const svg = this.container.append('svg')
            .attr('width', width)
            .attr('height', height + 30);

        // Color scale with 4 discrete colors
        const maxCount = d3.max(Object.values(weekCounts)) || 1;
        const colorScale = d3.scaleThreshold<number, string>()
            .domain([
                maxCount * 0.25,
                maxCount * 0.5,
                maxCount * 0.75
            ])
            .range(['#cde0f8', '#468de5', '#0857c3', '#ee5340']);

        // Draw cells (horizontal: months as columns, weeks as rows)
        months.forEach((monthKey, mi) => {
            const [year, month] = monthKey.split('-').map(Number);
            const xOffset = mi * (cellSize + colGap);
            for (let week = 0; week < 5; week++) {
                const key = `${year}-${month}-${week}`;
                const count = weekCounts[key] || 0;
                svg.append('rect')
                    .attr('x', xOffset)
                    .attr('y', week * cellSize + 20)
                    .attr('width', cellSize - 2)
                    .attr('height', cellSize - 2)
                    .attr('class', 'week-cell')
                    .attr('fill', colorScale(count));
            }
            // Month label (on top)
            svg.append('text')
                .attr('x', xOffset + cellSize / 2)
                .attr('y', 14)
                .attr('text-anchor', 'middle')
                .attr('class', 'month-label')
                .text(d3.timeFormat('%b')(new Date(year, month)));
        });
        // Week labels (left)
        for (let week = 0; week < 5; week++) {
            svg.append('text')
                .attr('x', -4)
                .attr('y', week * cellSize + 20 + cellSize / 1.5)
                .attr('text-anchor', 'end')
                .attr('class', 'month-label')
                .text('W' + (week + 1));
        }
    }
}
