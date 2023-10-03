import GlobalLayers from "./index.js"; // Import the class to be tested
import ServiceMock from "./mocks/service.mock.js";
import ServerlessMock from "./mocks/serverless.mock.js";
import { assert } from "chai"; // Import the assertion library

describe("GlobalLayers", () => {
  let optionsMock;
  let logMock;
  let defaultCustom;
  let functions;

  beforeEach(() => {
    defaultCustom = {
      globalLayers: {
        layers: ["layer1", "layer2"],
        excludedFuncs: [],
      },
    };

    functions = {
      function1: {},
      function2: {},
    };

    optionsMock = {};

    logMock = {
      info: () => {},
    };
  });

  it("should add global layers to all functions", async () => {
    let serverlessMock = new ServerlessMock(
      new ServiceMock(defaultCustom, functions),
    );

    const globalLayers = new GlobalLayers(serverlessMock, optionsMock, {
      log: logMock,
    });

    await globalLayers.addToAll();

    // Add assertions to check if layers were added to all functions as expected
    assert.deepEqual(serverlessMock.service.getFunction("function1").layers, [
      "layer1",
      "layer2",
    ]);

    assert.deepEqual(serverlessMock.service.getFunction("function2").layers, [
      "layer1",
      "layer2",
    ]);
  });

  it("should exclude functions specified in config", async () => {
    defaultCustom.globalLayers.excludedFuncs.push("function1");

    let serverlessMock = new ServerlessMock(
      new ServiceMock(defaultCustom, functions),
    );

    const globalLayers = new GlobalLayers(serverlessMock, optionsMock, {
      log: logMock,
    });

    await globalLayers.addToAll();

    // Add assertions to check if excludedFuncs were not added to the function
    assert.deepEqual(
      serverlessMock.service.getFunction("function1").layers,
      undefined,
    );

    assert.deepEqual(serverlessMock.service.getFunction("function2").layers, [
      "layer1",
      "layer2",
    ]);
  });

  it("should add global layers to a single function", async () => {
    optionsMock.function = "function2"; // Specify the function to add layers to

    let serverlessMock = new ServerlessMock(
      new ServiceMock(defaultCustom, functions),
    );

    const globalLayers = new GlobalLayers(serverlessMock, optionsMock, {
      log: logMock,
    });

    await globalLayers.addToFunction();

    // Add assertions to check if layers were added to the specified function
    assert.deepEqual(serverlessMock.service.getFunction("function2").layers, [
      "layer1",
      "layer2",
    ]);
  });

  it("should exclude specified function from addToFunction", async () => {
    optionsMock.function = "function1"; // Specify the excluded function

    defaultCustom.globalLayers.excludedFuncs.push("function1");

    let serverlessMock = new ServerlessMock(
      new ServiceMock(defaultCustom, functions),
    );

    const globalLayers = new GlobalLayers(serverlessMock, optionsMock, {
      log: logMock,
    });

    await globalLayers.addToFunction();

    // Add assertions to check if excluded function was not modified
    assert.deepEqual(
      serverlessMock.service.getFunction("function1").layers,
      undefined,
    );
  });

  it("should not add global layers when custom.globalLayers.layers is not defined", async () => {
    delete defaultCustom.globalLayers.layers; // Simulate no layers defined in config

    let serverlessMock = new ServerlessMock(
      new ServiceMock(defaultCustom, functions),
    );

    const globalLayers = new GlobalLayers(serverlessMock, optionsMock, {
      log: logMock,
    });

    await globalLayers.addToAll();

    // Add assertions to check if no layers were added to functions
    assert.deepEqual(
      serverlessMock.service.getFunction("function1").layers,
      undefined,
    );
    assert.deepEqual(
      serverlessMock.service.getFunction("function2").layers,
      undefined,
    );
  });

  it("should not exclude any functions when custom.globalLayers.excludedFuncs is not defined", async () => {
    delete defaultCustom.globalLayers.excludedFuncs; // Simulate no excluded functions defined in config

    let serverlessMock = new ServerlessMock(
      new ServiceMock(defaultCustom, functions),
    );

    const globalLayers = new GlobalLayers(serverlessMock, optionsMock, {
      log: logMock,
    });

    await globalLayers.addToAll();

    // Add assertions to check if no functions were excluded
    assert.deepEqual(serverlessMock.service.getFunction("function1").layers, [
      "layer1",
      "layer2",
    ]);
    assert.deepEqual(serverlessMock.service.getFunction("function2").layers, [
      "layer1",
      "layer2",
    ]);
  });

  it("should handle addToFunction when custom.globalLayers is not defined", async () => {
    delete defaultCustom.globalLayers; // Simulate no custom.globalLayers defined in config
    optionsMock.function = "function2"; // Specify the function to add layers to

    let serverlessMock = new ServerlessMock(
      new ServiceMock(defaultCustom, functions),
    );

    const globalLayers = new GlobalLayers(serverlessMock, optionsMock, {
      log: logMock,
    });

    await globalLayers.addToFunction();

    // Add assertions to check if layers were not added to the specified function
    assert.deepEqual(
      serverlessMock.service.getFunction("function2").layers,
      undefined,
    );

    assert.deepEqual(
      serverlessMock.service.getFunction("function1").layers,
      undefined,
    );
  });
});
