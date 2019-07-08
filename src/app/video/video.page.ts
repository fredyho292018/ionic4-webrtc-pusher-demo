import { Component, OnInit } from '@angular/core';
import { PusherServiceService } from '../pusher-service.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { _document } from '@angular/platform-browser/src/browser';

declare var window: any;
declare var document: any;
@Component({
  selector: 'app-video',
  templateUrl: './video.page.html',
  styleUrls: ['./video.page.scss'],
})
export class VideoPage implements OnInit {
  usersOnline: number;
  id: string;
  users = [];
  sessionDesc: string;
  currentcaller: string;
  room: string;
  caller;
  localUserMedia;
  chanel;
  streamenlocal;
  streamenremote;
  miIds:[];

  constructor(
    public pusher: PusherServiceService,
    public http: HttpClient) {
  }
  ngOnInit() {
    this.cargar();
    

  }
  cargar() {

    this.chanel = this.pusher.initCanal('presence-videocall');

    this.chanel.bind('pusher:subscription_succeeded', (members) => {
      this.usersOnline = members.count;
      this.id = this.chanel.members.me.id;
      members.each((member) => {
        if (member.id != this.chanel.members.me.id) {
          this.users.push(member.id)
        }
      });
    });

    this.chanel.bind('pusher:member_added', (member) => {
      this.users.push(member.id)
    });

    this.chanel.bind('pusher:member_removed', (member) => {
      var index = this.users.indexOf(member.id);
      this.users.splice(index, 1);
      if (member.id == this.room) {
        this.endCall();
      }
    });

    this.GetRTCPeerConnection();
    this.GetRTCSessionDescription();
    this.GetRTCIceCandidate();
    this.prepareCaller();

    this.chanel.bind("client-candidate", (msg) => {
      if (msg.room == this.room) {
        console.log("candidate received");
        this.caller.addIceCandidate(new RTCIceCandidate(msg.candidate));
      }
    });

    this.chanel.bind("client-sdp", (msg) => {
      console.log('entro');
      if (msg.room == this.id) {
        console.log("sdp received");
        var answer = confirm("Tiene una llamada de: " + msg.from + " te gustaria responder?");
        if (!answer) {
          return this.chanel.trigger("client-reject", {
            "room": msg.room,
            "rejected": this.id
          });
        }
        this.room = msg.room;
        this.getCam()
          .then(stream => {
            this.localUserMedia = stream;

             if (window.URL) {
                  // document.getElementById("selfview").srcObject = evt.stream;
                 this.streamenlocal= stream;
             } else {
              // document.getElementById("selfview").src = stream;
              this.streamenlocal= stream;
             }
            this.streamenlocal = stream;
            this.caller.addStream(stream);

            var sessionDesc = new RTCSessionDescription(msg.sdp);
            this.caller.setRemoteDescription(sessionDesc);
            this.caller.createAnswer().then((sdp) => {
              this.caller.setLocalDescription(new RTCSessionDescription(sdp));
              this.chanel.trigger("client-answer", {
                "sdp": sdp,
                "room": this.room
              });
            });
          })
          .catch(error => {
            console.log('an error occured', error);
          })
      }
    });
    //Listening for answer to offer sent to remote peer
    this.chanel.bind("client-answer", (answer) => {
      console.log(answer);
      if (answer.room == this.room) {
        console.log("answer received");
        this.caller.setRemoteDescription(new RTCSessionDescription(answer.sdp));
      }
    });

    this.chanel.bind("client-reject", (answer) => {
      if (answer.room == this.room) {
        console.log("Call declined");
        alert("call to " + answer.rejected + "was politely declined");
        this.endCall();
      }
    });

    this.chanel.bind("client-endcall", (answer) => {
      if (answer.room == this.room) {
        console.log("Call Ended");
        this.endCall();
      }
    });
  }
   endCurrentCall() {

    this.chanel.trigger("client-endcall", {
        "room": this.room
    });

    this.endCall();
}
  endCall() {
    //this.room = undefined;
    this.room = null;
    this.caller.close();
    for (let track of this.localUserMedia.getTracks()) {
      track.stop();
    }
   // this.room =null;
    this.prepareCaller();
    //toggleEndCallButton();

  }
  GetRTCIceCandidate() {
    window.RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate ||
      window.mozRTCIceCandidate || window.msRTCIceCandidate;

    return window.RTCIceCandidate;
  }

  GetRTCPeerConnection() {
    window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection ||
      window.mozRTCPeerConnection || window.msRTCPeerConnection;
    return window.RTCPeerConnection;
  }

  GetRTCSessionDescription() {
    window.RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription ||
      window.mozRTCSessionDescription || window.msRTCSessionDescription;
    return window.RTCSessionDescription;
  }
  prepareCaller() {
    //Initializing a peer connection
    this.caller = new window.RTCPeerConnection();
    console.log(this.caller);

    //Listen for ICE Candidates and send them to remote peers
    this.caller.onicecandidate = (evt) => {
      if (!evt.candidate) return;
      console.log("onicecandidate called");
      this.onIceCandidate(this.caller, evt);
    };

    //onaddstream handler to receive remote feed and show in remoteview video element
    this.caller.onaddstream = (evt) => {
      console.log("onaddstream called");
      if (window.URL) {
        this.streamenremote = evt.stream;
        console.log('paso');
      } else {
        this.streamenremote = evt.stream;
      }

      console.log(evt);
    };
  }
  async camaras(){
    let d=await navigator.mediaDevices.enumerateDevices().then(
      (a)=>{
        console.log(a);
        let f=a.find(x=>x.kind== "videoinput");
        return f;
      }
    );
   
  }
  async getCam() {
    return navigator.mediaDevices.getUserMedia({
      video: true,
     // video: { facingMode: { exact: "user" } } ,
      audio: true
    });
  }
  callUser(user) {
    this.getCam()
      .then(stream => {
         if (window.URL) {
           console.log(stream);
           this.streamenlocal = stream;

         } else {
           this.streamenlocal = stream;
         }
      //  this.streamenlocal = stream;
        console.log(stream);
        this.caller.addStream(stream);
        this.localUserMedia = stream;
        this.caller.createOffer().then((desc) => {
          this.caller.setLocalDescription(new RTCSessionDescription(desc));
          this.chanel.trigger("client-sdp", {
            "sdp": desc,
            "room": user,
            "from": this.id
          });
          this.room = user;
        });
      })
      .catch(error => {
        console.log('an error occured', error);
      })
  };
  onIceCandidate(peer, evt) {
    if (evt.candidate) {
      this.chanel.trigger("client-candidate", {
        "candidate": evt.candidate,
        "room": this.room
      });
    }
  }
}
