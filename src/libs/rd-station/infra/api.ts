import axios from 'axios';

const rdStationApi = axios.create({
  baseURL: 'https://api.rd.services',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default rdStationApi;
