import { body, validationResult } from 'express-validator';

const respondWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extracted = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extracted,
    });
  }

  return next();
};

const identifierRequirement = (req, res, next) => {
  if (!req.body.email && !req.body.username) {
    return res.status(400).json({
      success: false,
      message: 'Either email or username is required',
      errors: [],
    });
  }

  return respondWithValidationErrors(req, res, next);
};

const otpValidation = body('otp')
  .isString()
  .withMessage('OTP must be a string')
  .bail()
  .isLength({ min: 6, max: 6 })
  .withMessage('OTP must be exactly 6 characters')
  .bail()
  .matches(/^\d{6}$/)
  .withMessage('OTP must contain only digits')
  .trim();

const usernameValidation = body('username')
  .optional()
  .isString()
  .withMessage('Username must be a string')
  .bail()
  .isLength({ min: 3, max: 20 })
  .withMessage('Username must be between 3 and 20 characters long')
  .bail()
  .matches(/^[a-zA-Z0-9_]+$/)
  .withMessage('Username can contain letters, numbers, and underscore only')
  .trim();

const emailValidation = body('email')
  .optional()
  .isEmail()
  .withMessage('Invalid email address')
  .normalizeEmail();

const passwordValidation = body('password')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be between 8 and 128 characters long')
  .bail()
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .bail()
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .bail()
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number')
  .bail()
  .matches(/[^A-Za-z0-9]/)
  .withMessage('Password must contain at least one special character');

const fullNameValidation = body('fullName').custom((value) => {
  if (value == null) {
    throw new Error('fullName is required');
  }

  if (typeof value === 'string') {
    if (!value.trim()) {
      throw new Error('fullName must be a non-empty string');
    }

    return true;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('fullName must be a string or object');
  }

  if (typeof value.firstName !== 'string' || !value.firstName.trim()) {
    throw new Error('firstName must be a non-empty string');
  }

  if (typeof value.lastName !== 'string' || !value.lastName.trim()) {
    throw new Error('lastName must be a non-empty string');
  }

  return true;
});

const providerValidation = body('provider')
  .optional()
  .isIn(['email', 'google', 'github'])
  .withMessage("Provider must be 'email', 'google', or 'github'");

const normalizeOptionalIdentifier = (req, res, next) => {
  if (typeof req.body.username === 'string') {
    req.body.username = req.body.username.trim().toLowerCase();
  }

  return next();
};

const normalizeFullName = (req, res, next) => {
  const { fullName } = req.body;

  if (typeof fullName === 'string') {
    const trimmed = fullName.trim();
    const parts = trimmed.split(/\s+/).filter(Boolean);
    req.body.fullName = {
      firstName: parts[0] || trimmed,
      lastName: parts.slice(1).join(' ') || 'User',
    };
  } else if (fullName && typeof fullName === 'object') {
    req.body.fullName = {
      firstName: String(fullName.firstName).trim(),
      lastName: String(fullName.lastName).trim(),
    };
  }

  return next();
};

const normalizeProvider = (req, res, next) => {
  req.body.provider = req.body.provider || 'email';
  return next();
};

const requireEmailProviderPassword = (req, res, next) => {
  if (req.body.provider === 'email' && !req.body.password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required for email registration',
      errors: [],
    });
  }

  return respondWithValidationErrors(req, res, next);
};

const registerUserValidations = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  passwordValidation,
  fullNameValidation,
  usernameValidation,
  providerValidation,
  normalizeProvider,
  normalizeFullName,
  normalizeOptionalIdentifier,
  requireEmailProviderPassword,
];

const verifyOTPValidations = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  otpValidation,
  respondWithValidationErrors,
];

const resendOTPValidations = [
  emailValidation,
  usernameValidation,
  normalizeOptionalIdentifier,
  identifierRequirement,
];

const loginUserValidations = [
  emailValidation,
  usernameValidation,
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters long'),
  normalizeOptionalIdentifier,
  identifierRequirement,
];

const verifyLoginOTPValidations = [
  emailValidation,
  usernameValidation,
  otpValidation,
  normalizeOptionalIdentifier,
  identifierRequirement,
];

const forgotPasswordValidations = [
  emailValidation,
  usernameValidation,
  normalizeOptionalIdentifier,
  identifierRequirement,
];

const verifyForgotPasswordOTPValidations = [
  emailValidation,
  usernameValidation,
  otpValidation,
  normalizeOptionalIdentifier,
  identifierRequirement,
];

const resetPasswordValidations = [
  emailValidation,
  usernameValidation,
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters long'),
  normalizeOptionalIdentifier,
  identifierRequirement,
];

export {
  registerUserValidations,
  verifyOTPValidations,
  resendOTPValidations,
  loginUserValidations,
  verifyLoginOTPValidations,
  forgotPasswordValidations,
  verifyForgotPasswordOTPValidations,
  resetPasswordValidations,
};
