import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { State } from '../core/model/state.model';
import { CardListing, Listing } from '../landlord/model/listing.model';
import { createPaginationOption, Page, Pagination } from '../core/model/request.model';
import { CategoryName } from '../layout/navbar/category/category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TenantListingService {

  http = inject(HttpClient);

  private getAllByCategory$: WritableSignal<State<Page<CardListing>>>
   = signal(State.Builder<Page<CardListing>>().forInit());
   getAllByCategorySig = computed(() => this.getAllByCategory$());

   private getOneByPublicId$: WritableSignal<State<Listing>>
   = signal(State.Builder<Listing>().forInit());
   getOneByPublicIdSig = computed(() => this.getOneByPublicId$());

  constructor() { }

  getAllByCategory(pageRequest: Pagination, category: CategoryName) {
    let params = createPaginationOption(pageRequest);
    params = params.set("category", category);
    this.http.get<Page<CardListing>>(`${environment.API_URL}/tenant-listing/get-all-by-category`, { params })
      .subscribe({
        next: (displayListingCards) => {
          this.getAllByCategory$.set(State.Builder<Page<CardListing>>().forSuccess(displayListingCards))
        },
        error: (error) => {
          this.getAllByCategory$.set(State.Builder<Page<CardListing>>().forError(error))
        }
      })
  }

  resetGetAllCategory() {
    this.getAllByCategory$.set(State.Builder<Page<CardListing>>().forInit());
  }

  getOneByPublicId(publicId: string) {
    const params = new HttpParams().set("publicId", publicId);
    this.http.get<Listing>(`${environment.API_URL}/tenant-listing/get-one`, { params })
      .subscribe({
        next: (listing: Listing) => {
          this.getOneByPublicId$.set(State.Builder<Listing>().forSuccess(listing));
        },
        error: (error) => {
          this.getOneByPublicId$.set(State.Builder<Listing>().forError(error));
        }
      })
  }

  resetGetOneByPublicId() {
    this.getOneByPublicId$.set(State.Builder<Listing>().forInit());
  }
}
