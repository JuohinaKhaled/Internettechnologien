import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'http://localhost:4200/movies';

  constructor(private http: HttpClient) { }

  getFilms(): Observable<any[]> {
    console.log("Fetching films from API...");
    return this.http.get<any[]>(this.apiUrl);
  }

  getMovieDetails(movieID: number): Observable<any[]> {
    return this.http.post<any[]>('/movieDetails', { movieID }).pipe(
      tap(response => {
        if (response.length > 0) {
          console.log('Vorfuehrungen abgerufen: ', response);
        } else {
          console.log('Keine Vorfuehrungen gefunden, Antwort: ', response);
        }
      }),
      catchError(err => {
        console.log('Fehler beim Abrufen der Vorfuehrungen: ', err);
        return throwError(err);
      })
    );
  }
}
