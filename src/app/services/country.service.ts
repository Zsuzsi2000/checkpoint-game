import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {AuthResponseData} from "../auth/auth.service";
import {HttpClient} from "@angular/common/http";
import {map, switchMap, take, tap} from "rxjs/operators";
import {Game} from "../models/game.model";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  countries: string[] = [];
  id: string;

  constructor(private http: HttpClient) { }

  getAllCountries() {
    return this.http.get(
      `https://countryapi.io/api/all?apikey=${
        environment.countryApiKey
      }`
    );
  }

  uploadCountries() {
    return this.getAllCountries().pipe(
      switchMap(res => {
        this.countries.push("Anywhere");
        for (var key in res) {
          this.countries.push(res[key].name);
        }
        return this.http.post<{ name: string }>('https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/countries.json', {...this.countries, id: null})
      }),
      take(1),
      switchMap(resData => {
        this.id = resData.name;
        return of(this.countries);
      })
    );
  }

  fetchCountries() {
    return this.http.get<{ [key: string]: string[] }>("https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/countries.json")
      .pipe(
        take(1),
        map(data => {
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              this.countries = data[key];
              this.id = key;
            }
          }
          this.countries = this.countries.sort((a, b) =>  a < b ? -1 : (a > b ? 1 : 0));
          return this.countries;
        })
      );
  }
}
