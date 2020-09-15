import { Component } from '@angular/core';
import { ConfigService } from 'src/config-service/config-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = 'einstein';
  config: object = {};

  selectedValue: string = "";

  constructor(private configService: ConfigService) {
    
    configService.loadConfigFile(`assets\\config.file`).then(() => {
      this.config = configService.getConfigObject();
      console.log("Inside app component");
      console.log(this.config);
    });
  }

  showValue(inputText: string) {
    var temp = this.config[inputText.trim()];
    if (temp && inputText) { // can't only check temp because some values are 'false'
      this.selectedValue = temp;
    } else {
      this.selectedValue = "Not Found";
    }
  }
}
