import { Component, Input, ElementRef, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-timeline-chart',
    standalone: true,
    templateUrl: './timeline-chart.component.html',
})
export class TimelineChartComponent implements OnChanges, AfterViewInit {
    @Input() data: { timestamp: number }[] = [];

    private container: any;

    constructor(private el: ElementRef) { }

    ngAfterViewInit() {
        this.container = d3.select(this.el.nativeElement).select('.timeline-chart-container');
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
        // Aggregate clicks per day
        const dateCounts: { [date: string]: number } = {};
        for (const click of this.data) {
            const ts = click.timestamp ? new Date(click.timestamp) : null;
            if (!ts) continue;
            const dateStr = ts.toISOString().slice(0, 10); // YYYY-MM-DD
            dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        }
        const data = Object.entries(dateCounts)
            .map(([date, count]) => ({ date: new Date(date), count }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
        if (data.length === 0) return;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const containerWidth = this.el.nativeElement.offsetWidth || 400;
        const width = containerWidth - margin.left - margin.right;
        const height = 180 - margin.top - margin.bottom;
        const svg = this.container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMinYMin meet')
            .classed('w-full', true)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date) as [Date, Date])
            .range([0, width]);
        const yMax = d3.max(data, d => d.count) || 1;
        const y = d3.scaleLinear()
            .domain([0, yMax])
            .nice()
            .range([height, 0]);
        // Area
        const area = d3.area<any>()
            .x(d => x(d.date))
            .y0(height)
            .y1(d => y(d.count))
            .curve(d3.curveMonotoneX);
        svg.append('path')
            .datum(data)
            .attr('fill', '#2563eb33')
            .attr('stroke', '#2563eb')
            .attr('stroke-width', 2)
            .attr('d', area);
        // X Axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x)
                .ticks(Math.min(data.length, 5))
                .tickFormat((domainValue, _) => {
                    if (domainValue instanceof Date) {
                        return d3.timeFormat('%b %d')(domainValue);
                    } else if (typeof domainValue === 'number') {
                        return d3.timeFormat('%b %d')(new Date(domainValue));
                    }
                    return '';
                })
            )
            .selectAll('text')
            .style('text-anchor', 'end');
        // Y Axis
        svg.append('g')
            .call(d3.axisLeft(y).ticks(Math.min(yMax, 10)));
    }
}
