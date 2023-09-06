import { ObjectId } from 'bson';

export function parseIdStringToObjectId(array: any) {
  const isArray = Array.isArray(array);
  let newArray;
  if (isArray) {
    newArray = array.map((obj) => {
      let newObj;
      for (const key in obj) {
        const valueIsArray = Array.isArray(obj[key]);
        if (key.includes('_id')) {
          newObj = { [key]: { $eq: new ObjectId(obj[key]) } };
        } else if (typeof obj[key] === 'object' || valueIsArray) {
          newObj = { [key]: parseIdStringToObjectId(obj[key]) };
        } else {
          newObj = { [key]: obj[key] };
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return newObj;
    });
  } else if (typeof array === 'object') {
    for (const key in array) {
      const valueIsArray = Array.isArray(array[key]);
      if (key.includes('_id')) {
        newArray = { [key]: { $eq: new ObjectId(array[key]) } };
      } else if (typeof array[key] === 'object' || valueIsArray) {
        newArray = { [key]: parseIdStringToObjectId(array[key]) };
      } else {
        newArray = { [key]: array[key] };
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return newArray;
}
