const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { ResponseModel } = require('./response-model');

const { USERS_TABLE } = process.env;
const client = new DynamoDBClient({ region: 'sa-east-1' });

exports.createUser = async (event) => {
  const user = JSON.parse(event.body);
  const { name, email, password } = user;

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: bcrypt.hashSync(password, 10),
  };

  const command = new PutCommand({
    TableName: USERS_TABLE,
    Item: newUser,
    ConditionExpression: 'attribute_not_exists(#email)',
    ExpressionAttributeNames: {
      '#email': 'email',
    },
  });

  try {
    await client.send(command);
    return new ResponseModel(newUser, 201, 'User created');
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return new ResponseModel(null, 400, 'User already exists');
    }
    return new ResponseModel();
  }
};
