import { test as base } from '@playwright/test';
import { BookingApiClient } from '../api/BookingApiClient';


type AppFixtures = {
  bookingApi: BookingApiClient;
};

export const test = base.extend<AppFixtures>({
  
  // Fixture 1
  bookingApi: async ({ request }, use) => {
    const client = new BookingApiClient(request);
    await use(client);
  }, // <--- THIS COMMA IS REQUIRED

  
}); // <--- MUST CLOSE THE EXTEND BLOCK

export { expect } from '@playwright/test';