import { ConnectionService } from '../connection.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-connection',
  standalone: false,
  templateUrl: './edit-connection.component.html',
  styleUrl: './edit-connection.component.css'
})
export class EditConnectionComponent implements OnInit {
  isEditMode = true; // Always true for edit component
  existingName = '';
  originalFormModel: any = {}; // Store original data for reset functionality

  formModel = {
    name: '',
    description: '',
    deploy_location: '',
    deploy_type: '',
    host: '',
    username: '',
    password: '',
    remote_path: '',
    protocol: ''
  };
 
  constructor(
    private service: ConnectionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
 
  ngOnInit(): void {
    const name = this.route.snapshot.queryParamMap.get('name');
    console.log('Edit mode - connection name:', name);
    
    if (name) {
      this.existingName = name;
      this.loadConnectionData(name);
    } else {
      // If no name provided, redirect back to home
      console.error('No connection name provided for editing');
      this.router.navigate(['/']);
    }
  }

  loadConnectionData(name: string) {
    this.service.getConnectionByName(name).subscribe({
      next: (res) => {
        console.log('Loaded connection data:', res);
        // Store original data for reset functionality
        this.originalFormModel = { ...res };
        // Set form model (don't include password in form for security)
        this.formModel = { 
          ...res,
          password: '' // Clear password field for security
        };
      },
      error: (err) => {
        console.error('Failed to load connection:', err);
        alert(`Failed to load connection "${name}". Redirecting to home.`);
        this.router.navigate(['/']);
      }
    });
  }

  resetForm() {
    // Reset form to original values
    this.formModel = { 
      ...this.originalFormModel,
      password: '' // Keep password field empty
    };
    console.log('Form reset to original values');
  }

  testConnection() {
    // Implement test connection functionality
    console.log('Testing connection...');
    alert('Test connection functionality - to be implemented');
    // You can call a test endpoint here
    // this.service.testConnection(this.existingName).subscribe(...)
  }
 
  onSubmit(form: any) {
    console.log('Submitting edit form:', form.value);
    
    const formValues = form.value;
    const formData = new FormData();
    
    // Always use the existing name (can't be changed)
    formData.append('name', this.existingName);
    formData.append('description', formValues.description);
    formData.append('deploy_location', formValues.deploy_location);
    formData.append('deploy_type', formValues.deploy_type);
    formData.append('host', formValues.host);
    formData.append('username', formValues.username);
    
    // Only append password if it's provided (not empty)
    if (formValues.password && formValues.password.trim() !== '') {
      formData.append('password', formValues.password);
    }
    
    formData.append('remote_path', formValues.remote_path);
    formData.append('protocol', formValues.protocol);

    // Always update (this is edit component)
    this.service.updateConnection(this.existingName, formData).subscribe({
      next: (res) => {
        console.log('Connection updated successfully:', res);
        alert(`Connection "${this.existingName}" updated successfully!`);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Failed to update connection:', err);
        alert(`Failed to update connection "${this.existingName}". Please try again.`);
      }
    });
  }
}