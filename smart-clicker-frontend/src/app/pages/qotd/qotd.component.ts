import { Component, OnInit, OnDestroy } from "@angular/core";
import { startOfDay, isSameDay, isSameMonth } from "date-fns";
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarView,
  CalendarMonthModule,
  CalendarCommonModule,
} from "angular-calendar";
import { EventColor } from "calendar-utils";
import { GuardService } from "../../services/guard.service";
import * as icons from "@ng-icons/heroicons/outline";
import { QotdService } from "../../services/qotd.service";
import { NgIconsModule } from "@ng-icons/core";
import { ModalComponent } from "../../components";
import { Qotd } from "../../types/qotd";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ToastService } from "angular-toastify";
import { CommonModule } from "@angular/common";
import { OfficeService } from "../../services/office.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-qotd",
  templateUrl: "./qotd.component.html",
  imports: [
    CalendarMonthModule,
    CalendarCommonModule,
    NgIconsModule,
    ModalComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  styles: `
  ::ng-deep .cal-month-view .cal-day-badge {
    background-color: #0857c3;
  }
  `,
})
export class QotdComponent implements OnInit, OnDestroy {
  constructor(
    private guardServ: GuardService,
    private qotdService: QotdService,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private officeServ: OfficeService
  ) {
    this.editForm = this.formBuilder.group({
      question: new FormControl<string>("", [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(1000),
      ]),
      date: new FormControl<string>(new Date().toISOString().split("T")[0], [
        Validators.required,
      ]),
    });
    this.addForm = this.formBuilder.group({
      question: new FormControl<string>("", [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(1000),
      ]),
      date: new FormControl<string>(new Date().toISOString().split("T")[0], [
        Validators.required,
      ]),
    });
  }

  blue: EventColor = {
    primary: "#0857c3",
    secondary: "#D1E8FF",
  };

  editForm: FormGroup;
  addForm: FormGroup;
  icons = icons;
  qotds: CalendarEvent[] = [];
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  activeDayIsOpen: boolean = false;
  editingQotd: Qotd | null = null;
  editModal: boolean = false;
  addModal: boolean = false;

  officeSpaceId: string = '';
  private officeSub: Subscription | undefined;

  async ngOnInit(): Promise<void> {
    this.officeSub = this.officeServ.officeId$.subscribe(async (id) => {
      this.officeSpaceId = id;
      await this.getQotds();
    });
  }

  ngOnDestroy(): void {
    if (this.officeSub) {
      this.officeSub.unsubscribe();
    }
  }

  async getQotds() {
    await this.qotdService.getQotdsForOffice(this.officeSpaceId).then((qotds) => {
      this.qotds = qotds.map((qotd) => {
        return {
          id: qotd.id,
          title: qotd.question,
          start: startOfDay(qotd.date),
          color: this.blue,
          draggable: true,
          meta: {
            officeSpaceId: qotd.officeSpaceId,
          },
        } as CalendarEvent;
      });
    });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) {
        this.activeDayIsOpen = false;
      } else {
        if (events.length === 0 && date > new Date()) {
          this.handleAdd(date);
        } else if (events.length === 0 && date < new Date()) {
          this.toastService.error("You cannot select a past date.");
        } else {
          this.activeDayIsOpen = true;
        }
      }
      this.viewDate = date;
    }
  }

  async eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): Promise<void> {
    if (newStart < new Date()) {
      this.toastService.error("You cannot change the date to a past date.");
      return;
    }
    event.start = newStart;
    const newQotd: Qotd = {
      id: event.id as string,
      question: event.title,
      date: new Date(newStart),
      officeSpaceId: event.meta.officeSpaceId,
    };
    this.handleEdit(event, false);
    await this.onEdit(newQotd);
    this.activeDayIsOpen = false;
  }

  async deleteEvent(eventToDelete: CalendarEvent): Promise<void> {
    try {
      if (eventToDelete.start < new Date()) {
        this.toastService.error("You cannot delete a QOTD in the past.");
        return;
      }
      await this.qotdService.deleteQotd(
        eventToDelete.id as string,
        eventToDelete.meta.officeSpaceId
      );

      await this.getQotds();

      this.toastService.success("QOTD deleted successfully.");
    } catch (error) {
      this.toastService.error("Failed to delete QOTD.");
      console.error("Error deleting QOTD:", error);
    }
    this.activeDayIsOpen = false;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  onDiscard(): void {
    this.editingQotd = null;
    this.editModal = false;
    this.editForm.reset();
    this.addModal = false;
    this.addForm.reset();
    this.activeDayIsOpen = false;
  }

  async onEdit(editingQotd: Qotd): Promise<void> {
    if (this.editForm.invalid) {
      this.toastService.error("Please fill in all required fields.");
      return;
    }

    if (new Date(this.editForm.value.date) < new Date()) {
      this.toastService.error("You cannot change the date to a past date.");
      return;
    }

    const updatedQotd: Qotd = {
      id: editingQotd.id,
      question: this.editForm.value.question,
      date: new Date(this.editForm.value.date),
      officeSpaceId: editingQotd.officeSpaceId,
    };

    try {
      const response = await this.qotdService.updateQotd(updatedQotd);
      if (response) {
        this.toastService.success("QOTD updated successfully.");
        this.onDiscard();
        await this.getQotds();
      } else {
        this.toastService.error("Failed to update QOTD.");
      }
    } catch (error: any) {
      console.error("Error updating QOTD:", error);
      if (error.status === 400) {
        this.toastService.error("Another QOTD already exists for this date.");
      } else {
        this.toastService.error("An error occurred while updating the QOTD.");
      }
    }
  }

  handleEdit(event: CalendarEvent, modal: boolean): void {
    this.editingQotd = {
      id: event.id as string,
      question: event.title,
      date: new Date(event.start),
      officeSpaceId: event.meta.officeSpaceId,
    };
    const year = this.editingQotd.date.getFullYear().toString();
    const month =
      (this.editingQotd.date.getMonth() + 1 < 10 ? "0" : "") +
      (this.editingQotd.date.getMonth() + 1).toString();
    const day =
      (this.editingQotd.date.getDate() < 10 ? "0" : "") +
      this.editingQotd.date.getDate().toString();
    this.editForm.patchValue({
      question: this.editingQotd.question,
      date: `${year}-${month}-${day}`,
    });
    this.activeDayIsOpen = false;
    if (modal) {
      this.editModal = true;
    }
  }

  handleAdd(date: Date): void {
    const year = date.getFullYear().toString();
    const month =
      (date.getMonth() + 1 < 10 ? "0" : "") + (date.getMonth() + 1).toString();
    const day = (date.getDate() < 10 ? "0" : "") + date.getDate().toString();
    this.addModal = true;
    this.addForm.patchValue({
      date: `${year}-${month}-${day}`,
    });
  }

  async onAdd(): Promise<void> {
    if (this.addForm.invalid) {
      this.toastService.error("Please fill in all required fields.");
      return;
    }
    const newQotd: Qotd = {
      id: crypto.randomUUID(),
      question: this.addForm.value.question,
      date: new Date(this.addForm.value.date),
      officeSpaceId: this.officeSpaceId,
    };
    try {
      const response = await this.qotdService.createQotd(newQotd);
      if (response) {
        this.toastService.success("QOTD added successfully.");
        this.onDiscard();
        await this.getQotds();
      } else {
        this.toastService.error("Failed to add QOTD.");
      }
    } catch (error) {
      console.error("Error adding QOTD:", error);
      this.toastService.error("An error occurred while adding the QOTD.");
    }
  }
}
