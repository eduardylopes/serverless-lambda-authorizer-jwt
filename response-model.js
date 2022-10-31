class ResponseModel {
  constructor(data, statusCode = 500, message = 'Internal server error') {
    this.statusCode = statusCode;

    const body = {
      statusCode,
      message,
    };

    if (data) Object.assign(body, { data });

    this.body = JSON.stringify(body);

    this.headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    };
  }
}

module.exports = { ResponseModel };
