import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-room-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './room-login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomLoginComponent {
  loginForm: FormGroup;
  message = signal<string>('');

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      storeName: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get storeName() {
    return this.loginForm.get('storeName');
  }

  get username() {
    return this.loginForm.get('username');
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
    this.authService
      .roomLogin(
        this.storeName?.value,
        this.username?.value,
        this.password?.value
      )
      .subscribe({
        next: (res: any) => {
          if (res.isSuccess === false) {
            this.message.set(res.message || 'فشل تسجيل الدخول');
          }
        },
        error: (error) => {
          this.message.set( 'حدث خطأ أثناء تسجيل الدخول');
        },
      });
  }
}
