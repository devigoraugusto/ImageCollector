import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { ImageJSON } from '../ImageJson';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  url = 'https://jsonplaceholder.typicode.com/posts';

  constructor(private httpClient: HttpClient) { }

  // Headers
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }

  postImage(msg: ImageJSON): Observable<ImageJSON> {
    return this.httpClient.post<ImageJSON>(this.url, JSON.stringify(msg), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError))
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      //erro do lado client
      errorMessage = error.error.message;
    } else {
      //erro do lado service
      errorMessage = 'Código do erro: ${error.status}, ' + 'mensagen: ${error.message}';
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

}
