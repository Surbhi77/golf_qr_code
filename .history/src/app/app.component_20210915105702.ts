import { Component ,NgZone, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AlertController, IonRouterOutlet, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  latitude: any = 0; //latitude
  longitude: any = 0; //longitude
  address: string;
  @ViewChild(IonRouterOutlet,{static: true}) routerOutlet:IonRouterOutlet;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar, 
    public router:Router,
    private alertController:AlertController,
    private loaction: Location,
    public storage:Storage
   
  ) {
    this.initializeApp();
  }

  ngAfterViewInit() {
    this.platform.backButton.subscribe();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.overlaysWebView(true);
      this.statusBar.backgroundColorByHexString('#ffffff');
      // this.statusBar.styleDefault();
      // this.splashScreen.hide();
      this.platform.backButton.subscribeWithPriority(10, () =>{
        if(!this.routerOutlet.canGoBack || this.router.url === '/login'){
          this.showExitConfirm();
        }
        else{
          this.loaction.back();
        }
        if(this.router.url === '/home' || this.router.url === '/login'){
          this.showExitConfirm();
        }
      });
      this.storage.get("isLoggedIn").then(res => {
        if(res){
          this.statusBar.styleDefault();
          this.splashScreen.hide();
          this.router.navigateByUrl('/home');
          return;
        }else{
         this.statusBar.styleDefault();
          this.splashScreen.hide();
          this.router.navigateByUrl('/login');
          return;
        }
       }, err =>{
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        this.router.navigateByUrl('/login');
        return;
      }); 
    });
  }

  showExitConfirm() {
    this.alertController.create({
      header: 'App exit',
      message: 'Do you want to close the app?',
      backdropDismiss: false,
      buttons: [{
        text: 'Stay',
        role: 'cancel',
        handler: () => {
          console.log('Application exit prevented!');
        }
       },{
        text: 'Exit',
        handler: () => {
          navigator['app'].exitApp();
        }
      }]
    })
      .then(alert => {
        alert.present();
      });
  }
 

}
