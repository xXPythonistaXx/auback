import axios from 'axios';

const learnWoldsApi = axios.create({
  baseURL: 'process.env.LEARN_WORLDS_API_URL',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default learnWoldsApi;
