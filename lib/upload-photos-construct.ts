import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

export class UploadPhotos extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const fn = new lambda.Function(this, "uploadPhotos", {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: "lambda_handler",
      code: new lambda.AssetCode(
        path.join(__dirname, "../lambda/uploadPhotos/lambda_function.py")
      ),
      reservedConcurrentExecutions: 1,
      timeout: cdk.Duration.seconds(15),
    });

    const bucket = new s3.Bucket(this, "journalImages", {
      publicReadAccess: true,
      lifecycleRules: [
        {
          tagFilters: {
            meta: "false",
          },
          expiration: cdk.Duration.days(5),
        },
      ],
    });

    fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["s3:PutObject", "s3:PutObjectTagging", "s3:PutObjectAcl"],
        effect: iam.Effect.ALLOW,
        resources: [bucket.bucketArn],
      })
    );
  }
}
