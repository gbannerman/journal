import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CheckDiary } from "./check-diary-construct";
import { CheckPhotos } from "./check-photos-construct";
import { UploadPhotos } from "./upload-photos-construct";
import { SendEmail } from "./send-email-construct";

export class Journal extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const checkDiary = new CheckDiary(this, "CheckDiary");

    const checkPhotos = new CheckPhotos(this, "CheckPhotos");

    const uploadPhotos = new UploadPhotos(this, "UploadPhotos");

    const sendEmail = new SendEmail(this, "SendEmail");
  }
}
