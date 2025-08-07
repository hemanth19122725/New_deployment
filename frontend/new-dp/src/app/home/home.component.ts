import { Component, OnInit } from '@angular/core';
import { ConnectionService } from '../connection.service';
import { Router } from '@angular/router';
 
@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  connections: any[] = [];
  logs: string[] = [];
 
  constructor(private service: ConnectionService, private router: Router) {}
 
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

  // delete(name: string) {
  //   if (confirm(`Are you sure you want to delete the connection "${name}"? This action cannot be undone.`)) {
  //     this.service.deleteConnection(name).subscribe({
  //       next: (res) => {
  //         // Add success log
  //         this.logs.unshift(`[${new Date().toLocaleTimeString()}] 🗑️ Deleted connection: ${name}`);
          
  //         this.connections = this.connections.filter(conn => conn.name !== name);
        
  //         this.fetchConnections();
  //       },
  //       error: (err) => {
  //         this.logs.unshift(`[${new Date().toLocaleTimeString()}] ❌ Failed to delete connection: ${name}`);
  //         console.error('Delete error:', err);
  //       }
  //     });
  //   }
  // }

  delete(name: string) {
  console.log('Delete button clicked for:', name);
  console.log('Making request to:', `${this.service.baseUrl}/connections/${name}`);
  
  if (confirm(`Are you sure you want to delete the connection "${name}"? This action cannot be undone.`)) {
    console.log('User confirmed deletion, making API call...');
    
    this.service.deleteConnection(name).subscribe({
      next: (res) => {
        console.log('Delete successful:', res);
        
        // Add success log
        this.logs.unshift(`[${new Date().toLocaleTimeString()}] 🗑️ Deleted connection: ${name}`);
        
        // Remove from frontend array
        this.connections = this.connections.filter(conn => conn.name !== name);
      },
      error: (err) => {
        console.error('Delete failed - Full error object:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error URL:', err.url);
        console.error('Backend error:', err.error);
        
        // Show detailed error in logs
        let errorMessage = `Failed to delete connection: ${name}`;
        if (err.status === 404) {
          errorMessage += '- Endpoint not found (404)';
        } else if (err.status === 0) {
          errorMessage += '- Backend server not responding';
        } else {
          errorMessage += `- Status: ${err.status}`;
        }
        
        this.logs.unshift(`[${new Date().toLocaleTimeString()}] ❌ ${errorMessage}`);
      }
    });
  } else {
    console.log('User cancelled deletion');
  }
}

  edit(name: string) {
    this.router.navigate(['/add'], { queryParams: { name } });
  }
 
  formatTimestamp(timestamp: string) {
    return new Date(timestamp).toLocaleString();
  }
}