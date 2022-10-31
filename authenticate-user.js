const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ResponseModel } = require('./response-model');

const { USERS_TABLE } = process.env;
const { JWT_SECRET } = process.env;

const client = new DynamoDBClient({ region: 'sa-east-1' });

exports.handler = async (event) => {
  const { email, password } = JSON.parse(event.body);

  const command = new ScanCommand({
    TableName: USERS_TABLE,
    ExpressionAttributeNames: {
      '#email': 'email',
    },
    ExpressionAttributeValues: {
      ':email': email,
    },
    FilterExpression: '#email = :email',
  });

  try {
    const {
      Items: [Item],
    } = await client.send(command);

    if (!Item) return new ResponseModel(null, 404, 'Invalid email or password');

    const isValidPassword = bcrypt.compareSync(password, Item.password);

    if (!isValidPassword) {
      return new ResponseModel(null, 404, 'Invalid email or password');
    }

    const tokenPayload = {
      id: Item.id,
      name: Item.name,
      email: Item.email,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '1d',
    });

    return new ResponseModel(
      {
        access: token,
      },
      200,
      'Token successfully signed',
    );
  } catch (error) {
    return new ResponseModel(null, 404, 'Invalid email or password');
  }
};
