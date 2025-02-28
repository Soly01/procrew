import { Component } from '@angular/core';
import { HeaderComponent } from '../../Components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../Components/footer/footer.component';

@Component({
  selector: 'app-basiclayout',
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './basiclayout.component.html',
  styleUrl: './basiclayout.component.scss',
})
export class BasiclayoutComponent {}
