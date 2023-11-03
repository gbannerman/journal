import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

export class UploadPhotos extends Construct {
  fn: lambda.Function;
  bucket: s3.Bucket;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, "journalImages", {
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
        ignorePublicAcls: false,
      }),
      lifecycleRules: [
        {
          tagFilters: {
            meta: "false",
          },
          expiration: cdk.Duration.days(5),
        },
      ],
      // TODO: Define bucket policy here
    });

    this.fn = new lambda.Function(this, "uploadPhotos", {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: "lambda_function.lambda_handler",
      code: new lambda.AssetCode(
        path.join(__dirname, "../lambda/uploadPhotos")
      ),
      timeout: cdk.Duration.seconds(5),
      environment: {
        PHOTOS_BUCKET: this.bucket.bucketName,
      },
    });

    this.fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["s3:PutObject", "s3:PutObjectTagging", "s3:PutObjectAcl"], // TODO: Decide if I'll use ACL or not
        effect: iam.Effect.ALLOW,
        resources: [this.bucket.bucketArn],
      })
    );
  }
}
