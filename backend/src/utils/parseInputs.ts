import { NewVerifyUserEntry, NewUserEntry, LoginUserEntry, NewSellerEntry, UpdateBasicDataEntry, UpdateEmailEntry, UpdatePasswordEntry, UpdateSellerDataEntry, NewReviewEntry, UpdateReviewEntry, NewProductEntry } from "../types/types";
import { isString, isDate, isNumber } from "./typeGuards";

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

const parseNumber = (num: unknown): number => {
  if (!num || typeof num !== 'number' || !isNumber(num)) {
    throw new Error("Invalid or undefined data: Number expected");
  }
  return num;
}

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

export const parseVerifyUserEntry = (user: unknown): NewVerifyUserEntry => {
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
};

export const parseLoginUserEntry = (user: unknown): LoginUserEntry => {
  if (!user || typeof user !== 'object') {
    throw new Error('Invalid User: Object expected');
  }
  if ('email' in user && 'password' in user) {
    return {
      email: parseString(user.email),
      password: parseString(user.password)
    }
  }
  throw new Error("Invalid Data: Some fields are missing");
};

export const parseNewSellerEntry = (seller: unknown): NewSellerEntry => {
  if (!seller || typeof seller !== 'object') {
    throw new Error('Invalid Seller: Object expected');
  }
  if ('userId' in seller && 'department' in seller && 'city' in seller && 'address' in seller) {
    let parsedSeller: NewSellerEntry = {
      userId: parseNumber(seller.userId),
      department: parseString(seller.department),
      city: parseString(seller.city),
      address: parseString(seller.address),
    }
    if ('floorOrApartment' in seller) {
      parsedSeller.floorOrApartment = parseString(seller.floorOrApartment);
    }
    if ('phoneNumber' in seller) {
      parsedSeller.phoneNumber = parseString(seller.phoneNumber);
    }
    return parsedSeller;
  }
  throw new Error("Invalid Data: Some fields are missing");
};

export const parseUpdateBasicDataEntry = (entry: unknown): UpdateBasicDataEntry => {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Invalid User: Object expected');
  }
  let parsedUpdate: UpdateBasicDataEntry = {};
  if ('username' in entry) {
    parsedUpdate.username = parseString(entry.username);
  }
  if ('firstName' in entry) {
    parsedUpdate.firstName = parseString(entry.firstName);
  }
  if ('lastName' in entry) {
    parsedUpdate.lastName = parseString(entry.lastName);
  }
  if ('birthDate' in entry) {
    parsedUpdate.birthDate = parseString(entry.birthDate);
  }
  return parsedUpdate;
};

export const parseEmailChangeEntry = (email: unknown): UpdateEmailEntry => {
  if (!email || typeof email !== 'object') {
    throw new Error('Invalid Data: Object expected');
  }
  if ('email' in email) {
    return {
      email: parseString(email.email)
    }
  }
  throw new Error('Undefined Email');
}

export const parsePasswordChangeEntry = (pass: unknown): UpdatePasswordEntry => {
  if (!pass || typeof pass !== 'object') {
    throw new Error('Invalid Data: Object expected');
  }
  if ('password' in pass) {
    return {
      password: parseString(pass.password)
    }
  }
  throw new Error('Undefined Password');
}

export const parseUpdateSellerDataEntry = (entry: unknown): UpdateSellerDataEntry => {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Invalid Data: Object expected');
  }
  let fieldsToUpdate: UpdateSellerDataEntry = {};
  if ('department' in entry) {
    fieldsToUpdate.department = parseString(entry.department);
  }
  if ('city' in entry) {
    fieldsToUpdate.city = parseString(entry.city);
  }
  if ('address' in entry) {
    fieldsToUpdate.address = parseString(entry.address);
  }
  if ('floorOrApartment' in entry) {
    if (typeof entry.floorOrApartment === 'string') {
      fieldsToUpdate.floorOrApartment = parseString(entry.floorOrApartment);
    }
    if (entry.floorOrApartment === null) {
      fieldsToUpdate.floorOrApartment = null;
    }
  }
  if ('phoneNumber' in entry) {
    fieldsToUpdate.phoneNumber = parseString(entry.phoneNumber);
  }
  return fieldsToUpdate;
}

export const parseNewReviewEntry = (entry: unknown): NewReviewEntry => {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Invalid Data: Object expected');
  }
  if ('userId' in entry && 'sellerId' in entry && 'rating' in entry) {
    let newReview: NewReviewEntry = {
      userId: parseNumber(entry.userId),
      sellerId: parseNumber(entry.sellerId),
      rating: parseNumber(entry.rating)
    };
    if ('comment' in entry) {
      newReview.comment = parseString(entry.comment);
    }
    return newReview;
  }
  throw new Error('Invalid Data: Some fields are missing');
}

export const parseUpdateReviewEntry = (entry: unknown): UpdateReviewEntry => {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Invalid Data: Object expected');
  }
  let updatedReview: UpdateReviewEntry = {};
  if ('comment' in entry) {
    updatedReview.comment = parseString(entry.comment);
  }
  if ('rating' in entry) {
    updatedReview.rating = parseNumber(entry.rating);
  }
  return updatedReview;
}

export const parseNewProductEntry = (entry: unknown): NewProductEntry => {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Invalid Data: Object expected');
  }
  if ('sellerId' in entry && 'name' in entry && 'price' in entry && 'currency' in entry && 'stock' in entry && 'location' in entry && 'categoryId' in entry) {
    let newProduct: NewProductEntry = {
      sellerId: parseNumber(entry.sellerId),
      name: parseString(entry.name),
      price: parseNumber(entry.price),
      currency: parseString(entry.currency),
      stock: parseNumber(entry.stock),
      location: parseString(entry.location),
      categoryId: parseNumber(entry.categoryId)
    };
    if ('offerPrice' in entry) {
      if (!('startOfferDate' in entry && 'endOfferDate' in entry)) {
        throw new Error('Invalid Fields: Must specify start and end date for offer');
      }
      newProduct.offerPrice = parseNumber(entry.offerPrice);
      newProduct.startOfferDate = parseDate(entry.startOfferDate);
      newProduct.endOfferDate = parseDate(entry.endOfferDate);
    }
    if ('description' in entry) {
      newProduct.description = parseString(entry.description);
    }
    return newProduct;
  }
  throw new Error('Invalid Data: Some fields are missing');
}