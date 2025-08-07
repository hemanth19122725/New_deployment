import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
 
 
@Injectable({
  providedIn: 'root'
})


export class ConnectionService {
 
  baseUrl = 'http://localhost:8000';
 
  constructor(private http: HttpClient) {}
 
  getAllConnections(): Observable<any> {
    return this.http.get(`${this.baseUrl}/connections`);
  }
 
  connectExisting(name: string): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    return this.http.post(`${this.baseUrl}/connect/existing`, formData);
  }
 
  addConnection(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/connect`, payload);
  }
 
  getConnectionByName(name: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/connections/${name}`);
  }

  disconnect(): Observable<any> {
    return this.http.post(`${this.baseUrl}/disconnect`, {});
  }
  updateConnection(name: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/connections/${name}`, formData);
  }

  deleteConnection(name: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/connections/${name}`);
  }
  getFiles(): Observable<{ files: string[] }> {
    return this.http.get<{ files: string[] }>(`${this.baseUrl}/files`);
  }
  // connection.service.ts
  downloadFile(filename: string): Observable<Blob> {
    return this.http.get<Blob>(`${this.baseUrl}/download?filename=${encodeURIComponent(filename)}`, { responseType: 'blob' as 'json' });
  }
  deleteFile(filename: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete?filename=${encodeURIComponent(filename)}`);
  }
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    console.log('Uploading to:', `${this.baseUrl}/upload`);
    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

}