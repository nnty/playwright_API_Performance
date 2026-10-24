import { APIRequestContext, APIResponse } from '@playwright/test';

export class BookingApiClient {
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  // Method 1: POST to create
  async createBooking(payload: object): Promise<APIResponse> {
    return await this.request.post('/booking', {
      data: payload,
    });
  }

  // Method 2: GET a single booking by ID (Path Variable)
  async getBooking(bookingId: number): Promise<APIResponse> {
    return await this.request.get(`/booking/${bookingId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
  }

  // Method 3: GET array of bookings by query parameters (The missing method)
  async getBookings(params?: { [key: string]: string | number | boolean }): Promise<APIResponse> {
    return await this.request.get('/booking', {
      params: params,
      headers: {
        'Accept': 'application/json'
      }
    });
  }

  // Add these methods inside your BookingApiClient class

  async createToken(): Promise<string> {
    const response = await this.request.post('/auth', {
      data: {
        username: 'admin',
        password: 'password123'
      }
    });
    const body = await response.json();
    return body.token;
  }

  async deleteBooking(bookingId: number, token: string): Promise<APIResponse> {
    return await this.request.delete(`/booking/${bookingId}`, {
      headers: {
        'Cookie': `token=${token}`
      }
    });
  }

  async partialUpdateBooking(bookingId: number, token: string, payload: object): Promise<APIResponse> {
    return await this.request.patch(`/booking/${bookingId}`, {
      headers: {
        'Cookie': `token=${token}`,
        'Accept': 'application/json'
      },
      data: payload
    });
  }
} // <-- Ensure everything is above this final closing brace