import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

export class CheckPhotos extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const fn = new lambda.NodejsFunction(this, "checkPhotos", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: path.join(__dirname, "../lambda/checkPhotos/index.js"),
      reservedConcurrentExecutions: 1,
      timeout: cdk.Duration.seconds(7),
      bundling: {
        nodeModules: ["axios", "luxon"],
      },
      depsLockFilePath: path.join(
        __dirname,
        "../lambda/checkPhotos/package-lock.json"
      ),
    });

    fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        effect: iam.Effect.ALLOW,
        resources: ["*"],
      })
    );
  }
}
