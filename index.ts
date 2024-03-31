import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
  ListResourceRecordSetsCommand,
} from "@aws-sdk/client-route-53";

const CREDENTIALS = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
};
// Initialize the Route53 Client
const client = new Route53Client({ region: "us-east-1" });

const updateZone = async (zoneId: string, hostName: string, ip: string) => {
  const command = new ChangeResourceRecordSetsCommand({
    HostedZoneId: zoneId,
    ChangeBatch: {
      Changes: [
        {
          Action: "UPSERT",
          ResourceRecordSet: {
            Name: hostName,
            Type: "A",
            TTL: 300,
            ResourceRecords: [{ Value: ip }],
          },
        },
      ],
    },
  });
  const response = await client.send(command);
  return response;
};

const getIpAddressForZone = async (zoneId: string, hostName: string) => {
  const command = new ListResourceRecordSetsCommand({
    // MaxItems: 1,
    HostedZoneId: zoneId,
    StartRecordName: hostName,
    StartRecordType: "A",
  });

  const response = await client.send(command);

  return response.ResourceRecordSets[0].ResourceRecords[0].Value;
};

const hostedZoneId = process.env.TARGET_HOSTED_ZONE_ID;

export const update = async (event: any) => {
  const { hostname, myip, system } = event.queryStringParameters;
  const { authorization } = event.headers;
  if (!authorization) {
    return { statusCode: 200, body: "badauth" };
  }
  // base64 decode string
  const decodedAuth = Buffer.from(
    authorization.split(" ")[1],
    "base64"
  ).toString();
  const [username, password] = decodedAuth.split(":");

  if (username !== CREDENTIALS.username || password !== CREDENTIALS.password) {
    return { statusCode: 200, body: "badauth" };
  }

  const previousIpAddress = await getIpAddressForZone(hostedZoneId, hostname);

  if (previousIpAddress === myip) {
    return {
      statusCode: 200,
      body: "nochg",
    };
  }

  await updateZone(hostedZoneId, hostname, myip);
  try {
    console.log("Updated ip address for to: ", myip);
    return {
      statusCode: 200,
      body: "good",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error updating DNS record",
      }),
    };
  }
};
