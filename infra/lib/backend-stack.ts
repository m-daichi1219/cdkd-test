import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class BackendStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: "Isolated",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    const api = new apigateway.RestApi(this, "Api", {
      restApiName: "cdkd-test-api",
      description: "Minimal REST API for cdkd-test",
      deployOptions: {
        stageName: "prod",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["GET", "OPTIONS"],
        allowHeaders: ["Content-Type"],
      },
    });

    this.addGetLambda(api, vpc, "hello", "hello.ts");
    this.addGetLambda(api, vpc, "goodnight", "goodnight.ts");
    this.addGetLambda(api, vpc, "goodbye", "goodbye.ts");

    this.apiUrl = api.url;

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description:
        "REST API base URL (includes stage). Set this as VITE_API_URL when building front.",
    });
  }

  private addGetLambda(
    api: apigateway.RestApi,
    vpc: ec2.Vpc,
    resourceName: string,
    sourceFile: string,
  ): void {
    const fn = new NodejsFunction(this, `${resourceName}Fn`, {
      runtime: lambda.Runtime.NODEJS_24_X,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(__dirname, "..", "..", "backend", "src", sourceFile),
      handler: "handler",
      depsLockFilePath: path.join(__dirname, "..", "..", "package-lock.json"),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      bundling: {
        minify: true,
        sourceMap: true,
      },
    });

    const resource = api.root.addResource(resourceName);
    resource.addMethod("GET", new apigateway.LambdaIntegration(fn), {
      authorizationType: apigateway.AuthorizationType.NONE,
    });
  }
}
