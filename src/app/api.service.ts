import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl="http://wishinteractiveinc.com/golf/api"
  constructor(private httpclient:HttpClient) { }

  public login(data){
    return this.httpclient.post(this.baseUrl+`/qradmin-login`,data)
  }
}
