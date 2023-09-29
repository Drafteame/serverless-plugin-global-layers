# serverless-plugin-global-layers

A simple serverless plugin that allows you to define a list of ARN layers that should be added to all your defined lambdas.
**You should to be sure that the layer that your are listing are compatible with your runtime**

This added layers will not override the specific `layers` field on function definition, also will concatenate the two configurations in a single one,
giving you the option to define specific layers for a function in the standard serverless way, and at the same time add the global ones.

## Installation

Install plugin via npm:

```bash
npm install --save-dev serverless-plugin-global-layers
```

Add the plugin to your `serverless.yml` file:

```yaml
# ...

custom:
  globalLayers:
    layers:
      - <some-layer-arn>
    excludedFuncs:
      - <function-name-to-exclude>

# ...

plugins:
  - serverless-plugin-global-layers
```

## Project structure

As this plugin does not create any layer and is just in charge of modify your serverless configuration to not repeat your self by adding same layers
on all your lambdas, is recommended to manage your lambda layers in a different projects in order to ensure you have the proper ARN first before
deploying your project.

Sopouse a monorepo with the next struct:

```text
.
├── layers
│   ├── package.json
│   ├── serverless.yml
│   └── some-layer
│       └── some-file.txt
└── service
    ├── package.json
    ├── serverless.yml
    └── src
        └── handler.js
```

On this project `layers/serverless.yml` file should look like this:

```yaml
service: some-layers

provider:
  name: aws
  stage: ${opt:stage, "dev"}

layers:
  layer1:
    path: some-layer
    description: txt shared files
```

Here we define a layer called `layer1` that is deployed independently from the services or lambdas on the repository.
Now we can deploy just the layers before all the lambdas an get the latest layer versions for our lambdas.

And by the other hand `service/serverless.yml` file should look like this:

```yaml
service: some-name

custom:
  globalLayers:
    layers:
      - ${cf:some-layers-${self:provider.stage}.Layer1LambdaLayerQualifiedArn}

provider:
  name: aws
  stage: ${opt:stage, "dev"}
  runtime: nodejs18.x
  architecture: x86_64

functions:
  some:
    handler: src/handler.hello

plugins:
  - serverless-plugin-global-layers
```

On this file we are loading the latest lambda layer ARN by suing a CloudFormation reference to an output provided by the
`some-layers` stack according to the stage deployed:

```text
${cf:some-layers-${self:provider.stage}.Layer1LambdaLayerQualifiedArn}
```

You have to make sure you are using the correct CF output name by replacing `Layer1LambdaLayerQualifiedArn` with the one that your layers
service provide you after deploy.

You can check more about how to reference CF outputs on serverless on the [official documentation][reference-cloudformation-outputs]

## Testing

To start testing the plugin locally, you must add it from your local source to the test project with this command:

```bash
npm i --save-dev -D <local-path-to-plugin-folder>
```

[reference-cloudformation-outputs]: https://www.serverless.com/framework/docs/providers/aws/guide/variables/#reference-cloudformation-outputs
