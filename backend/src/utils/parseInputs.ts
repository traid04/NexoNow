import { NewVerifyUserEntry, NewUserEntry, LoginUserEntry, NewSellerEntry, UpdateBasicDataEntry, UpdateEmailEntry, UpdatePasswordEntry, UpdateSellerDataEntry, NewReviewEntry, UpdateReviewEntry, NewProductEntry, QueryParams, ProductCondition, ProductCurrency, OrderQuery, UpdateProductEntry, CreateOfferEntry, NewNotificationEntry, NotificationType } from "../types/types";
import { isString, isDate, isNumber } from "./typeGuards";

export const parseString = (str: unknown): string => {
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

export const parseNumber = (num: unknown): number => {
  if (num === undefined || typeof num !== 'number' || !isNumber(num)) {
    throw new Error("Invalid or undefined data: Number expected");
  }
  return num;
}

const parseProductCondition = (str: unknown): ProductCondition => {
  const parsedCondition = parseString(str).toLowerCase();
  if (parsedCondition === 'new' || parsedCondition === 'used' || parsedCondition === 'refurbished') {
    return parsedCondition as ProductCondition;
  }
  throw new Error("Invalid Data: Invalid Product Condition, must be new, used or refurbished");
}

const parseProductCurrency = (str: unknown): ProductCurrency => {
  const parsedCurrency = parseString(str).toUpperCase();
  if (parsedCurrency === 'UYU' || parsedCurrency === 'USD') {
    return parsedCurrency as ProductCurrency;
  }
  throw new Error("Invalid Data: Invalid Product Currency, must be UYU or USD");
}

const parseProductOrderQuery = (str: unknown): OrderQuery => {
  const parsedQuery = parseString(str).toLowerCase();
  if (parsedQuery === "lowerprice" || parsedQuery === "higherprice" || parsedQuery === "mostrelevant") {
    return parsedQuery as OrderQuery
  }
  throw new Error("Invalid Data: Invalid Order Query,")
}

const parseNotificationType = (str: unknown): NotificationType => {
  const parsedType = parseString(str).toLowerCase();
  if (parsedType === "info" || parsedType === "success" || parsedType === "warning" || parsedType === "error" || parsedType === "alert" || parsedType === "system" || parsedType === "message") {
    return parsedType as NotificationType;
  }
  throw new Error("Invalid Data: Invalid Notification Type");
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
  if ('sellerId' in entry && 'name' in entry && 'price' in entry && 'currency' in entry && 'priceInUyu' in entry && 'stock' in entry && 'location' in entry && 'categoryId' in entry && 'condition' in entry) {
    let newProduct: NewProductEntry = {
      sellerId: parseNumber(entry.sellerId),
      name: parseString(entry.name),
      price: parseNumber(entry.price),
      priceInUyu: parseNumber(entry.priceInUyu),
      currency: parseProductCurrency(entry.currency),
      stock: parseNumber(entry.stock),
      location: parseString(entry.location),
      categoryId: parseNumber(entry.categoryId),
      condition: parseProductCondition(entry.condition)
    };
    if ('description' in entry) {
      newProduct.description = parseString(entry.description);
    }
    return newProduct;
  }
  throw new Error('Invalid Data: Some fields are missing');
}

export const parseQueryParams = (params: unknown): QueryParams => {
  let queryParams: QueryParams = { offset: 0, limit: 20 };
  if (!params || typeof params !== 'object') {
    throw new Error('Invalid Data: Object expected');
  }
  if ('offset' in params) {
    queryParams.offset = parseNumber(Number(params.offset));
  }
  if ('limit' in params) {
    queryParams.limit = parseNumber(Number(params.limit));
  }
  if ('location' in params) {
    queryParams.location = parseString(params.location);
  }
  if ('condition' in params) {
    queryParams.condition = parseProductCondition(params.condition);
  }
  if ('minPrice' in params) {
    queryParams.minPrice = parseNumber(Number(params.minPrice));
  }
  if ('maxPrice' in params) {
    queryParams.maxPrice = parseNumber(Number(params.maxPrice));
  }
  if ('order' in params) {
    queryParams.order = parseProductOrderQuery(params.order);
  }
  if ('search' in params) {
    queryParams.search = parseString(params.search);
  }
  return queryParams;
}

export const parseProductUpdateEntry = (entry: unknown): UpdateProductEntry => {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Invalid Data: Object expected');
  }
  let updateObject: UpdateProductEntry = {};
  if ('name' in entry) {
    updateObject.name = parseString(entry.name);
  }
  if ('price' in entry) {
    updateObject.price = parseNumber(entry.price);
  }
  if ('currency' in entry) {
    updateObject.currency = parseProductCurrency(entry.currency);
  }
  if ('description' in entry) {
    updateObject.description = parseString(entry.description);
  }
  if ('stock' in entry) {
    updateObject.stock = parseNumber(entry.stock);
  }
  if ('location' in entry) {
    updateObject.location = parseString(entry.location);
  }
  if ('categoryId' in entry) {
    updateObject.categoryId = parseNumber(entry.categoryId);
  }
  if ('condition' in entry) {
    updateObject.condition = parseProductCondition(entry.condition);
  }
  return updateObject;
}

export const parseCreateOfferEntry = (entry: unknown): CreateOfferEntry => {
  if (!entry || typeof entry !== "object") {
    throw new Error("Invalid Data: Object expected");
  }
  if (!('offerPrice' in entry && 'startOfferDate' in entry && 'endOfferDate' in entry)) {
    throw new Error("Invalid Data: Some fields are missing");
  }
  return {
    offerPrice: parseNumber(entry.offerPrice),
    startOfferDate: parseString(entry.startOfferDate),
    endOfferDate: parseString(entry.endOfferDate)
  }
}

export const parseNewNotificationEntry = (entry: unknown): NewNotificationEntry => {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Invalid Data: Object expected');
  }
  if ('text' in entry && 'type' in entry) {
    return {
      text: parseString(entry.text),
      type: parseNotificationType(entry.type)
    }
  }
  throw new Error('Invalid Data: Some Fields are missing');
}