import axios from 'axios';
import { API_BASE_URL } from '../config/api';
// Authentication requests must not carry an old access token.
export default axios.create({ baseURL: API_BASE_URL, timeout: 10000 });
