import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private snackBar: MatSnackBar) { }

  private getBaseConfig(): MatSnackBarConfig {
    return {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['toast-top-right', 'toast-slide-in', 'custom-toast']
    };
  }

  showSuccess(message: string, action: string = 'Close', duration: number = 4000) {
    const config = {
      ...this.getBaseConfig(),
      duration,
      panelClass: [...this.getBaseConfig().panelClass!, 'toast-success']
    };

    const snackBarRef = this.snackBar.open(message, action, config);
    
    // Add slide-out animation before closing
    snackBarRef.afterOpened().subscribe(() => {
      setTimeout(() => {
        const container = document.querySelector('.toast-success');
        if (container) {
          container.classList.remove('toast-slide-in');
          container.classList.add('toast-slide-out');
        }
      }, duration - 500); 
    });

    return snackBarRef;
  }

  showWarning(message: string, action: string = 'Close', duration: number = 4000) {
    const config = {
      ...this.getBaseConfig(),
      duration,
      panelClass: [...this.getBaseConfig().panelClass!, 'toast-warning']
    };

    const snackBarRef = this.snackBar.open(message, action, config);
    
    snackBarRef.afterOpened().subscribe(() => {
      setTimeout(() => {
        const container = document.querySelector('.toast-warning');
        if (container) {
          container.classList.remove('toast-slide-in');
          container.classList.add('toast-slide-out');
        }
      }, duration - 500);
    });

    return snackBarRef;
  }

  showError(message: string, action: string = 'Close', duration: number = 5000) {
    const config = {
      ...this.getBaseConfig(),
      duration,
      panelClass: [...this.getBaseConfig().panelClass!, 'toast-error']
    };

    const snackBarRef = this.snackBar.open(message, action, config);
    
    snackBarRef.afterOpened().subscribe(() => {
      setTimeout(() => {
        const container = document.querySelector('.toast-error');
        if (container) {
          container.classList.remove('toast-slide-in');
          container.classList.add('toast-slide-out');
        }
      }, duration - 500);
    });

    return snackBarRef;
  }

  showInfo(message: string, action: string = 'Close', duration: number = 4000) {
    const config = {
      ...this.getBaseConfig(),
      duration,
      panelClass: [...this.getBaseConfig().panelClass!, 'toast-info']
    };

    const snackBarRef = this.snackBar.open(message, action, config);
    
    snackBarRef.afterOpened().subscribe(() => {
      setTimeout(() => {
        const container = document.querySelector('.toast-info');
        if (container) {
          container.classList.remove('toast-slide-in');
          container.classList.add('toast-slide-out');
        }
      }, duration - 500);
    });

    return snackBarRef;
  }
}