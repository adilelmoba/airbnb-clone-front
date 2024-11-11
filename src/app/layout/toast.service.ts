import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  public INIT_STATE: string = "INIT";

  private send$ = new BehaviorSubject<Message>({summary: this.INIT_STATE});
  public sendSub = this.send$.asObservable(); 

  constructor() { }

  public send(message: Message): void {
    this.send$.next(message);
  }
}
