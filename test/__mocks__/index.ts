import { deepClone } from '../helpers/Object';

import * as UserEmployeeMock from './user_employee_mock.json';
import * as UserEmployerMock from './user_employer_mock.json';

const getUserEmployeeMock = () => deepClone(UserEmployeeMock);
const getUserEmployerMock = () => deepClone(UserEmployerMock);

export {
  UserEmployeeMock,
  getUserEmployeeMock,
  UserEmployerMock,
  getUserEmployerMock,
};
