import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LoginResponse } from '../../interface/loginInterface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginForm: FormGroup;
  message = signal<string>('');

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.message.set('');
    this.authService.login(this.email?.value, this.password?.value).subscribe({
      next: (res: LoginResponse) => {
        if (res.isSuccess === false) {
          this.message.set(res.message || 'فشل تسجيل الدخول');
        }
      },
      error: (error) => {
        this.message.set(error.message || 'حدث خطأ أثناء تسجيل الدخول');
      },
    });
  }
}
