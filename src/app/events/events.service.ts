import {Injectable} from '@angular/core';
import {BehaviorSubject, of} from "rxjs";
import {Event} from "../models/event.model";
import {AuthService} from "../auth/auth.service";
import {UserService} from "../services/user.service";
import {HttpClient} from "@angular/common/http";
import {map, switchMap, take, tap} from "rxjs/operators";
import {GameMode} from "../enums/GameMode";
import {LiveGameSettings} from "../models/liveGameSettings";

interface EventData {
  name: string,
  date: Date,
  creationDate: Date,
  isItPublic: boolean,
  imgUrl: string,
  creatorId: string,
  gameId: string,
  description: string,
  liveGameSettings: LiveGameSettings,
  players: string[],
  joined: { teamName: string, teamMembers: {id: string, name: string}[]}[],
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private _events = new BehaviorSubject<Event[]>([]);

  get events() {
    return this._events.asObservable();
  }

  constructor(private authService: AuthService, private userService: UserService, private http: HttpClient) {}

  fetchEvents() {
    return this.http.get<{ [key: string]: EventData }>("https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/events.json")
      .pipe(
        map(data => {
          const events = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              events.push(new Event(
                key,
                data[key].name,
                data[key].date,
                data[key].creationDate ? data[key].creationDate : new Date(),
                data[key].isItPublic,
                data[key].imgUrl,
                data[key].creatorId,
                data[key].gameId,
                data[key].description,
                data[key].liveGameSettings,
                data[key].players,
                data[key].joined,
              ))
            }
          }
          return events;
        }),
        tap(events => {
          this._events.next(events);
        })
      );
  }

  fetchEvent(id: string) {
    return this.http.get<EventData>(`https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/events/${id}.json`).pipe(
      map(eventData => {
        return new Event(
          id,
          eventData.name,
          eventData.date,
          eventData.creationDate ? eventData.creationDate : new Date(),
          eventData.isItPublic,
          eventData.imgUrl,
          eventData.creatorId,
          eventData.gameId,
          eventData.description,
          eventData.liveGameSettings,
          eventData.players,
          eventData.joined,
        );
      })
    );
  }

  createEvent(event: Event) {
    let generatedId: string;
    let newEvent = event;

    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.post<{ name: string }>(
          'https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/events.json',
          {...newEvent, id: null}
        );
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return of(generatedId);
      }),
      take(1),
      tap(id => {
        newEvent.id = id;
        this._events.next([...this._events.getValue(), newEvent]);
      })
    );
  }

  updateEvent(event: Event) {
    let updatedEvents: Event[];
    return this.events.pipe(
      take(1),
      switchMap(events => {
        if (!events || events.length < 0) {
          return this.fetchEvents();
        } else {
          return of(events);
        }
      }),
      switchMap(events => {
        const updatedEventIndex = events.findIndex(e => e.id === event.id);
        updatedEvents = [...events];
        updatedEvents[updatedEventIndex] = event;
        return this.http.put(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/events/${event.id}.json`,
          {...updatedEvents[updatedEventIndex], id: null}
        );
      }),
      tap(() => {
        this._events.next(updatedEvents);
      })
    );
  }

  fetchOwnEvents(id: string) {
    return  this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: EventData }>(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/events.json?orderBy="creatorId"&equalTo="${id}"&auth=${token}`
        );
      }),
      take(1),
      map(data => {
        const events = [];
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            events.push(new Event(
              key,
              data[key].name,
              data[key].date,
              data[key].creationDate ? data[key].creationDate : new Date(),
              data[key].isItPublic,
              data[key].imgUrl,
              data[key].creatorId,
              data[key].gameId,
              data[key].description,
              data[key].liveGameSettings,
              data[key].players,
              data[key].joined,
            ))
          }
        }
        return events;
      })
    );
  }

  deleteEvent(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(
          `https://checkpoint-game-399d6-default-rtdb.europe-west1.firebasedatabase.app/events/${id}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.events;
      }),
      take(1),
      tap(events => {
        this._events.next(events.filter(b => b.id !== id));
      })
    );
  }
}
