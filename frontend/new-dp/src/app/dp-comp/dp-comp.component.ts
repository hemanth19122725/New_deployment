import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-dp-comp',
  standalone: false,
  templateUrl: './dp-comp.component.html',
  styleUrl: './dp-comp.component.css'
})

export class DpCompComponent{
  deployForm: FormGroup;

  dp_type: boolean = false;

  ipLabel: string = 'IP Address';
  deploymentType: string = '';

  readonly CLOUD_TYPES = ['aws', 'gcp', 'azure'];
  
  // labelName: string = 'IP Address';

  constructor(private fb: FormBuilder) {
    this.deployForm = this.fb.group({

      name: ['', Validators.required],
      description: [''],
      // ipAddress: ['', [Validators.required, Validators.pattern('^([0-9]{1,3}\\.){3}[0-9]{1,3}$')]],
      ipAddress: ['', [Validators.required]],
      deployType: ['', Validators.required],
      type: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      scriptLocation: ['']
    });


  //   this.deployForm.get('deployType')?.valueChanges.subscribe((value:string)=>{
  //     this.dp_type = ['aws','azure','gcp'].includes(value.toLowerCase());

  //     const hostOrIpControl = this.deployForm.get('ipAddress');
  //     if (this.dp_type) {
  //       hostOrIpControl?.setValidators([Validators.required]); // Only require
  //     } else {
  //       hostOrIpControl?.setValidators([
  //         Validators.required,
  //         Validators.pattern('^([0-9]{1,3}\\.){3}[0-9]{1,3}$')
  //       ]);
  //     }
  //     hostOrIpControl?.updateValueAndValidity();
    
  // })
  }


  // selectedDeployType: string = 'aws'
  // ipLabel: string = 'IP Address';

//   updateLabel(): void {
//   const selectedValue = this.deployForm.get('scriptLocation')?.value?.toLowerCase();
//   this.deploymentType = selectedValue;

//   const isCloud = ['aws', 'gcp', 'azure'].includes(selectedValue);
//   this.ipLabel = isCloud ? 'Host' : 'IP Address';
// }


  ngOnInit(): void {
    this.deployForm.get('scriptLocation')?.valueChanges.subscribe((value: string) => {
      const selected = value?.toLowerCase();
      const ipCtrl = this.deployForm.get('ipAddress');

      // Change label
      if (this.CLOUD_TYPES.includes(selected)) {
        this.ipLabel = 'Host';
        ipCtrl?.setValidators([Validators.required]); 
      } 
      
      else {
        this.ipLabel = 'IP Address';
        ipCtrl?.setValidators([
          Validators.required,
          Validators.pattern('^([0-9]{1,3}\\.){3}[0-9]{1,3}$') 
        ]);
      }

      ipCtrl?.updateValueAndValidity();
    });
  }



  onSubmit() {
    if (this.deployForm.valid) {
      console.log('Form Submitted!', this.deployForm.value);
      // Need to add submit logic
      this.deployForm.reset();
    }
  }

  onBack() {
    console.log('Back button clicked');
    // Need to add navigation logic
  }

  onConnect() {
    console.log('Connect button clicked');
    // Need to add connect logic here
  }

  onDisconnect() {
    console.log('Disconnect button clicked');
    //Need to add disconnect logic here
  }
}
