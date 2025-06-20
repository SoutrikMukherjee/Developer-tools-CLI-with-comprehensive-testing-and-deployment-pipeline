export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateProjectName(name: string): ValidationResult {
  // Check if name is empty
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      message: 'Project name cannot be empty'
    };
  }

  // Check length
  if (name.length > 214) {
    return {
      valid: false,
      message: 'Project name cannot be longer than 214 characters'
    };
  }

  // Check for invalid characters
  const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/;
  if (invalidChars.test(name)) {
    return {
      valid: false,
      message: 'Project name contains invalid characters'
    };
  }

  // Check if name starts with dot or underscore
  if (/^[._]/.test(name)) {
    return {
      valid: false,
      message: 'Project name cannot start with a dot or underscore'
    };
  }

  // Check for trailing dots
  if (/\.$/.test(name)) {
    return {
      valid: false,
      message: 'Project name cannot end with a dot'
    };
  }

  // Check for reserved names
  const reserved = [
    'node_modules', 'favicon.ico', 'con', 'prn', 'aux', 'nul',
    'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
    'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9'
  ];
  
  if (reserved.includes(name.toLowerCase())) {
    return {
      valid: false,
      message: 'Project name is a reserved name'
    };
  }

  // Check npm naming rules
  const npmNameRegex = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
  if (!npmNameRegex.test(name)) {
    return {
      valid: false,
      message: 'Project name must follow npm naming conventions'
    };
  }

  return { valid: true };
}

export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: 'Invalid email format'
    };
  }

  return { valid: true };
}

export function validateUrl(url: string): ValidationResult {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return {
      valid: false,
      message: 'Invalid URL format'
    };
  }
}

export function validateSemver(version: string): ValidationResult {
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  
  if (!semverRegex.test(version)) {
    return {
      valid: false,
      message: 'Invalid semantic version format'
    };
  }

  return { valid: true };
}
