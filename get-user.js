const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { GetCommand } = require('@aws-sdk/lib-dynamodb');
const { ResponseModel } = require('./response-model');

const { USERS_TABLE } = process.env;

const client = new DynamoDBClient({ region: 'sa-east-1' });

exports.getUser = async (event) => {
  try {
    const { id } = event.pathParameters;

    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        id,
      },
    });

    const { Item } = await client.send(command);

    if (!Item) return new ResponseModel(404, 'User not found');
    return new ResponseModel(Item, 200, 'User found');
  } catch (error) {
    return new ResponseModel();
  }
};
