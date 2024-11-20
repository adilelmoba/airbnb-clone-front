import {computed, inject, Injectable, signal, WritableSignal} from '@angular/core';
import { HttpClient, HttpParams, HttpStatusCode } from "@angular/common/http";
import {Location} from "@angular/common";
import {Observable} from "rxjs";
import {State} from "../model/state.model";
import {User} from "../model/user.model";
import {environment} from "../../../environments/environment";
import { CsrfService } from '../crsf/csrf.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  http = inject(HttpClient);
  location = inject(Location);
  csrfService = inject(CsrfService);

  notConnected = "NOT_CONNECTED";

  private fetchUser$: WritableSignal<State<User>> =
    signal(State.Builder<User>().forSuccess({email: this.notConnected}));
  fetchUser = computed(() => this.fetchUser$());

  fetch(forceResync: boolean): void {
    this.fetchHttpUser(forceResync)
      .subscribe({
        next: user => this.fetchUser$.set(State.Builder<User>().forSuccess(user)),
        error: err => {
          if (err.status === HttpStatusCode.Unauthorized && this.isAuthenticated()) {
            this.fetchUser$.set(State.Builder<User>().forSuccess({email: this.notConnected}));
          } else {
            this.fetchUser$.set(State.Builder<User>().forError(err));
          }
        }
      })
  }

  login(): void {
    location.href = `${location.origin}${this.location.prepareExternalUrl("oauth2/authorization/okta")}`;
  }

  logout(): void {
    const headers = this.csrfService.createCsrfHeaders();

    this.http.post(`${environment.API_URL}/auth/logout`, {}, { headers })
      .subscribe({
        next: (response: any) => {
          console.log(response)
          this.fetchUser$.set(State.Builder<User>()
            .forSuccess({email: this.notConnected}));
          location.href = response.logoutUrl
        },
        error: (err: any) => {
          this.fetchUser$.set(State.Builder().forError(err));
          console.error("Logout error:", err);
        }
      })
  }

  isAuthenticated(): boolean {
    if (this.fetchUser$().value) {
      return this.fetchUser$().value!.email !== this.notConnected;
    } else {
      return false;
    }
  }

  fetchHttpUser(forceResync: boolean): Observable<User> {
    const params = new HttpParams().set('forceResync', forceResync);
    return this.http.get<User>(`${environment.API_URL}/auth/get-authenticated-user`, {params})
  }

  hasAnyAuthority(authorities: string[] | string): boolean {
    if(this.fetchUser$().value!.email === this.notConnected) {
      return false;
    }
    if(!Array.isArray(authorities)) {
      authorities = [authorities];
    }
    return this.fetchUser$().value!.authorities!
      .some((authority: string) => authorities.includes(authority));
  }

}