import { Component, OnInit } from '@angular/core';
import { ConnectionService } from '../connection.service';
import { Router } from '@angular/router';
import { ToastService } from  '../toast.service'
 
@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  connections: any[] = [];
  logs: string[] = [];
 
  // Added for View Modal
  selectedDeploy: any = null;
 
  constructor(private service: ConnectionService, 
    private router: Router,
    private toastService: ToastService) {}
 
  ngOnInit(): void {
    this.fetchConnections();
  }
 
  fetchConnections() {
    this.service.getAllConnections().subscribe((res) => {
      this.connections = res.connections || [];
    });
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
 
delete(name: string) {
  // Show toast asking for confirmation
  this.toastService.showWarning(
    `Click again to delete "${name}"`,
    'CONFIRM DELETE',
    5000
  ).onAction().subscribe(() => {
    // User clicked "Confirm Delete" → Make API call
    console.log('User confirmed deletion via toast, making API call...');

    this.service.deleteConnection(name).subscribe({
      next: (res) => {
        console.log('Delete successful:', res);
        this.logs.unshift(`[${new Date().toLocaleTimeString()}] 🗑️ Deleted connection: ${name}`);
        this.connections = this.connections.filter(conn => conn.name !== name);
      },
      error: (err) => {
        console.error('Delete failed - Full error object:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error URL:', err.url);
        console.error('Backend error:', err.error);

        let errorMessage = `Failed to delete connection: ${name}`;
        if (err.status === 404) {
          errorMessage += ' - Endpoint not found (404)';
        } else if (err.status === 0) {
          errorMessage += ' - Backend server not responding';
        } else {
          errorMessage += ` - Status: ${err.status}`;
        }

        this.logs.unshift(`[${new Date().toLocaleTimeString()}] ❌ ${errorMessage}`);
      }
    });
  });
}

 
  edit(name: string) {
    this.router.navigate(['/add'], { queryParams: { name } });
  }

  // navigateToEdit(name: string): void {
  //   this.router.navigate(['/edit', name]);
  // }

  navigateToDeployment(name: string): void {
    this.router.navigate(['/deployment', name]);
  }
 
  formatTimestamp(timestamp: string) {
    return new Date(timestamp).toLocaleString();
  }
 
  // Optional if you want to close view via function
  closeView() {
    this.selectedDeploy = null;
  }
}
 
 