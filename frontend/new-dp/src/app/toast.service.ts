import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private snackBar: MatSnackBar) { }

  showSuccess(message: string, action: string = 'Close', duration: number = 4000) {
    const config: MatSnackBarConfig = {
      duration,
      panelClass: ['toast-success', 'toast-slide-in', 'custom-toast']
    };

    const snackBarRef = this.snackBar.open(message, action, config);
    
    // Force positioning after the snackbar is created
    snackBarRef.afterOpened().subscribe(() => {
      this.forceTopRightPosition();
      
      // Add slide-out animation before closing
      setTimeout(() => {
        const containers = document.querySelectorAll('.toast-success');
        containers.forEach(container => {
          container.classList.remove('toast-slide-in');
          container.classList.add('toast-slide-out');
        });
      }, duration - 500);
    });

    return snackBarRef;
  }

  showWarning(message: string, action: string = 'Close', duration: number = 4000) {
    const config: MatSnackBarConfig = {
      duration,
      panelClass: ['toast-warning', 'toast-slide-in', 'custom-toast']
    };

    const snackBarRef = this.snackBar.open(message, action, config);
    
    snackBarRef.afterOpened().subscribe(() => {
      this.forceTopRightPosition();
      
      setTimeout(() => {
        const containers = document.querySelectorAll('.toast-warning');
        containers.forEach(container => {
          container.classList.remove('toast-slide-in');
          container.classList.add('toast-slide-out');
        });
      }, duration - 500);
    });

    return snackBarRef;
  }

  showError(message: string, action: string = 'Close', duration: number = 5000) {
    const config: MatSnackBarConfig = {
      duration,
      panelClass: ['toast-error', 'toast-slide-in', 'custom-toast']
    };

    const snackBarRef = this.snackBar.open(message, action, config);
    
    snackBarRef.afterOpened().subscribe(() => {
      this.forceTopRightPosition();
      
      setTimeout(() => {
        const containers = document.querySelectorAll('.toast-error');
        containers.forEach(container => {
          container.classList.remove('toast-slide-in');
          container.classList.add('toast-slide-out');
        });
      }, duration - 500);
    });

    return snackBarRef;
  }

  showInfo(message: string, action: string = 'Close', duration: number = 4000) {
    const config: MatSnackBarConfig = {
      duration,
      panelClass: ['toast-info', 'toast-slide-in', 'custom-toast']
    };

    const snackBarRef = this.snackBar.open(message, action, config);
    
    snackBarRef.afterOpened().subscribe(() => {
      this.forceTopRightPosition();
      
      setTimeout(() => {
        const containers = document.querySelectorAll('.toast-info');
        containers.forEach(container => {
          container.classList.remove('toast-slide-in');
          container.classList.add('toast-slide-out');
        });
      }, duration - 500);
    });

    return snackBarRef;
  }

  private forceTopRightPosition(): void {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      // Find all overlay panes
      const overlayPanes = document.querySelectorAll('.cdk-overlay-pane');
      
      // Find the one containing our snackbar
      overlayPanes.forEach((pane: any) => {
        const snackbarContainer = pane.querySelector('.mat-mdc-snack-bar-container');
        const hasCustomToast = pane.querySelector('.custom-toast');
        
        if (snackbarContainer && hasCustomToast) {
          // Force the overlay pane to top-right
          pane.style.position = 'fixed';
          pane.style.top = '20px';
          pane.style.right = '20px';
          pane.style.left = 'auto';
          pane.style.bottom = 'auto';
          pane.style.transform = 'none';
          pane.style.maxWidth = '350px';
          pane.style.minWidth = '280px';
          pane.style.zIndex = '9999';
          
          // Also style the container
          snackbarContainer.style.position = 'relative';
          snackbarContainer.style.transform = 'none';
          snackbarContainer.style.margin = '0';
        }
      });
    }, 0);
  }
}