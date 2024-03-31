/// <reference path="./.sst/platform/config.d.ts" />
import * as aws from "@pulumi/aws";
export default $config({
  app(input) {
    return {
      name: "lambda-ddclient-handler",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    // create pulumi role
    const policy = new aws.iam.Policy("DDClientManagedPolicy", {
      description: "Managed policy that allows access to the hosted zone",
      name: `${$app.name}-${$app.stage}-ddclient-policy`,
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: ["route53:ChangeResourceRecordSets"],
            Effect: "Allow",
            Resource: `arn:aws:route53:::hostedzone/${process.env.TARGET_HOSTED_ZONE_ID}`,
          },
          {
            Action: [
              "route53:ListHostedZonesByName",
              "route53:ListResourceRecordSets",
            ],
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    });

    new sst.aws.ApiGatewayV2("LambdaDDclientHandlerApi").route("$default", {
      handler: "index.update",
      transform: {
        role: {
          name: `${$app.name}-${$app.stage}-ddclient-role`,
          managedPolicyArns: [policy.arn],
          assumeRolePolicy: {
            Version: "2012-10-17",
            Statement: [
              {
                Action: "sts:AssumeRole",
                Effect: "Allow",
                Sid: "main",
                Principal: {
                  Service: "lambda.amazonaws.com",
                },
              },
            ],
          },
        },
      },
    });
  },
});
