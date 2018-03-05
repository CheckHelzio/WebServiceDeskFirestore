import {Inject, Injectable} from '@angular/core';
import * as firebase from 'firebase';
import {FirebaseApp} from 'angularfire2';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class MessagingService {

  currentMessage = new BehaviorSubject(null);
  messaging = firebase.messaging();

  constructor(@Inject(FirebaseApp) private _firebaseApp: firebase.app.App) {
    console.log('service constructor');
  }

  // get permission to send messages
  getPermission() {
    this.messaging.requestPermission()
      .then(() => {
        console.log('Notification permission granted.');
        return this.messaging.getToken();
      })
      /*.then(token => {
        console.log(token)
        this.updateToken(token)
      })*/
      .catch((err) => {
        console.log('Unable to get permission to notify.', err);
      });
  }

  receiveMessage() {
    this.messaging.onMessage((payload) => {
      console.log('Message received. ', payload);
      this.currentMessage.next(payload);
    });

  }

}
