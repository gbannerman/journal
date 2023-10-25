#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CheckDiaryEntry } from "../lib/check-diary-stack";

const app = new cdk.App();
new CheckDiaryEntry(app, "CheckDiaryEntryStack");
