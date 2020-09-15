export interface IConfigService {
  loadConfigFile(path: string);
  getConfigObject(): object;
}