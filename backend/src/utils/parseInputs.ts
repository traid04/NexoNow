import { NewVerifyUserEntry, NewUserEntry } from "../types/types";
import { isString, isDate } from "./typeGuards";

const parseString = (str: unknown): string => {
  if (!str || !isString(str)) {
    throw new Error("Invalid or undefined data: String expected");
  }
  return str;
};

const parseDate = (date: unknown): string => {
  if (!date || !isString(date) || !isDate(date)) {
    throw new Error("Invalid or undefined data: Date expected");
  }
  return date;
};

export const parseNewUserEntry = (user: unknown): NewUserEntry => {
  if (!user || typeof user !== "object") {
    throw new Error("Invalid User: Object expected");
  }
  if ("username" in user && "firstName" in user && "lastName" in user && "birthDate" in user && "email" in user && "password" in user) {
    return {
      username: parseString(user.username),
      firstName: parseString(user.firstName),
      lastName: parseString(user.lastName),
      birthDate: parseDate(user.birthDate),
      email: parseString(user.email),
      password: parseString(user.password),
    };
  }
  throw new Error("Invalid Data: Some fields are missing");
};

export const parseLoginUserEntry = (user: unknown): NewVerifyUserEntry => {
  if (!user || typeof user !== 'object') {
    throw new Error('Invalid User: Object expected');
  }
  if ('username' in user && 'email' in user && 'password' in user) {
    return {
      username: parseString(user.username),
      email: parseString(user.email),
      password: parseString(user.password)
    }
  }
  throw new Error("Invalid Data: Some fields are missing");
}
