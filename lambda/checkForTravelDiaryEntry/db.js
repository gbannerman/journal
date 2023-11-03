const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "eu-north-1" });
const documentClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.ENTRIES_TABLE_NAME;

const getItemsByKey = async (
  keyExpression,
  expressionAttributeValues,
  expressionAttributeNames
) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: keyExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
  };

  const getItems = new QueryCommand(params);

  try {
    const result = await documentClient.send(getItems);
    return result.Items;
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getItemsByKey,
};
