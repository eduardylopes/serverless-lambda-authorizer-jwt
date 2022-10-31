const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { GetCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { ResponseModel } = require('./response-model');

const { USERS_TABLE } = process.env;

const client = new DynamoDBClient({ region: 'sa-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  try {
    const { id } = event.pathParameters;

    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        id,
      },
    });

    const { Item } = await ddbDocClient.send(command);

    if (!Item) return new ResponseModel(404, 'User not found');
    return new ResponseModel(Item, 200, 'User found');
  } catch (error) {
    return new ResponseModel(null, 404, 'User not found');
  }
};
