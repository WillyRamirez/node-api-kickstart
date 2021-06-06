const formatValidationErrors = (errors) => {
  let formattedErrors = [];
  errors.forEach(e => {
    formattedErrors.push({
      type: "/errors/validation-failed",
      msg: e.msg,
      param: e.param,
      value: e.value,
    });
  })

  return formattedErrors;
}

const formatError = (e) => {
  let formattedErrors = {
    type: "/errors/request-failed",
    msg: e.msg,
    param: e.param,
  };

  return formattedErrors;
}

module.exports = {
  formatValidationErrors,
  formatError,
};
