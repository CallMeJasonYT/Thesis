export function validateRequestBody(body, requiredFields) {
  const missingFields = requiredFields.filter((field) => !body[field]);

  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Missing required field(s): ${missingFields.join(", ")}`,
    };
  }

  return { isValid: true };
}
