module.exports = function response (resObject, code, ops = {}) {
  const httpCode = {
    200: {
      message: ops.resMessage ? ops.resMessage : "Ok"
    },
    201: {
      message: ops.resMessage ? ops.resMessage : "Data created or updated successfully"
    },
    400: {
      error: true,
      message: ops.resMessage ? ops.resMessage : "Bad request"
    },
    401: {
      error: true,
      message: ops.resMessage ? ops.resMessage : "You don't have access here."
    },
    403: {
      error: true,
      message: ops.resMessage ? ops.resMessage : "User unknown"
    },
    405: {
      error: true,
      message: `This route can only be access with ${ops.resMessage} method.`
    },
    406: {
      error: true,
      message: "This route can only be access by JSON ops."
    },
    409: {
      error: true,
      message: ops.resMessage ? ops.resMessage : "Conflict"
    },
    422: {
      error: true,
      message: ops.resMessage ? ops.resMessage : "Missing data in body"
    },
    502: {
      error: true,
      message: ops.resMessage ? ops.resMessage : "Error server, try later or contact us."
    }
  };

  if (ops.header) {
    Object.keys(ops.header).forEach(headerKey => resObject.append(headerKey, ops.header[headerKey]))
  }

  if (code === 204) {
    return resObject.status(code).end();
  }

  if (ops.newResponse) {
    httpCode[code] = {...ops.newResponse};
  }

  return resObject.status(code).json(httpCode[code]);
}
