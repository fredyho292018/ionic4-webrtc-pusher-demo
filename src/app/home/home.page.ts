import { Component,OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PusherServiceService } from '../pusher-service.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit  {

  constructor(
    public router:Router,
    public http : HttpClient,
    private pusher : PusherServiceService
    ) {

    }
    event: string = 'vote';
    vote: string = '';
    ifVoted : boolean = false;
    voteCount = {
      salah: 0,
      kane: 0,
      eriksen: 0,
      kevin: 0,
    };
    playerData = [
      {
        name: 'Mo. Salah',
        goals: 30,
        assists: 12,
        shortName: 'salah',
        image: 'https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/250x250/p118748.png'
      },
      {
        name: 'Christian Eriksen',
        goals: 8,
        assists: 13,
        shortName: 'eriksen',
        image: 'https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/250x250/p80607.png',
      },
      {
        name: 'Harry Kane',
        goals: 26,
        assists: 5,
        shortName: 'kane',
        image:
          'https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/40x40/p78830.png',
      },
      {
        name: "Kevin De'bruyne",
        goals: 10,
        assists: 17,
        shortName: 'kevin',
        image: 'https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/40x40/p61366.png',
      },
  ];
    sendVotes(player){
      this.http.post('https://fc3880ee.ngrok.io/vote', { player }).subscribe((res : any) => {
        this.vote  = res.player;
        this.ifVoted = true;

      });
      console.log('send');
    }
    getVoteClasses(player){
      return {
        elect : this.ifVoted && this.vote === player,
        lost : this.ifVoted && this.vote !== player
      }
    }
    ngOnInit(): void {
      const channel = this.pusher.init();
      channel.bind(this.event, ({ player }) => {
        this.voteCount[player.shortName] += 1
      });
      
    }
    ionViewDidLoad(){
      const channel = this.pusher.init();
      channel.bind(this.event, ({ player }) => {
        this.voteCount[player.shortName] += 1
      });
    }
    
  

}
