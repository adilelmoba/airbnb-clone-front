import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { TenantListingService } from '../tenant/tenant-listing.service';
import { ToastService } from '../layout/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CardListing } from '../landlord/model/listing.model';
import { Pagination } from '../core/model/request.model';
import { Subscription } from 'rxjs';
import { CategoryService } from '../layout/navbar/category/category.service';
import { Category } from '../layout/navbar/category/category.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CardListingComponent } from "../shared/card-listing/card-listing.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FontAwesomeModule,
    CardListingComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  tenantListingService = inject(TenantListingService); 
  toastService = inject(ToastService);
  categoryService = inject(CategoryService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);

  listings: Array<CardListing> | undefined;
  
  pageRequest: Pagination = { size: 20, page: 0, sort: [] };

  loading = false;

  categoryServiceSubscription: Subscription | undefined;

  constructor() { 
    this.listenToGetAllCategory();
  }
  
  private listenToGetAllCategory() {
    effect(() => {
      const categoryListingsState = this.tenantListingService.getAllByCategorySig();
      if(categoryListingsState.status === "OK") {
        this.listings = categoryListingsState.value?.content;
        this.loading = false;
      } else if(categoryListingsState.status === "ERROR") {
        this.toastService.send({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred while fetching listings'
        });
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.tenantListingService.resetGetAllCategory();
    if(this.categoryServiceSubscription) {
      this.categoryServiceSubscription.unsubscribe();
    }
  }

  ngOnInit() { 
    this.listenToChangeCategory()
  }

  listenToChangeCategory() {
    this.categoryServiceSubscription = this.categoryService.changeCategoryObs.subscribe({
      next: (category: Category) => {
        this.loading = true;
        this.tenantListingService.getAllByCategory(this.pageRequest, category.technicalName);
      }
    })
  }

}
