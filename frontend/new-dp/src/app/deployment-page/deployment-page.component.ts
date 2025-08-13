import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ConnectionService } from '../connection.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
 
@Component({
  selector: 'app-deployment-page',
  standalone: false,
  templateUrl: './deployment-page.component.html',
  styleUrl: './deployment-page.component.css'
})
export class DeploymentPageComponent implements OnInit {
  // Connection state variables
  isConnected: boolean = false;
  connecting: boolean = false;
  disconnecting: boolean = false;
 
  // Form and edit mode variables
  isEditMode = false;
  existingName = '';
 
  // File operation variables
  fileList: string[] = [];
  logs: string[] = [];
  selectedFile: File | null = null;
 
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
    trigger_script_path: '',
  };
 
  baseUrl: string = 'http://localhost:8000';
 
  constructor(
    private service: ConnectionService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}
 
  ngOnInit(): void {
    // Get connection name from route parameter
    this.route.params.subscribe(params => {
      const name = params['name'];
      if (name) {
        this.isEditMode = true;
        this.existingName = name;
        this.formModel.name = name;
 
        this.service.getConnectionByName(name).subscribe(res => {
          this.formModel = { ...res };
        });
      }
    });
 
    // Also check query parameters for backward compatibility
    const queryName = this.route.snapshot.queryParamMap.get('name');
    if (queryName && !this.isEditMode) {
      this.isEditMode = true;
      this.existingName = queryName;
      this.formModel.name = queryName;
 
      this.service.getConnectionByName(queryName).subscribe(res => {
        this.formModel = { ...res };
      });
    }
  }
 
 
 
  // Main connection method - this will be called when Connect button is clicked
  connectWithFormName(): void {
    if (!this.formModel.name) {
      this.addLog('❌ Connection name is required');
      return;
    }
 
    if (this.connecting || this.isConnected) {
      return;
    }
 
    this.connecting = true;
 
    this.addLog(`🔄 Attempting to connect to: ${this.formModel.name}`);
 
    this.service.connectExisting(this.formModel.name).subscribe({
      next: (res) => {
        this.addLog(`✅ Successfully connected to: ${this.formModel.name}`);
        this.isConnected = true;
        this.connecting = false;
 
        // Automatically load file list after successful connection
        this.loadFiles();
      },
      error: (err) => {
        this.addLog(`❌ Failed to connect to: ${this.formModel.name}`);
        this.addLog(`❌ Error: ${err.error?.error || err.message}`);
        this.isConnected = false;
        this.connecting = false;
        console.error('Connection failed:', err);
      }
    });
 
    this.snackBar.open('Successfully Connected to the Host', 'Close', {
      duration: 4000,
      panelClass: ['toast-success']
    });
  }

   // Trigger Script 
  triggerScript(): void {
    if (!this.formModel?.name || !this.isConnected) {
      this.addLog('❌ Connection name is missing, cannot trigger script.');
      return;
    }
 
    this.addLog(`🚀 Triggering script for: ${this.formModel.name}`);
 
    this.http.post(`${this.baseUrl}/trigger-script/${this.formModel.name}`, {})
      .subscribe({
        next: (res: any) => {
          this.addLog(`✅ Script executed successfully: ${JSON.stringify(res.script_result || res)}`);
          if(this.isConnected){
          this.snackBar.open('Script triggered successfully', 'Close', {
            duration: 3000,
            panelClass: ['toast-success']
          });
        }
        },
        error: (err) => {
          this.addLog(`❌ Failed to trigger script: ${err.error?.detail || err.message}`);
          this.snackBar.open(`Failed to trigger script: ${err.error?.detail || err.message}`, 'Close', {
            duration: 4000,
            panelClass: ['toast-error']
          });
        }
      });
  }
 
  // Disconnect method
  disconnect(): void {
    if (!this.isConnected || this.disconnecting) {
      return;
    }
 
    this.disconnecting = true;
    this.addLog('🔄 Disconnecting...');
 
    this.service.disconnect().subscribe({
      next: () => {
        this.addLog('🔌 Successfully disconnected');
        this.isConnected = false;
        this.disconnecting = false;
 
        // Clear file list on disconnect
        this.fileList = [];
      },
      error: (err) => {
        this.disconnecting = false;
        this.addLog('❌ Failed to disconnect');
        this.addLog(`❌ Error: ${err.error?.error || err.message}`);
        console.error('Disconnection failed:', err);
      }
    });
    this.snackBar.open('Disconnected', 'Close', {
      duration: 4000,
      panelClass: ['toast-warning']
    });
  }
 
  // Load files from remote server
  loadFiles(): void {
    if (!this.isConnected) {
      this.addLog('❌ Not connected to server');
      return;
    }
 
    this.addLog('📁 Loading remote files...');
    this.service.getFiles().subscribe({
      next: (res) => {
        this.fileList = res.files || [];
        this.addLog(`✅ Loaded ${this.fileList.length} files from server`);
      },
      error: (err) => {
        this.addLog(`❌ Failed to load files: ${err.error?.error || err.message}`);
        console.error('Failed to load files:', err);
      }
    });
  }
 
  // File selection handler
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file || null;
 
    if (this.selectedFile) {
      this.addLog(`📄 Selected file: ${this.selectedFile.name} (${(this.selectedFile.size / 1024 / 1024).toFixed(2)} MB)`);
    }
  }
 
  // Upload selected file
 uploadFile(): void {
  if (!this.selectedFile) {
    this.addLog('❌ No file selected for upload');
    Swal.fire({
      icon: 'warning',
      title: 'No File Selected',
      text: 'Please select a file before uploading.',
    });
    return;
  }

  if (!this.isConnected) {
    this.addLog('❌ Not connected to server');
    Swal.fire({
      icon: 'error',
      title: 'Not Connected',
      text: 'Please connect to the server before uploading a file.',
    });
    return;
  }
  const fileToUpload = this.selectedFile;

  Swal.fire({
    title: 'Upload File',
    text: `Do you want to upload the file "${fileToUpload.name}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Yes, upload it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      const formData = new FormData();
      formData.append('file', fileToUpload);

      this.addLog(`⬆️ Uploading: ${fileToUpload.name}...`);

      this.http.post(this.baseUrl + '/upload', formData).subscribe({
        next: () => {
          this.addLog(`✅ Successfully uploaded: ${fileToUpload?.name}`);

          Swal.fire({
            icon: 'success',
            title: 'Uploaded!',
            text: `File "${fileToUpload?.name}" has been uploaded successfully.`,
            timer: 1000,
            showConfirmButton: false
          });

          this.selectedFile = null;

          // Reset file input
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }

          // Refresh file list
          this.loadFiles();
        },
        error: (err) => {
          this.addLog(`❌ Upload failed: ${err.error?.error || err.message}`);
          console.error('Upload failed:', err);

          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Could not upload file "${fileToUpload?.name}".`
          });
        }
      });
    }
  });
}

 
  // Remove selected file
  removeFile(): void {
    if (this.selectedFile) {
      this.addLog(`🗑️ Removed selected file: ${this.selectedFile.name}`);
      this.selectedFile = null;
 
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }
 
  // Download file from server
   downloadFile(filename: string): void {
    if (!this.isConnected) {
      this.addLog('❌ Not connected to server');
      return;
    }
   
    Swal.fire({
      title: 'Download File',
      text: `Do you want to download the file "${filename}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, download it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.addLog(`⬇️ Downloading: ${filename}...`);
   
        this.service.downloadFile(filename).subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
   
            this.addLog(`✅ Successfully downloaded: ${filename}`);
   
            Swal.fire({
              icon: 'success',
              title: 'Downloaded!',
              text: `File "${filename}" has been downloaded successfully.`,
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            this.addLog(`❌ Download failed: ${err.error?.error || err.message}`);
            console.error('Download failed:', err);
   
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: `Could not download file "${filename}".`
            });
          }
        });
      }
    });
  }
 
  // Delete file from server
   deleteFile(filename: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you really want to delete the file "${filename}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteFile(filename).subscribe({
          next: () => {
            this.addLog(`🗑️ Deleted: ${filename}`);
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: `File "${filename}" has been deleted.`,
              timer: 2000,
              showConfirmButton: false
            });
            this.loadFiles();
          },
          error: (err) => {
            this.addLog(`❌ Delete failed: ${filename}`);
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: `Could not delete file "${filename}".`
            });
          }
        });
      }
    });
  }
 
  // Add log message with timestamp
  addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.unshift(`[${timestamp}] ${message}`);
 
    // Keep only the last 50 log entries to prevent memory issues
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(0, 50);
    }
  }
 
  // Navigate back to home page
  goBack(): void {
    this.router.navigate(['/home']);
  }
 
  // Check if form is valid for connection
  isFormValid(): boolean {
    return !!(
      this.formModel.name &&
      this.formModel.host &&
      this.formModel.username &&
      this.formModel.password &&
      this.formModel.protocol
    );
  }
 
  // Clear all logs
  clearLogs(): void {
    this.logs = [];
    this.addLog('🧹 Logs cleared');
  }
}