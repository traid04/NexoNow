export const isString = (str: unknown): str is string => {
  return typeof str === "string" || str instanceof String;
};

export const isDate = (date: string): boolean => {
  return !isNaN(Date.parse(date));
}

export const isObject = (obj: unknown): obj is object => {
  return typeof obj === 'object';
}

export const isNumber = (num: unknown): num is number => {
  return typeof num === 'number';
}