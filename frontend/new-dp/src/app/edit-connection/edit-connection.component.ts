import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectionService } from '../connection.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-edit-connection',
  standalone: false,
  templateUrl: './edit-connection.component.html',
  styleUrls: ['./edit-connection.component.css']
})
export class EditConnectionComponent implements OnInit {
  isEditMode = true;
  existingName = '';
 
  formModel = {
    name: '',
    description: '',
    deploy_location: '',
    deploy_type: '',
    host: '',
    username: '',
    password: '',
    remote_path: '',
    protocol: '',
    trigger_script_path: ''
  };
 
  constructor(
    private service: ConnectionService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}
 
  ngOnInit(): void {
    const name = this.route.snapshot.queryParamMap.get('name');
 
    if (name) {
      this.existingName = name;
      this.loadConnectionData(name);
    } else {
      alert("No connection name provided for editing");
      this.router.navigate(['/']);
    }
  }
 
  loadConnectionData(name: string) {
    this.service.getConnectionByName(name).subscribe({
      next: (res) => {
        this.formModel = {
          ...res,
          password: ''
        };
      },
      error: (err) => {
        console.error('Failed to load connection:', err);
        alert(`Failed to load connection "${name}". Redirecting to home.`);
        this.router.navigate(['/']);
      }
    });
  }
 
  onSubmit(form: any) {
  // Ask for confirmation via toast before updating
  const snackBarRef = this.snackBar.open(
    `Click "CONFIRM UPDATE" to update "${this.existingName}"`,
    'CONFIRM UPDATE',
    {
      duration: 5000,
      panelClass: ['toast-warning']
    }
  );

  snackBarRef.onAction().subscribe(() => {
    const formValues = form.value;
    const formData = new FormData();

    formData.append('name', this.existingName); // name is readonly
    formData.append('description', formValues.description);
    formData.append('deploy_location', formValues.deploy_location);
    formData.append('deploy_type', formValues.deploy_type);
    formData.append('host', formValues.host);
    formData.append('username', formValues.username);
    formData.append('protocol', formValues.protocol);
    formData.append('remote_path', formValues.remote_path);
    formData.append('trigger_script_path', formValues.trigger_script_path);

    if (formValues.password && formValues.password.trim() !== '') {
      formData.append('password', formValues.password);
    }

    this.service.updateConnection(this.existingName, formData).subscribe({
      next: () => {
        this.snackBar.open(
          `✅ Connection "${this.existingName}" updated successfully!`,
          'Close',
          {
            duration: 4000,
            panelClass: ['toast-success']
          }
        );
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Failed to update connection:', err);
        this.snackBar.open(
          `❌ Failed to update connection "${this.existingName}". Please try again.`,
          'Close',
          {
            duration: 4000,
            panelClass: ['toast-error']
          }
        );
      }
    });
  });
}

}