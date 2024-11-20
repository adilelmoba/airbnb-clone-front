import { Component, effect, inject, input, OnDestroy, OnInit } from '@angular/core';
import { Listing } from '../../landlord/model/listing.model';
import { BookingService } from '../service/booking.service';
import { ToastService } from '../../layout/toast.service';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import { BookedDatesDTOFromClient, CreateBooking } from '../model/booking.model';
import { CurrencyPipe } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { MessagesModule } from 'primeng/messages';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-book-date',
  standalone: true,
  imports: [
    CurrencyPipe,
    CalendarModule,
    MessagesModule,
    FormsModule,
  ],
  templateUrl: './book-date.component.html',
  styleUrl: './book-date.component.scss'
})
export class BookDateComponent implements OnInit, OnDestroy {

  listing = input.required<Listing>();
  listingPublicId = input.required<string>();

  bookingService = inject(BookingService);
  toastService = inject(ToastService);
  authService = inject(AuthService);
  router = inject(Router);

  bookingDates = new Array<Date>();
  totalPrice = 0;

  minDate = new Date();
  bookedDates = new Array<Date>();

  constructor() {
    this.listenToCheckAvailableDate();
    this.listenToCreateBooking();
  }

  ngOnDestroy(): void {
    this.bookingService.resetCreateBooking();
  }

  ngOnInit(): void {
    this.bookingService.checkAvailability(this.listingPublicId());
  }

  onDateChange(newBookingDates: Array<Date>) {
    this.bookingDates = newBookingDates;
    
    if(this.validateMakeBooking()) {
      const startBookingdateDayJS = dayjs(newBookingDates[0]);
      const endBookingdateDayJS = dayjs(newBookingDates[1]);
      this.totalPrice = endBookingdateDayJS.diff(startBookingdateDayJS, 'days') * this.listing().price.value;
    } else {
      this.totalPrice = 0;
    }
  }

  validateMakeBooking() {
    return this.bookingDates.length == 2
    && this.bookingDates[0] !== null
    && this.bookingDates[1] !== null
    && this.bookingDates[0].getDate() !== this.bookingDates[1].getDate()
    && this.authService.isAuthenticated();
  }

  onNewBooking() {
    const newBooking: CreateBooking = {
      listingPublicId: this.listingPublicId(),
      startDate: this.bookingDates[0],
      endDate: this.bookingDates[1],
    }
    this.bookingService.create(newBooking);
  }

  listenToCheckAvailableDate() {
    effect(() => {
      const checkAvailabilityState = this.bookingService.checkAvailabilitySig();
      if(checkAvailabilityState.status === "OK") {
        this.bookedDates = this.mapBookedDates(checkAvailabilityState.value!);
      } else if(checkAvailabilityState.status === "ERROR") {
       this.toastService.send({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while checking the availability of the property"
       });
      }
    });
  }

  private mapBookedDates(BookedDatesDTOFromClient: Array<BookedDatesDTOFromClient>): Array<Date> {
    const bookedDates = new Array<Date>();
    for(let bookedDate of BookedDatesDTOFromClient) {
      bookedDates.push(...this.getDatesInRange(bookedDate));
    }
    return bookedDates;
  }

  private getDatesInRange(bookedDate: BookedDatesDTOFromClient) {
    const dates = new Array<Date>();
    let currentDate = bookedDate.startDate;
    while(currentDate <= bookedDate.endDate) {
      dates.push(currentDate.toDate());
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  }

  private listenToCreateBooking() {
   effect(() => {
    const createBookingState = this.bookingService.createBookingSig();
    if(createBookingState.status === "OK") {
      this.toastService.send({
        severity: "success",
        summary: "Success",
        detail: "Booking created successfully"
      });
      this.router.navigate(['/booking']);
    } else if (createBookingState.status === "ERROR") {
      this.toastService.send({
        severity: "error",
        summary: "Error",
        detail: "An error occurred while creating the booking"
      });
    }
   });
  }

}
