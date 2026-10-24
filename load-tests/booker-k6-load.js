import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '5s'
};

// Pull the URL from the environment, or use the default sandbox
const BASE_URL = __ENV.BASE_URL || 'https://restful-booker.herokuapp.com';

export default function () {
  const authPayload = JSON.stringify({ username: 'admin', password: 'password123' });
  const authHeaders = { headers: { 'Content-Type': 'application/json' } };
  
  // Use template literals to inject the dynamic base URL
  const authRes = http.post(`${BASE_URL}/auth`, authPayload, authHeaders);
  check(authRes, { 'Auth status is 200': (r) => r.status === 200 });

  const getRes = http.get(`${BASE_URL}/booking`);
  check(getRes, { 'GET status is 200': (r) => r.status === 200 });

  sleep(1);
}