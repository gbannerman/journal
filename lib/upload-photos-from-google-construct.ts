import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";

export class UploadPhotosFromGoogle extends Construct {
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
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
    });

    this.fn = new lambda.Function(this, "uploadPhotos", {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: "lambda_function.lambda_handler",
      code: new lambda.AssetCode(
        path.join(__dirname, "../lambda/uploadPhotosFromGoogle")
      ),
      timeout: cdk.Duration.seconds(8),
      environment: {
        PHOTOS_BUCKET: this.bucket.bucketName,
      },
    });

    this.fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["s3:PutObject", "s3:PutObjectTagging", "s3:PutObjectAcl"],
        resources: [this.bucket.bucketArn, this.bucket.arnForObjects("*")],
      })
    );

    this.bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        resources: [this.bucket.arnForObjects("*"), this.bucket.bucketArn],
        actions: ["s3:PutObject", "s3:PutObjectTagging", "s3:PutObjectAcl"],
        principals: [this.fn.role!],
      })
    );
  }
}
