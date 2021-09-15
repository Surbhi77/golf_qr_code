import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Storage } from '@ionic/storage';

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
  address: string;
  userlocation: any;

  constructor(
    private barcodeScanner: BarcodeScanner,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private router:Router,
    public storage:Storage) { 
      // this.getCurrentCoordinates()
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

  // options = {
  //   timeout: 10000, 
  //   enableHighAccuracy: true, 
  //   maximumAge: 3600
  // };

  // getCurrentCoordinates() {
  //   this.geolocation.getCurrentPosition().then((resp) => {
  //     console.log(resp)
  //     this.latitude = resp.coords.latitude;
  //     this.longitude = resp.coords.longitude;
  //     console.log(this.latitude, this.longitude)
  //    }).catch((error) => {
  //      console.log('Error getting location', error);
  //    });
  // }

  // nativeGeocoderOptions: NativeGeocoderOptions = {
  //   useLocale: true,
  //   maxResults: 5
  // };

  // getAddress(lat,long){
  //   this.nativeGeocoder.reverseGeocode(lat, long, this.nativeGeocoderOptions)
  //   .then((res: NativeGeocoderResult[]) => {
  //     this.address = this.pretifyAddress(res[0]);
  //     console.log(this.pretifyAddress);
  //   })
  //   .catch((error: any) => {
  //     alert('Error getting location'+ JSON.stringify(error));
  //   });
  // }

  // pretifyAddress(address){
  //   let obj = [];
  //   let data = "";
  //   for (let key in address) {
  //     obj.push(address[key]);
  //   }
  //   obj.reverse();
  //   for (let val in obj) {
  //     if(obj[val].length)
  //     data += obj[val]+', ';
  //   }
  //   console.log(address)
  //   return address.slice(0, -2);
  // }

  //

  getUserLocation(){
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };
    this.geolocation.getCurrentPosition().then(resp => {
      this.nativeGeocoder.reverseGeocode(resp.coords.latitude, resp.coords.longitude, options)
        .then((result: NativeGeocoderResult[]) => {
          this.userlocation = result[0];
        }, error => {
          console.log(error)
        });
    }, error => {
      console.log('Error getting location', error);
    })
  }

  logout(){
    this.storage.clear()
    this.router.navigateByUrl("/login");
    
  }

 

}
