import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { CheckDiary } from "./check-diary-construct";
import { CheckPhotos } from "./check-photos-construct";
import { UploadPhotosFromGoogle } from "./upload-photos-from-google-construct";
import { SendEmail } from "./send-email-construct";
import { UploadPhotosFromImmich } from "./upload-photos-from-immich-construct";

export class JournalStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const checkDiary = new CheckDiary(this, "CheckDiary");

    const checkPhotos = new CheckPhotos(this, "CheckPhotos");

    const uploadPhotosFromGoogle = new UploadPhotosFromGoogle(
      this,
      "UploadPhotosFromGoogle"
    );

    const uploadPhotosFromImmich = new UploadPhotosFromImmich(
      this,
      "UploadPhotosFromImmich",
      {
        bucket: uploadPhotosFromGoogle.bucket,
      }
    );

    const sendEmail = new SendEmail(this, "SendEmail", {
      bucketDomainName: uploadPhotosFromGoogle.bucket.bucketRegionalDomainName,
    });

    const checkDiaryTask = new tasks.LambdaInvoke(this, "CheckDiaryTask", {
      lambdaFunction: checkDiary.fn,
      outputPath: "$.Payload",
    });

    const checkPhotosTask = new tasks.LambdaInvoke(this, "CheckPhotosTask", {
      lambdaFunction: checkPhotos.fn,
      resultPath: "$.images",
      resultSelector: {
        "images.$": "$.Payload.images",
      },
    });

    const uploadGoogleImagesTask = new tasks.LambdaInvoke(
      this,
      "UploadGoogleImagesTask",
      {
        lambdaFunction: uploadPhotosFromGoogle.fn,
        outputPath: "$.Payload.urls",
      }
    );

    const uploadImmichImagesTask = new tasks.LambdaInvoke(
      this,
      "UploadImmichImagesTask",
      {
        lambdaFunction: uploadPhotosFromImmich.fn,
        outputPath: "$.Payload.urls",
      }
    );

    const sendEmailTask = new tasks.LambdaInvoke(this, "SendEmailTask", {
      lambdaFunction: sendEmail.fn,
      outputPath: "$.Payload",
    });

    const filterToGooglePhotos = new sfn.Pass(this, "FilterToGooglePhotos", {
      inputPath: "$.images.images[?(@.source=='GOOGLE')]",
      resultPath: "$.googleImages",
      outputPath: "$.googleImages",
    });

    const filterToImmichPhotos = new sfn.Pass(this, "FilterToImmichPhotos", {
      inputPath: "$.images.images[?(@.source=='IMMICH')]",
      resultPath: "$.immichImages",
      outputPath: "$.immichImages",
    });

    const copyImagesToS3 = checkPhotosTask
      .next(
        new sfn.Parallel(this, "CopyImagesToS3", {
          resultSelector: {
            "images.$": "$[*][*]",
          },
          resultPath: "$.images",
        })
          .branch(filterToGooglePhotos.next(uploadGoogleImagesTask))
          .branch(filterToImmichPhotos.next(uploadImmichImagesTask))
      )
      .next(
        new sfn.Pass(this, "FlattenEntry", {
          parameters: {
            "content.$": "$.content",
            "images.$": "$.images.images",
            "yearsAgo.$": "$.yearsAgo",
            "tripName.$": "$.tripName",
            "country.$": "$.country",
          },
        })
      );

    const sendEmailForEntries = new sfn.Map(this, "MapEntries", {
      itemsPath: "$.entries",
      resultPath: "$.entries",
    })
      .itemProcessor(copyImagesToS3)
      .next(sendEmailTask);

    const lambdaChain = checkDiaryTask.next(
      new sfn.Choice(this, "IfEntriesFound")
        .when(
          sfn.Condition.booleanEquals("$.entriesFound", true),
          sendEmailForEntries
        )
        .otherwise(new sfn.Pass(this, "NoEntries"))
    );

    const stateMachine = new sfn.StateMachine(this, "JournalStateMachine", {
      definitionBody: sfn.DefinitionBody.fromChainable(lambdaChain),
    });

    checkDiary.fn.grantInvoke(stateMachine.role);
    checkPhotos.fn.grantInvoke(stateMachine.role);
    uploadPhotosFromGoogle.fn.grantInvoke(stateMachine.role);
    sendEmail.fn.grantInvoke(stateMachine.role);

    const eventRule = new events.Rule(this, "dailyTravelDiaryCheck", {
      schedule: events.Schedule.cron({ minute: "0", hour: "8" }),
    });

    eventRule.addTarget(new targets.SfnStateMachine(stateMachine));
  }
}
