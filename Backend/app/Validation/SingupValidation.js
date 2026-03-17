const joi = require("joi");

const SignupValidation = joi.object({
    name: joi.string().min(3).max(30).required(),
   email: joi
  .string()
  .email()
  .pattern(/@(gmail\.com|yopmail\.com)$/)
  .required()
  .messages({
    "string.pattern.base": "Please enter a valid Gmail address",
    "string.email": "Please enter a valid Gmail address",
    "string.empty": "Email is required"
  }),
    password: joi.string().min(6).required()
});

const LoginValidation = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
});

const EmailValidation = joi.object({
    email: joi.string().email().required()
});

const acceptInviteValidation = joi.object({
    senderto: joi.string().required(),
    notificationId: joi.string().required(),
    status: joi.string().valid("accepted", "rejected").required()
});

module.exports = { SignupValidation, LoginValidation, EmailValidation, acceptInviteValidation };