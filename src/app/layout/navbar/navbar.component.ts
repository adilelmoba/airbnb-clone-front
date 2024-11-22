import { Component, effect, inject, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { CategoryComponent } from './category/category.component';
import { AvatarComponent } from './avatar/avatar.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuItem } from 'primeng/api';
import { ToastService } from '../toast.service';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/model/user.model';
import { environment } from '../../../environments/environment';
import { PropertiesCreateComponent } from '../../landlord/properties-create/properties-create.component';
import { SearchComponent } from '../../tenant/search/search.component';
import { ActivatedRoute } from '@angular/router';
import dayjs from 'dayjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    ButtonModule,
    FontAwesomeModule,
    ToolbarModule,
    MenuModule,
    CategoryComponent,
    AvatarComponent
  ],
  providers: [DialogService],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  
  location: string = 'Anywhere';
  guests: string = 'Add guests';
  dates: string = 'Any week';

  toastService: ToastService = inject(ToastService);
  authService: AuthService = inject(AuthService);
  dialogService: DialogService = inject(DialogService);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  ref: DynamicDialogRef | undefined;

  logIn = () => this.authService.login();

  logOut = () => this.authService.logout();

  currentMenuItems: MenuItem[] | undefined = [];
  connectedUser: User = { email: this.authService.notConnected };

  constructor() {
    effect(() => {
      if(this.authService.fetchUser().status === "OK") {
        this.connectedUser = this.authService.fetchUser().value!;
        this.currentMenuItems = this.fetchMenu();
      }
    });
  }
  
  ngOnInit(): void {
    this.authService.fetch(false);
    this.extractInformationFromSearch();
  }

  private fetchMenu(): MenuItem[] {
    if (this.authService.isAuthenticated()) {
      return [
        {
          label: "My properties",
          routerLink: "landlord/properties",
          visible: this.hasToBeLandLord(),
        },
        {
          label: "My booking",
          routerLink: "booking",
        },
        {
          label: "My reservation",
          routerLink: "landlord/reservation",
          visible: this.hasToBeLandLord(),
        },
        {
          label: "Log out",
          command: this.logOut
        },
      ]
    } else {
      return [
        {
          label: "Sign up",
          styleClass: "font-bold",
          command: this.logIn
        },
        {
          label: "Log in",
          command: this.logIn
        }
      ]
    }
  }

  hasToBeLandLord(): boolean {
    return this.authService.hasAnyAuthority("ROLE_LANDLORD");
  }

  openNewListing():void {
    this.ref = this.dialogService.open(PropertiesCreateComponent, {
      width: "60%",
      header: "Airbnb your home",
      closable: true,
      focusOnShow: true,
      modal: true,
      showHeader: true,
    });
  }

  openNewSearch() {
    this.ref = this.dialogService.open(SearchComponent, {
      width: "40%",
      header: "Search",
      closable: true,
      focusOnShow: true,
      modal: true,
      showHeader: true,
    });
  }

  private extractInformationFromSearch() {
    this.activatedRoute.queryParams.subscribe({
      next: (params) => {
        if(params["location"]) {
          this.location = params["location"];
          this.guests = params["guests"] + " guests";
          this.dates = dayjs(params["startDate"]).format("MMM-DD") + " to " + dayjs(params["endDate"]).format("MMM-DD");
        } else if(this.location !== "Anywhere") {
          this.location = "Anywhere";
          this.guests = "Add guests";
          this.dates = "Any week";
        }
      }
    })
  }
}

  

