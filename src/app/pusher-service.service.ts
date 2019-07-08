import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
declare const Pusher: any;

@Injectable({
  providedIn: 'root'
})
export class PusherServiceService {
  channel;
  pusher;
  constructor(
    public http: HttpClient,

  ) {
    // var pusher = new Pusher('12849a707db177b519a2', {
    //   cluster: 'eu',
    //   encrypted: true,
    // });
    
  }
  public init() {
    this.pusher = new Pusher('f5dbab88b70d6bf871a2', {
      cluster: 'eu',
      encrypted: true,
      authEndpoint: 'pusher/auth'
  });
    this.channel = this.pusher.subscribe('vote-channel');
    return this.channel;
  }
  public initCanal(canal:string) {
    let pusher = new Pusher('f5dbab88b70d6bf871a2', {
      cluster: 'eu',
      encrypted: true, 
    
      authEndpoint: 'https://aa15d89c.ngrok.io/pusher/auth'
  });
    let channel = pusher.subscribe(canal);
    return channel;
  }


}
