const formatValidationErrors = (errors) => {
  console.log('errors: ', errors);

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

// errors: [
//   {
//     value: 'admin',
//     msg: 'username already in use',
//     param: 'username',
//     location: 'body'
//   },
//   {
//     value: 'test@test.com',
//     msg: 'email already in use',
//     param: 'email',
//     location: 'body'
//   }
// ]
// }

/*
errors: [
  {
    "type": "/errors/incorrect-user-pass",
    "msg": "Incorrect username or password.",
    "status": 401,
    "param": "password",
    "value": "admin",
  }
]
 */
module.exports = {
  formatValidationErrors,
};
