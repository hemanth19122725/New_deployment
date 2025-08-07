import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
// import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { AddConnectionComponent } from './add-connection/add-connection.component';
import { HomeComponent } from './home/home.component';
import { EditConnectionComponent } from './edit-connection/edit-connection.component';

@NgModule({
  declarations: [
    AppComponent,
    AddConnectionComponent,
    HomeComponent,
    EditConnectionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
