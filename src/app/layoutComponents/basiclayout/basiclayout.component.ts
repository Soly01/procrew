import { Component } from '@angular/core';
import { HeaderComponent } from '../../Components/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-basiclayout',
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './basiclayout.component.html',
  styleUrl: './basiclayout.component.scss',
})
export class BasiclayoutComponent {}
