/*
Kevin Smith 2020
This service reads a file that should be stored locally wherever the
application is served from. The content of the file is kept in the
service (most recent read) but the application should store it in
a global config variable to prevent stale data or multiple parts
of the application using the service with different files and 
overriding each other. Thus, config object is private and the get
method returns a copy rather than the object itself.

NOTE: Angular provides a way to use the Singleton pattern which
would accomplish the same goal, but just like this method it requires
developers to understand the problem and adhere to a process to
implement correctly.  By using a private object and giving copies,
I hope to force developers to be unable to incorrectly use
the functionality.
NOTE2: A second alternative is to not use an interface for the service
and just have the config field be static.  This is likely the easiest
way, but creates tight coupling which has many problems including 
making unit testing very hard for classes that use this service.
*/
import { Injectable } from '@angular/core';
import { IConfigService } from './iconfig-service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigService implements IConfigService {
  // contains the key-value pairs found in the file
  private config: object = {};
  
  constructor(
    private httpClient: HttpClient
    ) {}

  // Load the content of config file
  loadConfigFile(path: string) {
    const file = path;
    return new Promise<void>((resolve, reject) => {
      this.httpClient.get(file, {responseType: 'text'}).toPromise().then((response: any) =>{
        this.parseConfigFile(response);
        resolve();
      }).catch((response: any) => {
        reject("Could not load the file");
      });
    });

  }

  // Go through the file and save relevant/valid values
  private parseConfigFile(content: string) {
    var nextIndex = content.indexOf('\n');
    while(nextIndex > -1) {
      var currentLine = content.substr(0, nextIndex); //currentLine will NOT have the newLine char
      content = content.substr(nextIndex + 1); //cuts off the previously found newLine char
      this.processLine(currentLine.trim());
      nextIndex = content.indexOf('\n');
    }
    // run once more as we are at the EOF
    this.processLine(content.trim());
  }

  // Figure out what to do with a line of config file text
  private processLine(input: string) {
    if (input.charAt(0) == '#') return; // ignore comment lines
    var splitStrings = input.split("=");
    var value = splitStrings[1].trim();

    // Determine type of the value, starting with easiest/fastest
    // all characters are digits, treat as int
    var intPattern = /^[0-9]+$/g;
    if (value.match(intPattern)) {
      this.config[splitStrings[0].trim()] = Number.parseInt(value);
      return;
    }

    // all characters are digits except one lone decimal point
    var floatPattern = /^[0-9]+[.][0-9]+$/g; // requires "leading" zero for values less than 1, ie 0.1 not .1
    if (value.match(floatPattern)) {
      this.config[splitStrings[0].trim()] = Number.parseFloat(value);
      return;
    }
    // the exact word matches one of these
    var boolPatternTrue = ["true", "on", "yes"];
    var boolPatternFalse = ["false", "off", "no"];
    if (boolPatternFalse.includes(value)) {
      this.config[splitStrings[0].trim()] = false;
      return;
    }
    if (boolPatternTrue.includes(value)) {
      this.config[splitStrings[0].trim()] = true;
      return;
    }

    // if nothing else, treat it as a string
    this.config[splitStrings[0].trim()] = splitStrings[1].trim();
  }

  // return a COPY of the data in the config object - it is
  // not efficient 
  getConfigObject(): object {
    var keys = Object.keys(this.config);
    var newConfig = {};
    // will not work correctly if config file is allowed to have arrays/lists
    keys.forEach(key => {
      newConfig[key] = this.config[key];
    });
    return newConfig;
  }
}
