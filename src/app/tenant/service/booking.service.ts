import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { State } from '../../core/model/state.model';
import { BookedDatesDTOFromClient, BookedDatesDTOFromServer, BookedListing, CreateBooking } from '../model/booking.model';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  
  private http = inject(HttpClient);

  private createBooking$: WritableSignal<State<boolean>>
    = signal(State.Builder<boolean>().forInit());
  createBookingSig = computed(() => this.createBooking$());

  private checkAvailability$: WritableSignal<State<Array<BookedDatesDTOFromClient>>>
    = signal(State.Builder<Array<BookedDatesDTOFromClient>>().forInit());
  checkAvailabilitySig = computed(() => this.checkAvailability$());

  private getBookedListing$: WritableSignal<State<Array<BookedListing>>>
    = signal(State.Builder<Array<BookedListing>>().forInit());
  getBookedListingSig = computed(() => this.getBookedListing$());

  private cancel$: WritableSignal<State<string>>
    = signal(State.Builder<string>().forInit());
  cancelSig = computed(() => this.cancel$());

  private getBookedListingForLandlord$: WritableSignal<State<Array<BookedListing>>>
    = signal(State.Builder<Array<BookedListing>>().forInit());
  getBookedListingForLandlordSig = computed(() => this.getBookedListingForLandlord$());

  create(newBooking: CreateBooking) {
    this.http.post<boolean>(`${environment.API_URL}/booking/create`, newBooking)
      .subscribe({
        next: (created) => {
          this.createBooking$.set(State.Builder<boolean>().forSuccess(created));
        },
        error: (error) => {
          this.createBooking$.set(State.Builder<boolean>().forError(error));
        }
      })
  }

  constructor() { }

  checkAvailability(publicId: string) {
    const params = new HttpParams().set("listingPublicId", publicId);
    this.http.get<Array<BookedDatesDTOFromServer>>(`${environment.API_URL}/booking/check-availability`, { params })
      .pipe(
        map(this.mapDateToDayJS())
      ).subscribe({
        next: (bookedDates) => {
          this.checkAvailability$.set(State.Builder<Array<BookedDatesDTOFromClient>>().forSuccess(bookedDates));
        },
        error: (error) => {
          this.checkAvailability$.set(State.Builder<Array<BookedDatesDTOFromClient>>().forError(error));
        }
      })
  }

  resetCreateBooking() {
    this.createBooking$.set(State.Builder<boolean>().forInit());
  }

  private mapDateToDayJS = () => {
    return (bookedDates: Array<BookedDatesDTOFromServer>): Array<BookedDatesDTOFromClient> => {
      return bookedDates.map(reservedDate => this.convertDateToDayJS(reservedDate))
    }
  }

  private convertDateToDayJS<T extends BookedDatesDTOFromServer>(dto: T): BookedDatesDTOFromClient {
    return {
      ...dto,
      startDate: dayjs(dto.startDate),
      endDate: dayjs(dto.endDate)
    };
  }
  
  getBookedListing() {
    this.http.get<Array<BookedListing>>(`${environment.API_URL}/booking/get-booked-listing`)
      .subscribe({
        next: (bookedListing: Array<BookedListing>) => {
          this.getBookedListing$.set(State.Builder<Array<BookedListing>>().forSuccess(bookedListing));
        },
        error: (error) => {
          this.getBookedListing$.set(State.Builder<Array<BookedListing>>().forError(error));
        }
      })
  }

  cancel(bookingPublicId: string, listingPublicId: string, byLandlord: boolean) {
    const params = new HttpParams()
      .set("bookingPublicId", bookingPublicId)
      .set("listingPublicId", listingPublicId)
      .set("byLandlord", byLandlord);
    this.http.delete<string>(`${environment.API_URL}/booking/cancel`, { params })
      .subscribe({
        next: canceledPublicId => {
          this.cancel$.set(State.Builder<string>().forSuccess(canceledPublicId));
        },
        error: (error) => {
          this.cancel$.set(State.Builder<string>().forError(error));
        }
      })
  }

  resetCancel() {
    this.cancel$.set(State.Builder<string>().forInit());
  }

  getBookedListingForLandlord() {
    this.http.get<Array<BookedListing>>(`${environment.API_URL}/booking/get-booked-listing-for-landlord`)
      .subscribe({
        next: (bookedListing: Array<BookedListing>) => {
          this.getBookedListingForLandlord$.set(State.Builder<Array<BookedListing>>().forSuccess(bookedListing));
        },
        error: (error) => {
          this.getBookedListingForLandlord$.set(State.Builder<Array<BookedListing>>().forError(error));
        }
      })
  }

}
