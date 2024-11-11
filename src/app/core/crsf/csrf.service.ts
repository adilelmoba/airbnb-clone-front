import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private readonly csrfCookieName = 'XSRF-TOKEN';
  private readonly csrfHeaderName = 'X-XSRF-TOKEN';

  // Method to get the CSRF token from cookies
  getCsrfTokenFromCookie(): string | null {
    const csrfCookie = document.cookie.split('; ').find(row => row.startsWith(`${this.csrfCookieName}=`));
    return csrfCookie ? csrfCookie.split('=')[1] : null;
  }

  // Method to create headers with CSRF token, if available
  createCsrfHeaders(): HttpHeaders {
    const csrfToken = this.getCsrfTokenFromCookie();
    let headers = new HttpHeaders();

    if (csrfToken) {
      headers = headers.set(this.csrfHeaderName, csrfToken);
    }

    return headers;
  }
}