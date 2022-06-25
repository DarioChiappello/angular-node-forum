import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { global } from '../../services/global';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
  providers: [UserService]
})
export class UserEditComponent implements OnInit {

  public page_title: string;
  public user: User;
  public identity;
  public token;
  public status;
  //afu (angular file uploader)
  public afuConfig;
  public url;
  public resetVar;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _userService: UserService
  ) { 
    this.page_title = 'Ajustes de usuario';
    this.identity = this._userService.getidentity();
    this.token = this._userService.gettoken();
    this.user = this.identity;
    this.url = global.url;

    //afuconfig 
    this.afuConfig = {
      multiple: false,
      formatsAllowed: ".jpg, .jpeg, .png, .gif",
      maxSize: "50",
      uploadAPI: {
        url: this.url + "upload-avatar",
        headers: {
          "Authorization": this.token
        }
      },
      theme: "attachPin",
      hideProgressBar: false,
      hideResetBtn: true,
      hideSelectBtn: false,
      replaceTexts: {
        selectFileBtn: 'Select Files',
        resetBtn: 'Reset',
        uploadBtn: 'Upload',
        dragNDropBox: 'Drag N Drop',
        attachPinBtn: 'Subir foto',
        afterUploadMsg_success: 'Successfully Uploaded !',
        afterUploadMsg_error: 'Upload Failed !',
        sizeLimit: 'Size Limit'
      }
    };
  }

  avatarUpload(data){
    
    let data_obj = data.body;
    
    this.user.image = data_obj.user.image;
    console.log(this.user);
  }

  ngOnInit(): void {
  }

  onSubmit(form){
    this._userService.update(this.user).subscribe(
      response =>{
        if(!response.user){
          this.status = 'error';
        }else{
          this.status = 'success';

          //update localstorage - actualizar el localstorage
          localStorage.setItem('identity', JSON.stringify(this.user));
        }
      },
      error => {
        this.status = 'error';
        console.log(error);
      }
    )
  }

}
