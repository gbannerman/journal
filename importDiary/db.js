const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand  } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "eu-north-1" });
const documentClient = DynamoDBDocumentClient.from(client);

const UPDATED_TABLE_NAME = "TravelDiary";

const putItem = async (item) => {
    const params = {
        TableName: UPDATED_TABLE_NAME,
        Item: item,
    }

    const putItem = new PutCommand(params);

    try {
        console.log(item);
        //return await documentClient.send(putItem);
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    putItem,
}