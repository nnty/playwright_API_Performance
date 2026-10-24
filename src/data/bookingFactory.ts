import { faker } from '@faker-js/faker';
import { Booking } from '../types/Booking';

export function generateBookingPayload(): Booking {
  // Generate a check-in date within the next 30 days
  const checkinDate = faker.date.soon({ days: 30 });
  
  // Generate a check-out date 1 to 14 days after check-in
  const checkoutDate = new Date(checkinDate);
  checkoutDate.setDate(checkoutDate.getDate() + faker.number.int({ min: 1, max: 14 }));

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 50, max: 2000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
      checkin: checkinDate.toISOString().split('T')[0],
      checkout: checkoutDate.toISOString().split('T')[0]
    },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late Checkout', 'Airport Pickup'])
  };
}