const { DynamoDBClient, CreateTableCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: "eu-north-1" });

const params = {
    TableName : "TravelDiary",
    KeySchema: [       
        { AttributeName: "day", KeyType: "HASH"},
        { AttributeName: "year", KeyType: "RANGE"},
    ],
    AttributeDefinitions: [       
        { AttributeName: "day", AttributeType: "S" },
        { AttributeName: "year", AttributeType: "N" },
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    }
};

const initSchema = async () => {
    const createTable = new CreateTableCommand(params);
    try {
        const results = await client.send(createTable);
        console.log(results);
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    initSchema,
}