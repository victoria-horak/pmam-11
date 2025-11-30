import { Component, OnInit} from '@angular/core';
import { AuthService } from '../../core/modules/services/auth.service';
import { Router } from '@angular/router';
import { RegistrationRequest } from '../../core/modules/interfaces/registration-request';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrl: './registration.component.css',
    standalone: false
})
export class RegistrationComponent {
  email: string = '';
  password: string = '';
  password_conf: string ='';

  constructor(private authService: AuthService, private router: Router) {}
  
  register(): void {
    if (this.password === this.password_conf) {
      const requestData: RegistrationRequest = {
        fullName: this.email.split('@')[0],
        email: this.email,
        password: this.password
      };

      this.authService.register(requestData).subscribe(
        (response) => {
          if (response.isSuccess) {
            this.router.navigate(['/typing-game']);
          } else {
            alert('Registration failed: ' + response.message);
          }
        },
        (error) => {
          console.error('Registration error', error);
          alert('An error occurred during registration.');
        }
      );
    }
  }
}