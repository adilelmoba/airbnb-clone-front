import { Component, inject, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CategoryService } from './category.service';
import { Category, CategoryName } from './category.model';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    FontAwesomeModule
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit {

  categoryService: CategoryService = inject(CategoryService);

  categories: Category[] | undefined;

  currentActivatedCategory: Category = this.categoryService.getCategoryByDefault();

  isHome = false;
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void { 
    this.listenRouter();
    console.log(this.currentActivatedCategory);
    this.currentActivatedCategory.activated = false;
    this.fetchCategories();  
  }

  private fetchCategories(): void {
    this.categories = this.categoryService.getCategories();
  }

  listenRouter() {
    this.router.events.pipe(
      filter((event) : event is NavigationEnd => event instanceof NavigationEnd)
    )
      .subscribe({
        next: (event: NavigationEnd) => {
          this.isHome = event.url.split("?")[0] === "/";
          if(this.isHome && event.url.indexOf("?") === -1) {
            const allCategory = this.categoryService.getCategoryByTechnicalName("ALL");
            if (allCategory) {
              this.activateCategory(allCategory);
              this.categoryService.changeCategory(allCategory);
            }
          }
        },
      });

      this.activatedRoute.queryParams
        .pipe(
          map(params => params["category"])
        )
        .subscribe({
          next: (categoryName: CategoryName) => {
            const category = this.categoryService.getCategoryByTechnicalName(categoryName);
            if(category) {
              this.activateCategory(category);
              this.categoryService.changeCategory(category);
            }
          }
        })
  }

  activateCategory(category: Category) {
    this.currentActivatedCategory.activated = false;
    this.currentActivatedCategory = category;
    this.currentActivatedCategory.activated = true;
  }

  onChangeCategory(category: Category) {
    this.activateCategory(category);
    this.router.navigate([], {
      queryParams: { "category": category.technicalName },
      relativeTo: this.activatedRoute
    });
  }
}
