const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { GetCommand } = require('@aws-sdk/lib-dynamodb');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;
const { USERS_TABLE } = process.env;

const client = new DynamoDBClient({ region: 'sa-east-1' });

const generatePolicyDocument = (effect, methodArn) => {
  if (!effect) return null;
  if (!methodArn) return null;

  return {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:invoke',
        Effect: effect,
        Resource: methodArn,
      },
    ],
  };
};

const generateAuthResponse = (effect, methodArn) => {
  const policyDocument = generatePolicyDocument(effect, methodArn);

  return {
    principalId: 'lambda-authorizer',
    policyDocument,
  };
};

exports.handler = async (event) => {
  const { authorizationToken, methodArn } = event;
  if (!authorizationToken) return generateAuthResponse('Deny', methodArn);

  const token = authorizationToken.replace('Bearer ', '');

  try {
    const { email } = jwt.verify(token, JWT_SECRET);

    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        email,
      },
    });

    const { Item } = await client.send(command);

    if (!Item) return generateAuthResponse('Deny', methodArn);
  } catch (error) {
    return generateAuthResponse('Deny', methodArn);
  }

  return generateAuthResponse('Allow', methodArn);
};
