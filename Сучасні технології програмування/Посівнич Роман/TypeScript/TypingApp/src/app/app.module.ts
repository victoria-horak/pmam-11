import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { KeyupDirective } from './keyup.directive';
import { TypingGameComponent } from './domain/typing-game/typing-game.component';
import { LoginComponent } from './domain/login/login.component';
import { RegistrationComponent } from './domain/registration/registration.component';
import { LayoutComponent } from './layout/layout.component';
import { ProfileComponent } from './domain/profile/profile.component';
import { SocialLoginModule, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/modules/services/auth.interceptor';
import { LessonListComponent } from './domain/lesson-list/lesson-list.component';
import { LessonComponent } from './domain/lesson/lesson.component';
import { HeaderComponent } from './layout/header/header.component';
import { ResultComponent } from './domain/result/result.component';

@NgModule({
  declarations: [
    AppComponent,
    KeyupDirective,
    TypingGameComponent,
    LoginComponent,
    RegistrationComponent,
    LayoutComponent,
    ProfileComponent,
    LessonComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgChartsModule,
    AppRoutingModule,
    SocialLoginModule,
    FormsModule
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '738735220137-vi9mobetd8dil6ieqd8r97bp6s3kg42q.apps.googleusercontent.com'
            )
          }
        ]
      } as SocialAuthServiceConfig,
      
    },
    {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
