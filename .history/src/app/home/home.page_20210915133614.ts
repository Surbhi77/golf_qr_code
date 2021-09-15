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
  
  constructor(
    private diagnostic: Diagnostic,
    private barcodeScanner: BarcodeScanner,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private router:Router,
    public storage:Storage,
    public helper:Helper,
    private androidPermissions: AndroidPermissions,
    private locationAccuracy: LocationAccuracy) { 
      // this.getCurrentCoordinates()
      this.locationCoords = {
        latitude: "",
        longitude: "",
        accuracy: "",
        timestamp: ""
     }
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
    });
  }

  createBarcode() {
    this.barcodeScanner.encode(this.barcodeScanner.Encode.TEXT_TYPE, this.inputData).then((encodedData) => {
      console.log(encodedData);
      this.encodedData = encodedData;
    }, (err) => {
      console.log('Error occured : ' + err);
    });
  }

 //To check whether Location Service is enabled or Not
async locationStatus() {
  return new Promise((resolve, reject) => {
     this.diagnostic.isLocationEnabled().then((isEnabled) => {
     console.log(isEnabled);
     if (isEnabled === false) {
        resolve(false);
     } else if (isEnabled === true) {
        resolve(true);
     }
   })
 .catch((e) => {
 // this.showToast('Please turn on Location');
 reject(false);
 });
});
}

async checkLocationEnabled() {
   return new Promise((resolve, reject) => {
     this.diagnostic.isLocationEnabled(is).then((isEnabled) => {
        console.log(isEnabled);
        if (isEnabled === false) {
           this.helper.presentToast('Please turn on Location Service');
           resolve(false);
        } else if (isEnabled === true) {
           this.checkGPSPermission().then((response) => {
           console.log(response, 'checkGPSPermission-checkLocationEnabled');
           this.apiResponse = response;
           if(this.apiResponse === false) {
              reject(false);
           } else {
              resolve(this.apiResponse);
           }
         })
        .catch((e) => {
           console.log(e, 'checkGPSPermission-checkLocationEnabled');
           reject(false);
      });
    }
  })
   .catch((e) => {
    this.helper.presentToast('Please turn on Location');
           reject(false);
   });
 });
}

  //Check if application having GPS access permission
  async checkGPSPermission() {
    return new Promise((resolve, reject) => {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
    result => {
      console.log(result.hasPermission);
      if (result.hasPermission) {
          console.log('hasPermission-YES');
        //If having permission show 'Turn On GPS' dialogue
        this.askToTurnOnGPS().then((response) => {
          console.log(response, 'askToTurnOnGPS-checkGPSPermission');
        if (this.apiResponse === false) {
            reject(this.apiResponse);
        } else {
            resolve(this.apiResponse);
        }
      });
    } else {
      console.log('hasPermission-NO');
      //If not having permission ask for permission
      this.requestGPSPermission().then((response) => {
          console.log(response, 'requestGPSPermission-checkGPSPermission');
          this.apiResponse = response;
          if (this.apiResponse === false) {
            reject(this.apiResponse);
          } else {
            resolve(this.apiResponse);
          }
        });
      }
    },
    err => {
      alert(err);
      reject(false);
    });
  });
  }

  async requestGPSPermission() {
    return new Promise((resolve, reject) => {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
    if (canRequest) {
      console.log("4");
    } else {
    //Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(() => {
    // call method to turn on GPS
    this.askToTurnOnGPS().then((response) => {
        console.log(response, 'askToTurnOnGPS-requestGPSPermission');
        this.apiResponse = response;
        if (this.apiResponse === false) {
          reject(this.apiResponse);
        } else {
          resolve(this.apiResponse);
        }
      });
    },
    error => {
      //Show alert if user click on 'No Thanks'
      alert('requestPermission Error requesting location permissions ' + error);
    reject(false);
    });
    }
  });
  });
  }

  async askToTurnOnGPS() {
    return new Promise((resolve, reject) => {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then((resp) => {
    console.log(resp, 'location accuracy');
  // When GPS Turned ON call method to get Accurate location coordinates
  if(resp['code'] === 0) {
      resolve(this.apiResponse);
      this.getLocationCoordinates().then((cords) => {
        console.log(cords, 'coords');
        this.apiResponse = cords;
        if(this.apiResponse === false) {
          reject(false);
        } else {
          resolve(this.apiResponse);
        }
      });
    }
      error => {
      alert('Error requesting location permissions');
      reject(false);
      }
    });
  });
  }

  async getLocationCoordinates() {
    return new Promise((resolve, reject) => {
      this.geolocation.getCurrentPosition().then((resp) => {
      this.locationCoords.latitude = resp.coords.latitude;
      this.locationCoords.longitude = resp.coords.longitude;
      this.locationCoords.accuracy = resp.coords.accuracy;
      this.locationCoords.timestamp = resp.timestamp;
      console.log(resp, 'get locc');
      resolve(this.locationCoords);
  }).catch((error) => {
      alert('Error getting location');
      reject(false);
    });
  });
  }

  //

  getUserLocation(){
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };
    this.geolocation.getCurrentPosition().then(resp => {
      this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
        .then((result: NativeGeocoderResult[]) => {
          this.userlocation = JSON.stringify(result[0]);
          this.address = JSON.parse(this.userlocation)
        }, error => {
          console.log(error)
          alert('getting err'+JSON.stringify(error))
        });
    }, error => {
      console.log('Error getting location', error);
      alert('Error getting location'+ JSON.stringify(error))
    })
  }

  logout(){
    this.storage.clear()
    this.router.navigateByUrl("/login");
    
  }

 

}
