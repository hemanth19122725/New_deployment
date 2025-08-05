import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dp-comp',
  templateUrl: './dp-comp.component.html',
  standalone:false,
  styleUrls: ['./dp-comp.component.css']
})
export class DpCompComponent {
  destinations: any[] = [];
  count = 0;

  regionOptions: any = {
    aws: ['us-east-1', 'us-west-2', 'eu-central-1'],
    azure: ['eastus', 'westeurope', 'southeastasia'],
    gcp: ['us-central1', 'europe-west1'],
  };

  constructor(private http: HttpClient) {}

  addDestination() {
    this.count++;
    this.destinations.push({
      id: this.count,
      destinationType: '',
      provider: '',
      region: '',
      ipAddress: '',
      showRegion: false,
      showIp: false,
      message: ''
    });
  }

  updateRegionOptions(dest: any) {
    dest.showRegion = ['aws', 'azure', 'gcp'].includes(dest.provider);
    dest.showIp = ['vm', 'custom'].includes(dest.destinationType);
    dest.region = ''; // reset
    dest.ipAddress = ''; // reset
  }

  testConnection(dest: any) {
    if (!dest.destinationType || !dest.provider) {
      dest.message = 'Please fill required fields.';
      return;
    }

    const data = {
      destinationType: dest.destinationType,
      provider: dest.provider,
      region: dest.showRegion ? dest.region : '',
      ipAddress: dest.showIp ? dest.ipAddress : ''
    };

    this.http.post('http://127.0.0.1:8000/test-connection', data)
      .subscribe({
        next: (response: any) => {
          dest.message = response.message || 'Connection successful!';
        },
        error: (error) => {
          dest.message = 'Connection failed.';
          console.error('Connection error:', error);
        }
      });
  }

  submitForm() {
    const destinationList = this.destinations.map(dest => ({
      destinationType: dest.destinationType,
      provider: dest.provider,
      region: dest.showRegion ? dest.region : '',
      ipAddress: dest.showIp ? dest.ipAddress : ''
    }));

    if (destinationList.some(d => !d.destinationType || !d.provider)) {
      alert('Please fill all required fields.');
      return;
    }

    this.http.post('http://127.0.0.1:8000/create-deployment-destination', destinationList)
      .subscribe({
        next: () => {
          alert('Data submitted successfully!');
        },
        error: (error) => {
          alert('Submission failed!');
          console.error(error);
        }
      });
  }
}
