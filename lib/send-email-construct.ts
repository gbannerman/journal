import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

export class SendEmail extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const fn = new lambda.NodejsFunction(this, "sendEmail", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: path.join(__dirname, "../lambda/sendOnThisDayEmail/index.js"),
      reservedConcurrentExecutions: 1,
      timeout: cdk.Duration.seconds(3),
    });

    fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        effect: iam.Effect.ALLOW,
        resources: ["*"],
      })
    );
  }
}
