import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { first } from 'rxjs/operators';
import { AuthenticationService } from '../../_services/authentification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {

    username:string = '';
    password:string = '';
    error:string = '';

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {
    }

  ngOnInit(): void {
        if (this.authenticationService.currentUserValue.username) { 
            this.router.navigateByUrl("orders");
        }
  }

    onSubmit() {
        this.authenticationService.login(this.username, this.password)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.router.navigateByUrl("orders");
                },
                error: (error:Error) => {
                    this.error = error.message
                    console.log(error.message)
                }
            });
    }

}

