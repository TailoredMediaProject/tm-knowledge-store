import ServerConfigModel from '../models/server-config.model';

export default class ServerConfig implements ServerConfigModel {
  host = process.env.HOST || '0.0.0.0';
  port = parseInt(process.env.PORT || '0', 10);
}
