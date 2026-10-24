import { test, expect, request } from '@playwright/test';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { BookingApiClient } from '../../src/api/BookingApiClient';
import path from 'path';

// Define the Pact mock server configuration
const provider = new PactV3({
  consumer: 'Playwright-Test-Automation-Client',
  provider: 'Restful-Booker-API',
  dir: path.resolve(process.cwd(), 'pacts'),
});

test.describe('Booking API Consumer Contract', () => {
  
  test('generates a contract for retrieving a booking', async () => {
    
    // 1. Define the exact interaction the consumer expects
    provider
      .uponReceiving('a request for an existing booking')
      .withRequest({
        method: 'GET',
        path: '/booking/1',
        headers: { Accept: 'application/json' }
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          firstname: MatchersV3.string('Jane'),
          lastname: MatchersV3.string('Doe'),
          totalprice: MatchersV3.integer(150),
          depositpaid: MatchersV3.boolean(true),
          bookingdates: {
            checkin: MatchersV3.regex('^[0-9]{4}-[0-9]{2}-[0-9]{2}$', '2026-11-01'),
            checkout: MatchersV3.regex('^[0-9]{4}-[0-9]{2}-[0-9]{2}$', '2026-11-05')
          }
        }
      });

    // 2. Execute the test against the Pact mock server
    await provider.executeTest(async (mockServer) => {
      // Initialize a Playwright request context pointing at the local Pact server
      const reqContext = await request.newContext({ baseURL: mockServer.url });
      const client = new BookingApiClient(reqContext);

      // Trigger the client method
      const response = await client.getBooking(1);
      const data = await response.json();

      // Assert the client successfully parsed the mock response
      expect(response.status()).toBe(200);
      expect(data.firstname).toBe('Jane');
    });
  });
  
});