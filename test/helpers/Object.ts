import * as lodash from 'lodash';

export const removeNullAndUndefinedAttributes = (data) =>
  lodash.pickBy(data, (obj) => obj);

export const removeNullAndUndefinedAttributesRecursively = (obj: any) => {
  const isArray = Array.isArray(obj);
  for (const k of Object.keys(obj)) {
    if (obj[k] === null || obj[k] === undefined) {
      if (isArray) {
        obj.splice(+k, 1);
      } else {
        delete obj[k];
      }
    } else if (typeof obj[k] === 'object') {
      removeNullAndUndefinedAttributesRecursively(obj[k]);
    }
    if (isArray && obj.length === +k) {
      removeNullAndUndefinedAttributesRecursively(obj);
    }
  }
  return obj;
};

export const removeUndefinedAttributesRecursively = (obj: any) => {
  const isArray = Array.isArray(obj);
  for (const k of Object.keys(obj)) {
    if (obj[k] === undefined) {
      if (isArray) {
        obj.splice(+k, 1);
      } else {
        delete obj[k];
      }
    } else if (typeof obj[k] === 'object' && obj[k] !== null) {
      removeUndefinedAttributesRecursively(obj[k]);
    }
    if (isArray && obj.length === +k) {
      removeUndefinedAttributesRecursively(obj);
    }
  }
  return obj;
};

export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
