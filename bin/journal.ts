#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Journal } from "../lib/journal";

const app = new cdk.App();
new Journal(app, "Journal");
