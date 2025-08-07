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
  isEditMode = false;
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
    trigger_script_path: '' // ✅ Add this
  };
 
  constructor(
    private service: ConnectionService,
    private route: ActivatedRoute,
    private router: Router
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
 
  onSubmit(form: any) {
   const formValues = form.value;

  const formData = new FormData();
  
  formData.append('name', formValues.name);
  formData.append('description', formValues.description);
  formData.append('deploy_location', formValues.deploy_location);
  formData.append('deploy_type', formValues.deploy_type);
  formData.append('host', formValues.host);
  formData.append('username', formValues.username);
  formData.append('password', formValues.password);
  formData.append('remote_path', formValues.remote_path);
  formData.append('protocol', formValues.protocol);
  formData.append('trigger_script_path', formValues.trigger_script_path);

  if (this.isEditMode) {
    this.service.updateConnection(this.existingName, formData).subscribe(() => {
      this.router.navigate(['/']);
    });
  } else {
    this.service.addConnection(formData).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
 
}
 