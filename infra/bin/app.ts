#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { BackendStack } from "../lib/backend-stack";
import { FrontStack } from "../lib/front-stack";

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: "ap-northeast-1",
};

new BackendStack(app, "BackendStack", { env });
new FrontStack(app, "FrontStack", { env });
