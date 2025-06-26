import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-floor-planner',
    templateUrl: './floor-planner.component.html',
    styleUrl: './floor-planner.component.css',
    imports: [CommonModule]
})
export class FloorPlannerComponent implements OnChanges {
    @Input() floorPlanUrl: string | undefined = undefined;
    @Input() anchors: { id: number, x: number, y: number }[] = [];
    @Output() anchorsChange = new EventEmitter<{ id: number, x: number, y: number }[]>();
    @Output() done = new EventEmitter<boolean>();
    @ViewChild('floorImg') floorImg!: ElementRef<HTMLImageElement>;

    imageWidth = 0;
    imageHeight = 0;
    gridSize: number = 40;
    @Input() scale: number = 40;
    @Output() scaleChange = new EventEmitter<number>();

    ngOnChanges(changes: SimpleChanges) {
        if (changes["anchors"] && changes["anchors"].currentValue) {
            this.anchors = [...changes["anchors"].currentValue];
        }
        if (changes["scale"] && changes["scale"].currentValue !== undefined) {
            this.gridSize = changes["scale"].currentValue;
        }
    }

    onGridSizeChange(newSize: number) {
        this.gridSize = newSize;
    }

    onGridSizeInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = Number(input.value);
        if (!isNaN(value) && value >= 10 && value <= 500) {
            this.gridSize = value;
            this.scaleChange.emit(this.gridSize);
        }
    }

    onImageLoad(img: HTMLImageElement) {
        this.imageWidth = img.naturalWidth * (img.width / img.naturalWidth);
        this.imageHeight = img.naturalHeight * (img.height / img.naturalHeight);
    }

    addAnchor(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('anchor-dot')) return;
        const container = (event.target as HTMLElement).closest('div[style*="position: relative"]') as HTMLElement;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        let idStr = prompt('Enter anchor ID (number):');
        if (idStr === null) return;
        let id = Number(idStr);
        if (!Number.isInteger(id) || id < 1) {
            alert('Invalid ID. Please enter a positive integer.');
            return;
        }
        if (this.anchors.some(a => a.id === id)) {
            alert('ID already exists. Please choose a unique ID.');
            return;
        }
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        this.anchors = [...this.anchors, { id, x, y }];
        this.anchorsChange.emit(this.anchors);
    }

    removeAnchor(index: number, event: MouseEvent) {
        event.stopPropagation();
        this.anchors = this.anchors.filter((_, i) => i !== index);
        this.anchorsChange.emit(this.anchors);
    }

    save() {
        this.done.emit(true);
    }

    cancel() {
        this.done.emit(false);
    }
}
