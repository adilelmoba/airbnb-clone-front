import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { BookingService } from '../service/booking.service';
import { ToastService } from '../../layout/toast.service';
import { BookedListing } from '../model/booking.model';
import { CardListingComponent } from "../../shared/card-listing/card-listing.component";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-booked-listing',
  standalone: true,
  imports: [
    CardListingComponent,
    FontAwesomeModule
  ],
  templateUrl: './booked-listing.component.html',
  styleUrl: './booked-listing.component.scss'
})
export class BookedListingComponent implements OnInit, OnDestroy {

  bookingService = inject(BookingService);
  toastService = inject(ToastService);
  bookedListings = new Array<BookedListing>;

  loading = false;

  constructor() { 
    this.listenFetchBooking();
    this.listenCancelBooking();
  }

  ngOnDestroy(): void {
    this.bookingService.resetCancel();
  }

  ngOnInit(): void {
    this.fetchBooking();
  }

  fetchBooking() {
    this.loading = true;
    this.bookingService.getBookedListing();
  }

  onCancelBooking(bookedListing: BookedListing) {
    bookedListing.loading = true;
    this.bookingService.cancel(bookedListing.bookingPublicId, bookedListing.listingPublicId, false);
  }

  private listenFetchBooking() {
    effect(() => {
      const bookedListingState = this.bookingService.getBookedListingSig();
      if(bookedListingState.status === "OK") {
        this.loading = false;
        this.bookedListings = bookedListingState.value!;
      } else if (bookedListingState.status === "ERROR") {
        this.loading = false;
        this.toastService.send({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch the listing'
        })
      }
    });
  }

  private listenCancelBooking() {
   effect(() => {
    const cancelState = this.bookingService.cancelSig();
    if(cancelState.status === "OK") {
      const listingToDeleteIndex = this.bookedListings.findIndex(listing => listing.bookingPublicId === cancelState.value);
      this.bookedListings.splice(listingToDeleteIndex, 1);
      this.toastService.send({
        severity: 'success',
        summary: 'Success',
        detail: 'Successfully cancelled booking'
      });
    } else if(cancelState.status === "ERROR") {
      const listingToDeleteIndex = this.bookedListings.findIndex(listing => listing.bookingPublicId === cancelState.value);
      this.bookedListings[listingToDeleteIndex].loading = false
      this.toastService.send({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to cancel booking'
      });
    }
   });
  }

}
