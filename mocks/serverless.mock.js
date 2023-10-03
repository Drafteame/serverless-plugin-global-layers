export default class ServerlessMock {
  constructor(service) {
    this.service = service;
  }

  getProvider() {
    return {};
  }
}
