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

    this.fn = new lambda.NodejsFunction(this, "checkPhotos", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: path.join(__dirname, "../lambda/checkPhotos/index.js"),
      timeout: cdk.Duration.seconds(5),
      bundling: {
        nodeModules: ["axios", "luxon"],
      },
      depsLockFilePath: path.join(
        __dirname,
        "../lambda/checkPhotos/package-lock.json"
      ),
      environment: {
        GOOGLE_REFRESH_TOKEN:
          "1//04rgPr7hlijQxCgYIARAAGAQSNwF-L9Irnto1GWANksHaI890UY6iOPLgiWcL16IgMcyRPlOxLVFlZMT7tkLbTs3sLA9mIY36PWE",
        GOOGLE_CLIENT_ID:
          "915865441780-4bapvpvl6h7q7tgbd6ij3km7mami18tq.apps.googleusercontent.com",
        GOOGLE_CLIENT_SECRET: "2-jt4Ut3EgHl0T6Ds_ecEIov",
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
