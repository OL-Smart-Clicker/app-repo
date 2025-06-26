import { Component, Input, ElementRef, OnChanges, SimpleChanges, AfterViewInit, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-bar-chart',
    standalone: true,
    templateUrl: './bar-chart.component.html',
    styleUrl: './bar-chart.component.css',
})
export class BarChartComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() data: any[] = [];

    private container: any;
    private weekData: { name: string, value: number }[] = [];

    constructor(private el: ElementRef) { }

    ngOnInit() {
        this.processWeekData();
    }

    ngAfterViewInit() {
        this.container = d3.select(this.el.nativeElement).select('.bar-chart-container');
        this.renderChart();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data']) {
            this.processWeekData();
        }
        if (this.container) {
            this.renderChart();
        }
    }

    private processWeekData() {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const bins = Array(7).fill(0);
        for (const d of this.data) {
            const date = new Date(d.timestamp * 1000);
            const dayIdx = (date.getDay() + 6) % 7;
            const weekStart = monday.getTime();
            const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;
            if (d.timestamp * 1000 >= weekStart && d.timestamp * 1000 < weekEnd) {
                bins[dayIdx]++;
            }
        }
        this.weekData = days.map((name, i) => ({ name, value: bins[i] }));
    }

    private renderChart() {
        if (!this.container) return;
        this.container.selectAll('*').remove();
        if (!this.weekData || this.weekData.length === 0) return;

        const margin = { top: 10, right: 30, bottom: 20, left: 40 };
        const width = 400 - margin.left - margin.right;
        const height = 250 - margin.top - margin.bottom;

        const svg = this.container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // X scale
        const x = d3.scaleBand()
            .domain(this.weekData.map(d => d.name))
            .range([0, width])
            .padding(0.1);

        // Y scale
        const y = d3.scaleLinear()
            .domain([0, d3.max(this.weekData, d => d.value) || 0])
            .nice()
            .range([height, 0]);

        // X axis (hide the axis line and ticks, only show day labels)
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .call((g: any) => {
                g.select('.domain').remove(); // Remove axis line
                g.selectAll('.tick line').remove(); // Remove tick lines
            })
            .selectAll('text')
            .attr('class', 'axis-label')
            .style('text-anchor', 'center');

        // Get current day name (e.g., 'Mon', 'Tue', ...)
        const now = new Date();
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const currentDayName = days[(now.getDay() + 6) % 7];

        svg.selectAll('.bar')
            .data(this.weekData)
            .enter().append('rect')
            .filter((d: any) => d.value > 0)
            .attr('class', 'bar')
            .attr('x', (d: any) => x(d.name)!)
            .attr('y', (d: any) => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', (d: any) => height - y(d.value))
            .attr('rx', 4) // Rounded corners
            .attr('ry', 4) // Rounded corners
            .attr('fill', (d: any) => {
                if (d.name === currentDayName) return '#0857c3'; // Highlight current day
                return '#cde0f8'; // Other days
            });
    }
}
