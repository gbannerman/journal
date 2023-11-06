#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { JournalStack } from "../lib/journal";

const app = new cdk.App();
new JournalStack(app, "Journal");
