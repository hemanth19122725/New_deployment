import { ConnectionService } from '../connection.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { ToastrService } from 'ngx-toastr';
 
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
    trigger_script_path: '', // ✅ Add this line
  };
 
  baseUrl: string = "http://localhost:8000";
 
  constructor(
    private service: ConnectionService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    // private toastr: ToastrService
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
 
loadFiles() {
  this.service.getFiles().subscribe({
    next: (res) => {
      this.fileList = res.files;
      this.addLog(`Loaded ${res.files.length} files from server`);
    },
    error: (err) => {
      this.addLog(`❌ Failed to load files: ${err.error?.error || err.message}`);
    }
  });
}
 
selectedFile: File | null = null;
 
onFileSelected(event: any) {
  const file = event.target.files[0];
  this.selectedFile = file || null;
}
 
uploadFile() {
  if (!this.selectedFile) return;
 
  const formData = new FormData();
  formData.append('file', this.selectedFile);
 
  this.http.post(this.baseUrl + '/upload', formData).subscribe({
    next: () => {
      this.addLog(`✅ Uploaded: ${this.selectedFile?.name}`);
      this.selectedFile = null;
      this.loadFiles();
    },
    error: (err) => {
      this.addLog(`❌ Upload failed: ${err.error?.error || err.message}`);
    }
  });
}
 
removeFile() {
  this.selectedFile = null;
}
 
downloadFile(filename: string) {
  this.service.downloadFile(filename).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      this.addLog(`⬇️ Downloaded: ${filename}`);
    },
    error: (err) => {
      this.addLog(`❌ Download failed: ${err.error?.error || err.message}`);
    }
  });
}
 
deleteFile(filename: string) {
  this.service.deleteFile(filename).subscribe({
    next: () => {
      this.addLog(`🗑️ Deleted: ${filename}`);
      this.loadFiles();
    },
    error: (err) => {
      this.addLog(`❌ Delete failed: ${err.error?.error || err.message}`);
      // this.toastr.error(`Failed to delete '${filename}'`);
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
 
  if (this.isEditMode) {
    this.service.updateConnection(this.existingName, formData).subscribe(() => {
      this.connectToServer(this.existingName);
    });
  } else {
    this.service.addConnection(formData).subscribe(() => {
      this.connectToServer(formValues.name);
    });
  }
}
 isConnected: boolean = false;
  connecting: boolean = false;
  disconnecting: boolean = false;
 
 
 
  // Updated connect method that works with your existing service
  connectWithFormName(): void {
    if (!this.formModel.name) {
      console.error('Connection name is required');
      return;
    }
 
    if (this.connecting || this.isConnected) {
      return;
    }
 
    this.connecting = true;
   
    this.service.connectExisting(this.formModel.name).subscribe({
      next: (res) => {
        this.logs.unshift(`[${new Date().toLocaleTimeString()}] ✅ Connected to: ${this.formModel.name}`);
        this.isConnected = true;
        this.connecting = false;
       
        // Load file list after successful connection
        this.loadFileList();
      },
      error: (err) => {
        this.logs.unshift(`[${new Date().toLocaleTimeString()}] ❌ Failed to connect: ${this.formModel.name}`);
        this.isConnected = false;
        this.connecting = false;
        console.error('Connection failed:', err);
      }
    });
  }
 
  // Updated disconnect method that works with your existing service
  disconnect() {
    if (!this.isConnected || this.disconnecting) {
      return;
    }
 
    this.disconnecting = true;
   
    this.service.disconnect().subscribe({
      next: () => {
        this.logs.unshift(`[${new Date().toLocaleTimeString()}] 🔌 Disconnected`);
        this.isConnected = false;
        this.disconnecting = false;
       
        // Clear file list on disconnect
        this.fileList = [];
      },
      error: (err) => {
        this.disconnecting = false;
        this.logs.unshift(`[${new Date().toLocaleTimeString()}] ❌ Failed to disconnect`);
        console.error('Disconnection failed:', err);
      }
    });
  }
 
  // Method to load file list (called after successful connection)
  loadFileList(): void {
    if (!this.isConnected) {
      return;
    }
   
    // Your logic to load files from remote server
    // For example: this.fileService.getFileList()
    console.log('Loading file list...');
    // You might want to call another service method here to get the file list
  }
 
  // // Optional: Method to save connection before connecting
  // saveAndConnect(): void {
  //   // First save the connection, then connect
  //   this.onSubmit(this.form).then(() => {
  //     this.connectWithFormName();
  //   });
  // }
 
}