import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { ApiService } from '../api.service';
import { Helper } from '../common/helper';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginform: FormGroup;
  isSubmitted = false;
  constructor(public storage:Storage,public formBuilder: FormBuilder,public platform:Platform,public router:Router, public service:ApiService,public helper:Helper) { }

  ngOnInit() {
    this.loginform = this.formBuilder.group({
      email:new FormControl('',Validators.required),
      password:new FormControl('',Validators.required)
    });
  }

  ionViewWillEnter(){
    this.storage.get("isLoggedIn").then(res => {
      if(res){
        this.router.navigateByUrl("/home")
      }
    })
  }

  get errorControl() {
    return this.loginform.controls;
  }

  // login(){
  //   if(this.loginform.valid){
  //     const formdata = new FormData();
  //     formdata.append('email',this.loginform.value.email);
  //     formdata.append('password',this.loginform.value.password);
  //     this.helper.presentLoading().then(()=>{
  //       this.service.login(formdata).subscribe((res: any)=>{
  //         console.log(res);
  //         if(res){
  //           this.storage.set("isLoggedIn",true)
  //           this.loginform.reset();
  //           this.router.navigateByUrl('/home');
  //           this.helper.dismissLoading()
  //           this.helper.presentToast(res['message'])
  //           alert(res['message'])
  //          }
  //         },err=>{
  //           if(err){
  //           console.log(err);
  //           this.helper.presentToast(err.error['message'])
  //           alert(err.error['message'])
  //           this.helper.dismissLoading()
  //         }
  //       });
  //     })
  //   }
  //   else{
  //     this.isSubmitted = true;
  //   }
   
  // }
  userlogin(){
    if(this.loginform.valid){
      const formdata = new FormData();
      formdata.append('email',this.loginform.value.email);
      formdata.append('password',this.loginform.value.password);
      this.storage.set('email',this.loginform.value.email);
      this.storage.set('password',this.loginform.value.password);
      // this.helper.presentLoading().then(()=>{
      this.service.login(formdata).subscribe((res: any)=>{
        console.log(res);
        if(res){
          // this.helper.dismissLoading()
          this.loginform.reset();
          this.storage.set('logininfo',res.data);
          this.storage.set('user_id',JSON.stringify(res.data.id));
          this.storage.set('isLoggedIn',true);
          this.helper.presentToast(res.message);
          this.router.navigateByUrl('/home');
        }
      },err=>{
          if(err){
            this.helper.presentToast(err.error.message);
          }
        })
    }
    else{
      this.isSubmitted = true;
    }
   
  }

}
