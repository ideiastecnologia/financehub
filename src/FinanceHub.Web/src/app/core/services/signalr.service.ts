import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Transaction } from '../models';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection?: HubConnection;
  transactionCreated$ = new Subject<Transaction>();
  transactionUpdated$ = new Subject<Transaction>();
  transactionDeleted$ = new Subject<string>();

  constructor(private authService: AuthService) {}

  startConnection(): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/dashboard`, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().then(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.hubConnection?.invoke('JoinDashboard', user.id);
    });

    this.hubConnection.on('TransactionCreated', (transaction: Transaction) => {
      this.transactionCreated$.next(transaction);
    });

    this.hubConnection.on('TransactionUpdated', (transaction: Transaction) => {
      this.transactionUpdated$.next(transaction);
    });

    this.hubConnection.on('TransactionDeleted', (id: string) => {
      this.transactionDeleted$.next(id);
    });
  }

  stopConnection(): void {
    this.hubConnection?.stop();
  }
}
