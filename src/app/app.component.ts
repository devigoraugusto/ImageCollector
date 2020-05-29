import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };

  @ViewChild('canvasEl', {static : false}) canvasEl : ElementRef;
  private ctx : C;

  draw() {
    // Verificar a área de atuação.
    
  }

  public errors: WebcamInitError[] = [];

  // latest snapshot
  public webcamImage: WebcamImage = null;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
    });

    if (this.canvasEl != null)
      this.ctx = (this.canvasEl.nativeElement as HTMLCanvasElement).getContext('2d');
      
  }

  public triggerSnapshot(): void {
    this.trigger.next();
    this.draw();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public deleteSnapshot(): void {
    this.webcamImage = null;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    console.info('received webcam image', webcamImage);
    this.webcamImage = webcamImage;
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();          
  }

  public obtemPontoInicial($event : MouseEvent): void {
    var x, y : Number;
    x = $event.offsetX;
    y = $event.offsetY;
    console.log("posicao x: " + x + ", posicao y: " + y);

  }

  public obtemPontoFinal($event : MouseEvent): void {
    var xF, yF : Number;
    xF = $event.offsetX;
    yF = $event.offsetY;
    console.log("posicao xF: " + xF + ", posicao yF: " + yF);
  }

}