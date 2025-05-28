import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, NgIconsModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() cancelLabel?: string;
  @Input() confirmLabel?: string;
  @Input() cancelIcon?: string;
  @Input() confirmIcon?: string;
  @Input() formId?: string;

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Output() focusOut = new EventEmitter<void>();

  constructor() { }

  confirmClicked() {
    this.confirm?.emit();
  }

  cancelClicked() {
    this.cancel?.emit();
  }

  focusOutClicked() {
    this.focusOut?.emit();
  }

  onFocus(event: FocusEvent): void {
    const relatedTarget = event.target as HTMLElement;
    const popupElement = event.currentTarget as HTMLElement;
    if (popupElement === relatedTarget) {
      this.focusOutClicked()
    }
  }
}