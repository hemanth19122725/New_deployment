import { ConnectionService } from '../connection.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
    private http: HttpClient
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

onFileSelected(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  this.http.post(this.baseUrl+'/upload', formData).subscribe({
    next: () => {
      this.addLog(`✅ Uploaded: ${file.name}`);
      this.loadFiles();
    },
    error: (err) => {
      this.addLog(`❌ Upload failed: ${err.error?.error || err.message}`);
    }
  });
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
    }
  });
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
 connect(name: string) {
    this.service.connectExisting(name).subscribe({
      next: (res) => {
        this.logs.unshift(`[${new Date().toLocaleTimeString()}] ✅ Connected to: ${name}`);
      },
      error: (err) => {
        this.logs.unshift(`[${new Date().toLocaleTimeString()}] ❌ Failed to connect: ${name}`);
      }
    });
  }
  disconnect() {
    this.service.disconnect().subscribe(() => {
      this.logs.unshift(`[${new Date().toLocaleTimeString()}] 🔌 Disconnected`);
    });
  }

 
}
 