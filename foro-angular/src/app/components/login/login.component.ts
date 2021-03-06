import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [UserService]
})
export class LoginComponent implements OnInit {

  public page_title: string;
  public user: User;
  public status: string;
  public identity;
  public token;


  constructor(
    private _userService:UserService,
    private _router: Router,
    private _route: ActivatedRoute
    ) { 
      this.page_title = 'Identificate';
      this.user = new User('','','','','','','');
    }

  ngOnInit(): void {
  }

  onSubmit(loginForm){
    //console.log(this.user);
    //Conseguir objeto de usuario logueado
    this._userService.signup(this.user).subscribe(
      response => {
        if(response.user && response.user._id){
          
          //Guardar usuario en propiedad
          this.identity = response.user;
          localStorage.setItem('identity', JSON.stringify(this.identity));

          //Conseguir token de usuario identificado
          this._userService.signup(this.user, true).subscribe(
            response => {
              if(response.token){
                
                //Guardar el token del usuario en propiedad
                this.token = response.token;
                localStorage.setItem('token', JSON.stringify(this.token));

                this.status = 'success';
                this._router.navigate(['/inicio']);
            
              }else{
                this.status = 'error';
              }

              
            },
            error => {
              this.status = 'error';
              console.log(error);
            }
          )


        }else{
          this.status = 'error';
        }
      },
      error => {
        this.status = 'error';
        console.log(error);
      }
    )
  }

}
