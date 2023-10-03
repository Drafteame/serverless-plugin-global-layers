import chalk from "chalk";

/**
 * GlobalLayers is a plugin that helps to manage global lambda layers in order to not repeat your
 * self by configuring it on each function.
 */
export default class GlobalLayers {
  constructor(serverless, options, { log }) {
    this.logPrefix = "GlobalLayers:";

    this.serverless = serverless;
    this.options = options || {};
    this.log = log;

    this.provider = this.serverless.getProvider("aws");

    this.hooks = {
      "before:package:initialize": this.addToAll.bind(this),
      "before:deploy:function:initialize": this.addToFunction.bind(this),
    };
  }

  /**
   * Apply global layers configuration over all server lambdas
   *
   * @return Promise<void>
   */
  async addToAll() {
    const { service } = this.serverless;

    let layers = this.getLayersFromConfig();
    let excludedFuncs = this.getExcludedFuncsFromConfig();

    if (layers.length == 0) {
      this.logInfo("No global layers are configured");
      return;
    }

    service.getAllFunctions().forEach((name) => {
      if (excludedFuncs.includes(name)) {
        this.logInfo(
          `Function ${chalk.green(name)} is excluded from global layers`,
        );
        return;
      }

      const functionDefinition = service.getFunction(name);

      this.logInfo(`Adding global layers to ${chalk.green(name)}`);

      if (!functionDefinition.layers) {
        functionDefinition.layers = [];
      }

      functionDefinition.layers = functionDefinition.layers.concat(layers);
    });
  }

  getLayersFromConfig() {
    const { service } = this.serverless;

    if (!service.custom.globalLayers || !service.custom.globalLayers.layers) {
      return [];
    }

    return service.custom.globalLayers.layers;
  }

  getExcludedFuncsFromConfig() {
    const { service } = this.serverless;

    if (
      !service.custom.globalLayers ||
      !service.custom.globalLayers.excludedFuncs
    ) {
      return [];
    }

    return service.custom.globalLayers.excludedFuncs;
  }

  /**
   * Apply global layers configuration over single provided function.
   *
   * @returns Promise<void>
   */
  async addToFunction() {
    const { function: name } = this.options;

    if (!name) {
      return;
    }

    const { service } = this.serverless;

    let layers = this.getLayersFromConfig();
    let excludedFuncs = this.getExcludedFuncsFromConfig();

    if (layers.length == 0) {
      this.logInfo("No global layers are configured");
      return;
    }

    if (excludedFuncs.includes(name)) {
      this.logInfo(
        `Function ${chalk.green(name)} is excluded from global layers`,
      );
      return;
    }

    this.logInfo(`Adding global layers to ${chalk.green(name)}`);

    const functionDefinition = service.getFunction(name);

    if (!functionDefinition.layers) {
      functionDefinition.layers = [];
    }

    functionDefinition.layers = functionDefinition.layers.concat(layers);
  }

  /**
   * Log and info colored message.
   *
   * @param {string} message Message to log.
   */
  logInfo(message) {
    this.log.info(`${chalk.cyan(this.logPrefix)} ${message}`);
  }
}
