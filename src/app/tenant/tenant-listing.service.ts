import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { State } from '../core/model/state.model';
import { CardListing } from '../landlord/model/listing.model';
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
}
