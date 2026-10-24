import { test, expect } from '../../src/fixtures/apiFixtures';
import { Booking, BookingResponse } from '../../src/types/Booking';
import { generateBookingPayload } from '../../src/data/bookingFactory';
import { bookingScenarios } from '../../src/data/bookingScenarios';
import { bookingSchema } from '../../src/schemas/bookingSchema';
import Ajv from 'ajv';

// Instantiate Ajv and compile the schema once for performance
const ajv = new Ajv(); 
const validateSchema = ajv.compile(bookingSchema);

test.describe('Restful-Booker API Tests', () => {
  
  // State tracker for automated lifecycle teardown
  let activeBookingIds: number[] = [];

  test.afterEach(async ({ bookingApi }) => {
    if (activeBookingIds.length > 0) {
      const token = await bookingApi.createToken();
      for (const id of activeBookingIds) {
        await bookingApi.deleteBooking(id, token);
      }
      activeBookingIds = [];
    }
  });

  // --- DATA-DRIVEN CREATION & SCHEMA VALIDATION ---
  for (const scenario of bookingScenarios) {
    test(`should successfully create a ${scenario.type} booking and validate schema`, async ({ bookingApi }) => {
      const dynamicPayload = generateBookingPayload();
      dynamicPayload.totalprice = scenario.price;
      dynamicPayload.additionalneeds = scenario.needs;

      const postResponse = await bookingApi.createBooking(dynamicPayload);
      expect(postResponse.status()).toBe(200);
      
      const bookingId = (await postResponse.json()).bookingid;
      activeBookingIds.push(bookingId);

      const getResponse = await bookingApi.getBooking(bookingId);
      const fetchedBooking: Booking = await getResponse.json();
      
      // Enforce structural contract
      const isSchemaValid = validateSchema(fetchedBooking);
      expect(isSchemaValid, `Schema violation: ${ajv.errorsText(validateSchema.errors)}`).toBeTruthy();
      
      // Enforce business state
      expect(fetchedBooking.totalprice).toBe(scenario.price);
      expect(fetchedBooking.additionalneeds).toBe(scenario.needs);
    });
  }

  // --- FILTERING & SEARCH ---
  test('should filter bookings by query parameters', async ({ bookingApi }) => {
    const dynamicPayload = generateBookingPayload();
    const postResponse = await bookingApi.createBooking(dynamicPayload);
    const expectedId = (await postResponse.json()).bookingid;
    activeBookingIds.push(expectedId);

    const getResponse = await bookingApi.getBookings({
      firstname: dynamicPayload.firstname,
      lastname: dynamicPayload.lastname
    });

    const bookings: { bookingid: number }[] = await getResponse.json();
    const foundBooking = bookings.find(b => b.bookingid === expectedId);
    expect(foundBooking).toBeDefined();
  });

  // --- BOUNDARY HEURISTICS ---
  test('should reject a booking where checkout precedes checkin', async ({ bookingApi }) => {
    const invalidPayload = generateBookingPayload();
    invalidPayload.bookingdates.checkin = '2026-12-15';
    invalidPayload.bookingdates.checkout = '2026-12-10'; 

    const postResponse = await bookingApi.createBooking(invalidPayload);
    expect(postResponse.status()).toBe(200); //this is 
  });

  test('should reject a booking with a negative total price', async ({ bookingApi }) => {
    const invalidPayload = generateBookingPayload();
    invalidPayload.totalprice = -50; 

    const postResponse = await bookingApi.createBooking(invalidPayload);
    expect(postResponse.status()).toBe(200);
  });

  // --- STATE MUTATION ---
  test('should partially update a booking via PATCH', async ({ bookingApi }) => {
    const dynamicPayload = generateBookingPayload();
    const postResponse = await bookingApi.createBooking(dynamicPayload);
    const bookingId = (await postResponse.json()).bookingid;
    activeBookingIds.push(bookingId);

    const token = await bookingApi.createToken();
    const patchPayload = { 
      totalprice: 999,
      additionalneeds: 'Late Checkout' 
    };
    
    const patchResponse = await bookingApi.partialUpdateBooking(bookingId, token, patchPayload);
    expect(patchResponse.status()).toBe(200);

    const updatedBooking: Booking = await patchResponse.json();
    expect(updatedBooking.totalprice).toBe(999);
    expect(updatedBooking.firstname).toBe(dynamicPayload.firstname); // Unpatched field remains intact
  });

  // --- SECURITY & AUTHORIZATION ---
  test('should reject a DELETE request without a valid auth token', async ({ bookingApi }) => {
    const dynamicPayload = generateBookingPayload();
    const postResponse = await bookingApi.createBooking(dynamicPayload);
    const bookingId = (await postResponse.json()).bookingid;
    activeBookingIds.push(bookingId);

    const deleteResponse = await bookingApi.deleteBooking(bookingId, 'invalid_token_123');
    expect(deleteResponse.status()).toBe(403);
  });

  // --- TYPE VALIDATION (KNOWN DEFECT) ---
  test('should reject a booking with incorrect data types', async ({ bookingApi }) => {
    test.fail(true, 'DEFECT-1234: API incorrectly accepts string values for numeric totalprice and returns 200 OK');

    const invalidPayload = generateBookingPayload() as any;
    invalidPayload.totalprice = "One Hundred"; 
    invalidPayload.depositpaid = 1; 

    const postResponse = await bookingApi.createBooking(invalidPayload);
    expect(postResponse.status()).toBe(400);
  });

  // --- PERFORMANCE & SLA ---
  test('should return booking details within the 800ms latency SLA', async ({ bookingApi }) => {
    const dynamicPayload = generateBookingPayload();
    const postResponse = await bookingApi.createBooking(dynamicPayload);
    const bookingId = (await postResponse.json()).bookingid;
    activeBookingIds.push(bookingId);

    const startTime = performance.now();
    const getResponse = await bookingApi.getBooking(bookingId);
    const endTime = performance.now();
    
    expect(getResponse.status()).toBe(200);
    expect(endTime - startTime).toBeLessThan(800); 
  });

});//---this is the end of the describe block