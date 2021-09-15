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

  login(){
    if(this.loginform.valid){
      const formdata = new FormData();
      formdata.append('email',this.loginform.value.email);
      formdata.append('password',this.loginform.value.password);
      this.helper.presentLoading().then(()=>{
        this.service.login(formdata).subscribe((res: any)=>{
          console.log(res);
          if(res){
            this.storage.set("isLoggedIn",true)
            this.loginform.reset();
            this.router.navigateByUrl('/home');
            this.helper.dismissLoading()
            this.helper.presentToast(res.message)
           }
          },err=>{
            if(err){
            console.log(err);
            this.helper.dismissLoading()
            this.helper.presentToast(err.error.message)
          }
        });
      })
    }
    else{
      this.isSubmitted = true;
    }
   
  }
 
}
