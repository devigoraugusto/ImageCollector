import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Subject, Observable, ObjectUnsubscribedError} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import {ImageJSON} from './ImageJson';
import { ImageService } from './services/image.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  constructor(private imgService: ImageService){}

  @ViewChild("video")
  public video : ElementRef;
  title = 'ROI Collector';
  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    width: {ideal: 1024},
    height: {ideal: 576}
  };

  public test = "";
  public imageObj = null;
  public drag = false;
  public rect = {startX:null, startY: null, w:null, h:null};
  
  @ViewChild("canvas", {static: true}) canvas : ElementRef<HTMLCanvasElement>;
  @ViewChild("canvas2", {static: true}) canvas2 : ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D;
  private ctx2: CanvasRenderingContext2D;
  
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

    // if (this.canvas != null)
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctx2 = this.canvas2.nativeElement.getContext('2d');
    
  }

  // public ngAfterViewInit() {
  //   if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //       navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  //           this.video.nativeElement.src = window.URL.createObjectURL(stream);
  //           this.video.nativeElement.play();
  //       });
  //   }
  // }

  public captureSnapshot(): void {
    this.trigger.next();
    this.ctx.clearRect(0, 0, 1024, 576);
    //this.imageObj.src = this.webcamImage.imageAsDataUrl;
    this.ctx.drawImage(this.imageObj, 0, 0);
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
    this.draw();
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

  public draw() {
    this.imageObj = new Image();
    this.imageObj.src = this.webcamImage.imageAsDataUrl;
    this.ctx.drawImage(this.imageObj, 0, 0);
  }


  public obtemPonto($event : MouseEvent): void {
    var x, y : Number;
    x = $event.offsetX;
    y = $event.offsetY;
    console.log("posicao x: " + x + ", posicao y: " + y);

  }

  public mouseDown(e : MouseEvent) {
    this.rect.startX = e.offsetX;
    this.rect.startY = e.offsetY;
    this.drag = true;
    this.obtemPonto(e)
  }

  public mouseMove(e : MouseEvent) {
    if(this.drag) {
      this.ctx.clearRect(0, 0, 1024, 576);
      this.ctx.drawImage(this.imageObj, 0, 0);
      this.rect.w = (e.offsetX) - this.rect.startX;
      this.rect.h = (e.offsetY) - this.rect.startY;
      this.ctx.strokeStyle = 'red';
      this.ctx.strokeRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
    }
  }

  public mouseUp(e : MouseEvent) {
    this.drag = false;
    this.obtemPonto(e);
  }

  public cutImage() {
    
    this.ctx2.clearRect(0, 0, 1024, 576);
    this.ctx2.drawImage(this.imageObj, this.rect.startX, this.rect.startY, this.rect.w, this.rect.h, 0, 0, this.rect.w, this.rect.h);
  }

  public ProcessImage() {
    var msg: ImageJSON = {
      image: this.webcamImage.imageAsBase64,
      image_roi : {
        x: this.rect.startX,
        y: this.rect.startY,
        width: this.rect.w,
        height: this.rect.h
      }
    };

    var answer = this.imgService.postImage(msg).subscribe();
    console.log(JSON.stringify(msg));
    this.test = JSON.stringify(msg);
  }

  public DownloadImage() {
    let byteCharacters = atob(this.webcamImage.imageAsBase64);
    let byteNumbers = new Array(byteCharacters.length);
    for (var i=0; i<byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    var byteArray = new Uint8Array(byteNumbers);
    let blob = new Blob([byteArray], {"type": "imagem/png"});

    if (navigator.msSaveBlob) {
      let filename = "picture.png";
      navigator.msSaveBlob(blob, filename);
    } else {
      let link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute('visibility', 'hidden');
      link.download = 'picture.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}