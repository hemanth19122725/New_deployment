// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { HomeComponent } from './home/home.component';
// import { AddConnectionComponent } from './add-connection/add-connection.component';
// import {EditConnectionComponent} from './edit-connection/edit-connection.component'
// import { DeploymentPageComponent } from './deployment-page/deployment-page.component';
 
// const routes: Routes = [
//   { path: '', redirectTo: '/home', pathMatch: 'full' },
//   { path: 'home', component: HomeComponent },
//   { path: 'add', component: AddConnectionComponent },
//   { path: 'edit', component: EditConnectionComponent },

//   { path: '**', redirectTo: '/home' }
  
// ];
 
// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AddConnectionComponent } from './add-connection/add-connection.component';
import { EditConnectionComponent } from './edit-connection/edit-connection.component';
import { DeploymentPageComponent } from './deployment-page/deployment-page.component';
 
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'add', component: AddConnectionComponent },
  { path: 'edit', component: EditConnectionComponent },
    { path: 'deployment/:name', component: DeploymentPageComponent },
  { path: '**', redirectTo: '' }
 
];
 
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}