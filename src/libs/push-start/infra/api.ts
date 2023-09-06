import axios from 'axios';

const pushStarCreateTestApi = axios.create({
  baseURL: 'process.env.PUSH_START_API_CREATE_TESTS_HML_URL',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default pushStarCreateTestApi;
