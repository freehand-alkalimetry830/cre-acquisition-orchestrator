const fs = require('fs');
const path = require('path');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function typeMatches(expectedType, value) {
  if (expectedType === 'null') return value === null;
  if (expectedType === 'array') return Array.isArray(value);
  if (expectedType === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (expectedType === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (expectedType === 'integer') return Number.isInteger(value);
  if (expectedType === 'string') return typeof value === 'string';
  if (expectedType === 'boolean') return typeof value === 'boolean';
  return true;
}

function validateNode(schema, value, nodePath, errors) {
  if (!schema || typeof schema !== 'object') return;

  if (schema.type) {
    const allowedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    const ok = allowedTypes.some((t) => typeMatches(t, value));
    if (!ok) {
      errors.push(`${nodePath}: expected type ${allowedTypes.join('|')}`);
      return;
    }
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${nodePath}: expected one of ${schema.enum.join(', ')}`);
    return;
  }

  if (typeof value === 'string') {
    if (typeof schema.minLength === 'number' && value.length < schema.minLength) {
      errors.push(`${nodePath}: length must be >= ${schema.minLength}`);
    }
    if (typeof schema.maxLength === 'number' && value.length > schema.maxLength) {
      errors.push(`${nodePath}: length must be <= ${schema.maxLength}`);
    }
  }

  if (typeof value === 'number') {
    if (typeof schema.minimum === 'number' && value < schema.minimum) {
      errors.push(`${nodePath}: must be >= ${schema.minimum}`);
    }
    if (typeof schema.maximum === 'number' && value > schema.maximum) {
      errors.push(`${nodePath}: must be <= ${schema.maximum}`);
    }
  }

  if (Array.isArray(value)) {
    if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
      errors.push(`${nodePath}: items must be >= ${schema.minItems}`);
    }
    if (typeof schema.maxItems === 'number' && value.length > schema.maxItems) {
      errors.push(`${nodePath}: items must be <= ${schema.maxItems}`);
    }
    if (schema.items) {
      value.forEach((item, index) => {
        validateNode(schema.items, item, `${nodePath}[${index}]`, errors);
      });
    }
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const required = Array.isArray(schema.required) ? schema.required : [];
    required.forEach((key) => {
      if (!(key in value)) {
        errors.push(`${nodePath}.${key}: missing required field`);
      }
    });

    if (schema.properties && typeof schema.properties === 'object') {
      Object.entries(schema.properties).forEach(([key, propertySchema]) => {
        if (key in value) {
          validateNode(propertySchema, value[key], `${nodePath}.${key}`, errors);
        }
      });
    }
  }
}

function validateData(schema, data, rootName = 'data') {
  const errors = [];
  validateNode(schema, data, rootName, errors);
  return {
    valid: errors.length === 0,
    errors
  };
}

function validateFile(schemaPath, data, rootName = 'data') {
  const schema = readJson(schemaPath);
  return validateData(schema, data, rootName);
}

function assertValid(schemaPath, data, rootName = 'data') {
  const result = validateFile(schemaPath, data, rootName);
  if (!result.valid) {
    const rel = path.relative(process.cwd(), schemaPath);
    const details = result.errors.map((e) => `  - ${e}`).join('\n');
    throw new Error(`Schema validation failed (${rel})\n${details}`);
  }
}

module.exports = {
  validateData,
  validateFile,
  assertValid,
  readJson
};
