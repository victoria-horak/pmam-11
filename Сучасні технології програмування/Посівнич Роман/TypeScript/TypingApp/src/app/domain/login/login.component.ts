import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/modules/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent implements OnInit{
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.initializeGoogleSignIn();
  }
  initializeGoogleSignIn() {
    (window as any).google.accounts.id.initialize({
      client_id: '738735220137-vi9mobetd8dil6ieqd8r97bp6s3kg42q.apps.googleusercontent.com',
      callback: this.handleOauthResponse.bind(this)
    });
    (window as any).google.accounts.id.renderButton(
      document.getElementById('g_id_onload'),
      { theme: 'outline', size: 'large' }
    );
  }
  
  handleOauthResponse(response: any) {
    const idToken = response.credential;
    this.authService.googleLogin(idToken).subscribe(
      (response) => {
        if (response.isSuccess) {
          this.router.navigate(['/typing-game']);
        } else {
          alert('Google login failed: ' + response.message);
        }
      },
      (error) => {
        console.error('Google login error', error);
        alert('An error occurred during Google login.');
      }
    );
  }

  login(): void {
    this.authService.login({ email: this.email, password: this.password }).subscribe(
      (response) => {
        if (response.isSuccess) {
          this.router.navigate(['/typing-game']);
        } else {
          alert('Login failed: ' + response.message);
        }
      },
      (error) => {
        console.error('Login error', error);
        alert('An error occurred during login.');
      }
    );
  }
 
}