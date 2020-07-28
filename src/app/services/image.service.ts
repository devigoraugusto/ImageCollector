import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { ImageJSON } from '../ImageJson';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  
  //url = 'https://jsonplaceholder.typicode.com/posts'; // URL de teste
  url = 'http://35.232.148.56:5000/api/tray_image';

  constructor(private httpClient: HttpClient, private messageService: MessageService) { }

  // Headers
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }

  postImage(msg: ImageJSON): Observable<ImageJSON> {
    return this.httpClient.post<ImageJSON>(this.url, JSON.stringify(msg), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError))
    this.messageService.add('Mensagem enviada com sucesso!');
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      //erro do lado client
      errorMessage = error.error.message;
    } else {
      //erro do lado service
      errorMessage = 'Código do erro:' + error.status + ', ' + 'mensagen: ' + error.message;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

}
