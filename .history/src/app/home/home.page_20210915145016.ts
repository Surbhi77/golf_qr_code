import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Storage } from '@ionic/storage';
import { Helper } from '../common/helper';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  scannedData: any;
  encodedData: '';
  encodeData: any;
  inputData: any;
  latitude: any = 0; //latitude
  longitude: any = 0; //longitude
  address: any = [];
  userlocation: any;
  options: GeolocationOptions;
  currentPos: Geoposition;
  subscription: any;
  locationCoords: any;
  apiResponse: any;
  times: any;
  locCords: any;
  
  constructor(
    private barcodeScanner: BarcodeScanner,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private router:Router,
    public storage:Storage,
    public helper:Helper,
    private androidPermissions: AndroidPermissions,
    private locationAccuracy: LocationAccuracy) { 
      // this.getCurrentCoordinates()
      this.locCords = {
        latitude: "",
        longitude: "",
        accuracy: "",
        timestamp: ""
      }
     this.times = Date.now();
    }

  scanBarcode() {
    const options: BarcodeScannerOptions = {
      preferFrontCamera: false,
      showFlipCameraButton: true,
      showTorchButton: true,
      torchOn: false,
      prompt: 'Place a barcode inside the scan area',
      resultDisplayDuration: 500,
      formats: 'EAN_13,EAN_8,QR_CODE,PDF_417 ',
      orientation: 'portrait',
    };

    this.barcodeScanner.scan(options).then(barcodeData => {
      console.log('Barcode data', barcodeData);
      this.scannedData = barcodeData;

    }).catch(err => {
      console.log('Error', err);
      if(err){
        this.helper.presentToast(err)
      }  
    });
  }

  createBarcode() {
    this.barcodeScanner.encode(this.barcodeScanner.Encode.TEXT_TYPE, this.inputData).then((encodedData) => {
      console.log(encodedData);
      this.encodedData = encodedData;
    }, (err) => {
      console.log('Error occured : ' + err);
      if(err){
        this.helper.presentToast(err)
      }
    });
  }

  chckAppGpsPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
      result => {
        if (result.hasPermission) {
          this.requestToSwitchOnGPS();
        } else {
          this.askGPSPermission();
        }
        this.getUserLocation()
      },
      err => {
        this.helper.presentToast(JSON.parse(err));
      }
    );
  }

  askGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
      } else {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(
            () => {
              this.requestToSwitchOnGPS();
            },
            error => {
              this.helper.presentToast(JSON.parse(error))
            }
          );
      }
    });
  }

  requestToSwitchOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        this.getLocationAccCords()
      },
      error => this.helper.presentToast(JSON.stringify(error))
    );
  }

  getLocationAccCords() {
    this.geolocation.getCurrentPosition().then((response) => {
      this.locCords.latitude = response.coords.latitude;
      this.locCords.longitude = response.coords.longitude;
      this.locCords.accuracy = response.coords.accuracy;
      this.locCords.timestamp = response.timestamp;
    }).catch((err) => {
      alert('Error: ' + err);
    });
  }
  
  getUserLocation(){
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.helper.presentLoading().then(()=>{
      this.geolocation.getCurrentPosition().then(resp => {
        this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
          .then((result: NativeGeocoderResult[]) => {
            this.userlocation = JSON.stringify(result[0]);
            this.address = JSON.parse(this.userlocation)
            this.helper.dismissLoading()
          }, error => {
            console.log(error)
            this.helper.dismissLoading()
            this.helper.presentToast('getting err'+JSON.stringify(error))
          });
      }, error => {
        this.helper.dismissLoading()
        console.log('Error getting location', error);
        this.helper.presentToast('Error getting location'+ JSON.stringify(error))
      })
    })
   
  }

  logout(){
    this.storage.clear()
    this.router.navigateByUrl("/login");
    
  }

}
