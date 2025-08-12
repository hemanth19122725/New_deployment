import { ConnectionService } from '../connection.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastService } from '../toast.service';
 
@Component({
  standalone: false,
  selector: 'app-add-connection',
  templateUrl: './add-connection.component.html',
})
 
export class AddConnectionComponent implements OnInit {
  connected: boolean = false
  isEditMode = false;
  existingName = '';
  fileList: string[] = [];
  logs: string[] = [];
 
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
 
  baseUrl: string = "http://localhost:8000";
 
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
      this.isEditMode = true;
      this.existingName = name;
 
      this.service.getConnectionByName(name).subscribe((res) => {
        this.formModel = { ...res };
      });
    }
  }


  connectExisting(name: string) {
  const form = new FormData();
  form.append('name', name);
  return this.http.post('/connect/existing', form);
}
 
  connectToServer(name: string) {
  this.service.connectExisting(name).subscribe({
    next: () => {
      this.connected = true;
      this.addLog(`Connected to server: ${name}`);
      this.loadFiles();
    },
    error: (err) => {
      this.addLog(`❌ Failed to connect: ${err.error?.error || err.message}`);
    }
  });
}
 
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
 
selectedFile: File | null = null;
 
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
      return;
    }

    if (!this.isConnected) {
      this.addLog('❌ Not connected to server');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.addLog(`⬆️ Uploading: ${this.selectedFile.name}...`);

    this.http.post(this.baseUrl + '/upload', formData).subscribe({
      next: () => {
        this.addLog(`✅ Successfully uploaded: ${this.selectedFile?.name}`);
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
      },
      error: (err) => {
        this.addLog(`❌ Download failed: ${err.error?.error || err.message}`);
        console.error('Download failed:', err);
      }
    });
  }
 
 // Delete file from server
  deleteFile(filename: string): void {
    if (!this.isConnected) {
      this.addLog('❌ Not connected to server');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    this.addLog(`🗑️ Deleting: ${filename}...`);

    this.service.deleteFile(filename).subscribe({
      next: () => {
        this.addLog(`✅ Successfully deleted: ${filename}`);
        this.loadFiles(); // Refresh file list
      },
      error: (err) => {
        this.addLog(`❌ Delete failed: ${err.error?.error || err.message}`);
        console.error('Delete failed:', err);
      }
    });
  }
  
confirmDelete(filename: string) {
  const confirmed = window.confirm(`Are you sure you want to delete the file '${filename}'?`);
  if (confirmed) {
    this.deleteFile(filename);
  }
}
 
addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  this.logs.unshift(`[${timestamp}] ${message}`);
}
 
 onSubmit(form: any) {
  const formValues = form.value;
  const formData = new FormData();

  for (const key in formValues) {
    formData.append(key, formValues[key]);
  }

  // Step 1: Validate before saving
  this.http.post(this.baseUrl + '/validate', formData).subscribe({
    next: (res: any) => {
      if (res.valid) {
        // Step 2: Save after validation passes
        if (this.isEditMode) {
          this.service.updateConnection(this.existingName, formData).subscribe(() => {
            this.snackBar.open('Connection Updated Successfully', 'Close', {
              duration: 4000,
              panelClass: ['toast-success']
            });
          });
        } else {
          this.service.addConnection(formData).subscribe(() => {
            this.snackBar.open('Connection Saved Successfully', 'Close', {
              duration: 4000,
              panelClass: ['toast-success']
            });
          });
        }
      } else {
        // Invalid details
        this.snackBar.open(
          res.error || 'Invalid connection details. Please check username, password, host, or remote path.',
          'Close',
          { 
            duration: 4000, 
            panelClass: ['toast-error'] 
          }
        );
      }
    },
    error: (err) => {
      this.snackBar.open('Error validating connection: ' + (err.error?.error || err.message), 'Close', {
        duration: 4000,
        panelClass: ['toast-error']
      });
    }
  });
}


  isConnected: boolean = false;
  connecting: boolean = false;
  disconnecting: boolean = false;
 
 
 
  // Updated connect method that works with your existing service
  connectWithFormName(): void {
  if (!this.formModel.name) {
    this.addLog('❌ Connection name is required');
    this.snackBar.open('Connection name is required', 'Close', {
      duration: 4000,
      panelClass: ['toast-error']
    });
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

      // ✅ Success toast
      this.snackBar.open('Successfully Connected to the Host', 'Close', {
        duration: 4000,
        panelClass: ['toast-success']
      });

      // Automatically load file list
      this.loadFiles();
    },
    error: (err) => {
      this.addLog(`❌ Failed to connect to: ${this.formModel.name}`);
      this.addLog(`❌ Error: ${err.error?.error || err.message}`);
      this.isConnected = false;
      this.connecting = false;
      console.error('Connection failed:', err);

      // ❌ Error toast
      this.snackBar.open(
        "The Connection is not established. Please Enter the correct details",
        'Close',
        {
          duration: 4000,
          panelClass: ['toast-error']
        }
      );
    }
  });
}

 
  // Disconnect Method
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
 
  // Method to load file list (called after successful connection)
  // loadFileList(): void {
  //   if (!this.isConnected) {
  //     this.addLog('❌ Not connected to server');
  //     return;
  //   }
  //   this.addLog('📁 Loading remote files...');
   
  //   this.service.getFiles().subscribe({
  //     next: (res) => {
  //       this.fileList = res.files || [];
  //       this.addLog(`✅ Loaded ${this.fileList.length} files from server`);
  //     },
  //     error: (err) => {
  //       this.addLog(`❌ Failed to load files: ${err.error?.error || err.message}`);
  //       console.error('Failed to load files:', err);
  //     }
  //   });
    
  // }
 
  // Optional: Method to save connection before connecting
  // saveAndConnect(): void {
  //   // First save the connection, then connect
  //   this.onSubmit(this.form).then(() => {
  //     this.connectWithFormName();
  //   });
  // }
 
}