import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

export class CheckDiaryEntry extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new lambda.NodejsFunction(this, "checkForTravelDiaryEntry", {
      runtime: Runtime.NODEJS_18_X,
      functionName: "checkForTravelDiaryEntry-cdk",
      handler: "handler",
      entry: path.join(
        __dirname,
        "../lambda/checkForTravelDiaryEntry/index.js"
      ),
      reservedConcurrentExecutions: 1,
      timeout: cdk.Duration.seconds(15),
      bundling: {
        nodeModules: ["luxon"],
      },
      depsLockFilePath: path.join(
        __dirname,
        "../lambda/checkForTravelDiaryEntry/package-lock.json"
      ),
    });

    fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        effect: iam.Effect.ALLOW,
        resources: ["*"],
      })
    );
    fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:Query"],
        effect: iam.Effect.ALLOW,
        resources: ["*"],
      })
    );

    const eventRule = new events.Rule(this, "dailyTravelDiaryCheck", {
      schedule: events.Schedule.cron({ minute: "0", hour: "8" }),
    });

    eventRule.addTarget(new targets.LambdaFunction(fn));
  }
}
