import { Component } from '@angular/core';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Plugins, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';
const { Filesystem } = Plugins;
import { ToastController } from '@ionic/angular';
import axios from 'axios'

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  ipServer = '192.168.39.170'

  constructor(
    private toast: ToastController
  ) {}

  arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

  base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async showToast(message:string) {
    let toast = await this.toast.create({
      message: message,
      duration: 2000
    })

    toast.present()
  }

  // https://stackoverflow.com/questions/41878838/how-do-i-set-multipart-in-axios-with-react
  async UploadToServer() {
    try {
      let imageName = 'image.png'
      // ReadFile as dataa
      const resFile = await Filesystem.readFile({
        directory: FilesystemDirectory.Documents,
        path: imageName
      })

      let formData = new FormData()
      let dataImage = new Blob([this.base64ToArrayBuffer(resFile.data)])
      console.log(dataImage)
      formData.append('file', dataImage)
      formData.append('nametest', 'name')
      formData.append('name', imageName)
      
      await axios({
        method: 'POST',
        url: `http://${this.ipServer}:5000/api/upload`,
        data: formData,
        headers: {
          'content-type': 'multipart/form-data'
        }
      })
      
      this.showToast('Image uploaded')
    }
    catch (e){
      console.log(e)
      this.showToast('Error sending file')
    }
  }

  async DownloadFile() {
    this.showToast('Downloading file')
    try {
      let fileName = 'image.png'
      console.log('Getting file')
      const resDownload = await axios({
        method: 'GET',
        url: 'https://kinsta.com/es/wp-content/uploads/sites/8/2017/04/cambiar-wordpress-url-1-1024x512.png',
        timeout: 10000,
        responseType: 'arraybuffer' 
      })

      console.log('Saving data')
      const res = await Filesystem.writeFile({
        path: fileName,
        data: this.arrayBufferToBase64(resDownload.data),
        directory: FilesystemDirectory.Documents
      }) 

      this.showToast('Image downloaded in ' + fileName + ' Document dir ' + FilesystemDirectory.Documents)
      console.log(res)
    }
    catch(e) {
      this.showToast('Error downloading file!')
      console.log(e)
    }  
  }

  async DownloadFromServer() {
    try {
      let fileName = 'imageServer.png'
      console.log('Getting file')
      const resDownload = await axios({
        method: 'GET',
        url: `http://${this.ipServer}:5000/api/download/image.png`,
        timeout: 10000,
        responseType: 'arraybuffer' 
      })
  
      console.log('Saving data')
      const res = await Filesystem.writeFile({
        path: fileName,
        data: this.arrayBufferToBase64(resDownload.data),
        directory: FilesystemDirectory.Documents
      }) 
  
      this.showToast('Image downloaded in ' + fileName + ' Document dir ' + FilesystemDirectory.Documents)
      console.log(res)
    }
    catch(e) {
      this.showToast('Error downloading file!')
      console.log(e)
    }

  }
}
