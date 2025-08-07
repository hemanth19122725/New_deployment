import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
 
@Component({
  standalone: true,
  selector: 'app-view-deploy',
  templateUrl: './view-deploy.component.html',
  imports: [CommonModule],
})
export class ViewDeployComponent {
  @Input() deploy: any;
  @Output() back = new EventEmitter<void>();
 
  goBack() {
    this.back.emit();
  }
}