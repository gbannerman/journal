import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

interface SendEmailProps {
  bucketDomainName: string;
}

export class SendEmail extends Construct {
  fn: lambda.NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    { bucketDomainName }: SendEmailProps
  ) {
    super(scope, id);

    this.fn = new lambda.NodejsFunction(this, "sendEmail", {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../lambda/sendOnThisDayEmail/index.js"),
      reservedConcurrentExecutions: 1,
      timeout: cdk.Duration.seconds(3),
      environment: {
        BUCKET_DOMAIN_NAME: bucketDomainName,
      },
    });

    this.fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        effect: iam.Effect.ALLOW,
        resources: ["*"],
      })
    );
  }
}
