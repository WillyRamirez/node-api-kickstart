const { body } = require('express-validator');

const getValidationRules = (alreadyExists) => ({
    user: [
      body('first_name')
        .exists({checkFalsy: true})
        .isLength({ min: 2, max: 30 })
        .withMessage('must be between 2 and 30 characters'),
      body('last_name')
        .exists({checkFalsy: true})
        .isLength({ min: 2, max: 30 })
        .withMessage('must be between 2 and 30 characters'),
      body('username')
        .exists({checkFalsy: true})
        .withMessage('Username cannot be empty')
        .isLength({ min: 2, max: 20 })
        .withMessage('must be between 2 and 20 characters')
        .custom(async (value, { req }) => await alreadyExists('username', value))
        .withMessage('Username is already taken'),
      body('email')
        .exists({checkFalsy: true})
        .withMessage('Email cannot be empty')
        .isEmail()
        .withMessage('Email is in an incorrect format')
        .custom(async (value, { req }) => await alreadyExists('email', value))
        .withMessage('Email address is already taken'),
      body('password')
        .exists({checkFalsy: true})
        .bail()
        .withMessage('Password cannot be empty')
        .isLength({ min: 5 })
        .withMessage('must be at least 5 chars long')
        .matches(/\d/)
        .withMessage('must contain a number'),
    ],
  login: [
    body('email')
      .exists({checkFalsy: true})
      .withMessage('Email cannot be empty')
      .isEmail()
      .withMessage('Please enter a correctly formatted E-mail address'),
    body('password')
      .exists({checkFalsy: true})
      .withMessage('Password cannot be empty')
  ]
});

module.exports = getValidationRules;
