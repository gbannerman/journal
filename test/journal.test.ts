import * as cdk from "aws-cdk-lib";
import { Capture, Template } from "aws-cdk-lib/assertions";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { JournalStack } from "../lib/journal";

describe("Journal stack", () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new JournalStack(app, "MyTestStack");
    template = Template.fromStack(stack);
  });

  describe("Journal state machine", () => {
    it("is triggered every day at 8am UTC", () => {
      const eventRuleTargetCapture = new Capture();

      template.hasResourceProperties("AWS::Events::Rule", {
        ScheduleExpression: "cron(0 8 * * ? *)",
        Targets: [{ Arn: { Ref: eventRuleTargetCapture } }],
      });

      expect(
        template.findResources("AWS::StepFunctions::StateMachine")[
          eventRuleTargetCapture.asString()
        ]
      ).toBeDefined();
    });
  });
});
