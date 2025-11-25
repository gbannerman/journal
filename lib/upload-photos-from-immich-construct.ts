import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

export class UploadPhotosFromImmich extends Construct {
  fn: lambda.Function;

  constructor(scope: Construct, id: string, { bucket }: { bucket: s3.Bucket }) {
    super(scope, id);

    if (
      !process.env.IMMICH_BASE_URL ||
      !process.env.IMMICH_API_KEY ||
      !process.env.IMMICH_BASIC_AUTH_USER ||
      !process.env.IMMICH_BASIC_AUTH_PASSWORD
    ) {
      throw new Error("Required Immich environment variable is not set");
    }

    this.fn = new lambda.Function(this, "uploadPhotosFromImmich", {
      runtime: lambda.Runtime.PYTHON_3_14,
      handler: "lambda_function.lambda_handler",
      code: new lambda.AssetCode(
        path.join(__dirname, "../lambda/uploadPhotosFromImmich")
      ),
      timeout: cdk.Duration.seconds(8),
      environment: {
        PHOTOS_BUCKET: bucket.bucketName,
        IMMICH_BASE_URL: process.env.IMMICH_BASE_URL,
        IMMICH_API_KEY: process.env.IMMICH_API_KEY,
        IMMICH_BASIC_AUTH_USER: process.env.IMMICH_BASIC_AUTH_USER,
        IMMICH_BASIC_AUTH_PASSWORD: process.env.IMMICH_BASIC_AUTH_PASSWORD,
      },
    });

    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        resources: [bucket.arnForObjects("*"), bucket.bucketArn],
        actions: ["s3:PutObject", "s3:PutObjectTagging", "s3:PutObjectAcl"],
        principals: [this.fn.role!],
      })
    );
  }
}
