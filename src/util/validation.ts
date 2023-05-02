export interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const isString = (value: any): value is string => typeof value === "string";
const isNumber = (value: any): value is number => typeof value === "number";

export const validate = (validatableInput: Validatable) => {
  const { value } = validatableInput;
  let isValid = true;

  if (validatableInput.required) {
    isValid = Boolean(value.toString().trim().length);
  }
  if (isValid && validatableInput.minLength != null && isString(value)) {
    isValid = value.length >= validatableInput.minLength;
  }
  if (isValid && validatableInput.maxLength != null && isString(value)) {
    isValid = value.length <= validatableInput.maxLength;
  }
  if (isValid && validatableInput.min != null && isNumber(value)) {
    isValid = value >= validatableInput.min;
  }
  if (isValid && validatableInput.max != null && isNumber(value)) {
    isValid = value <= validatableInput.max;
  }
  return isValid;
};