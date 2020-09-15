import { Component } from '@angular/core';
import { ConfigService } from 'src/config-service/config-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'einstein';
  constructor(private configService: ConfigService) {
    configService.loadConfigFile(`assets\\config.file`);
  }
}
