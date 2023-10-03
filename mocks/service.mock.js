export default class ServiceMock {
  constructor(custom, functions = {}) {
    this.custom = custom;
    this.functions = functions;
  }

  getAllFunctions() {
    return Object.keys(this.functions);
  }

  getFunction(name) {
    return this.functions[name];
  }
}
