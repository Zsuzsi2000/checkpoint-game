import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {AuthResponseData} from "../auth/auth.service";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(private http: HttpClient) { }

  getAllCountries() {
    return this.http.get(
      `https://countryapi.io/api/all?apikey=${
        environment.countryApiKey
      }`
    );
  }
}
