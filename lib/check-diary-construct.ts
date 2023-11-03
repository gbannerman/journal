import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

export class CheckDiary extends Construct {
  fn: lambda.NodejsFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const table = new dynamodb.TableV2(this, "travelDiary", {
      partitionKey: { name: "day", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "year", type: dynamodb.AttributeType.NUMBER },
      deletionProtection: true,
    });

    this.fn = new lambda.NodejsFunction(this, "checkForTravelDiaryEntry", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: path.join(
        __dirname,
        "../lambda/checkForTravelDiaryEntry/index.js"
      ),
      reservedConcurrentExecutions: 1,
      timeout: cdk.Duration.seconds(3),
      bundling: {
        nodeModules: ["luxon"],
      },
      depsLockFilePath: path.join(
        __dirname,
        "../lambda/checkForTravelDiaryEntry/package-lock.json"
      ),
      environment: {
        ENTRIES_TABLE_NAME: table.tableName,
      },
    });

    this.fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        effect: iam.Effect.ALLOW,
        resources: ["*"],
      })
    );
    this.fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:Query"],
        effect: iam.Effect.ALLOW,
        resources: [table.tableArn],
      })
    );
  }
}
