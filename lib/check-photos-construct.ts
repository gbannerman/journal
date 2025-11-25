import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

export class CheckPhotos extends Construct {
  fn: lambda.NodejsFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    if (
      !process.env.IMMICH_BASE_URL ||
      !process.env.IMMICH_API_KEY ||
      !process.env.IMMICH_BASIC_AUTH_USER ||
      !process.env.IMMICH_BASIC_AUTH_PASSWORD
    ) {
      throw new Error("Required Immich environment variable is not set");
    }

    this.fn = new lambda.NodejsFunction(this, "checkPhotos", {
      runtime: Runtime.NODEJS_24_X,
      handler: "handler",
      entry: path.join(__dirname, "../lambda/checkPhotos/index.js"),
      timeout: cdk.Duration.seconds(15),
      bundling: {
        nodeModules: ["axios", "luxon"],
      },
      depsLockFilePath: path.join(
        __dirname,
        "../lambda/checkPhotos/package-lock.json"
      ),
      environment: {
        IMMICH_BASE_URL: process.env.IMMICH_BASE_URL,
        IMMICH_API_KEY: process.env.IMMICH_API_KEY,
        IMMICH_BASIC_AUTH_USER: process.env.IMMICH_BASIC_AUTH_USER,
        IMMICH_BASIC_AUTH_PASSWORD: process.env.IMMICH_BASIC_AUTH_PASSWORD,
      },
    });

    this.fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        effect: iam.Effect.ALLOW,
        resources: ["*"],
      })
    );
  }
}
