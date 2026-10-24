export const bookingSchema = {
  type: 'object',
  properties: {
    firstname: { type: 'string' },
    lastname: { type: 'string' },
    totalprice: { type: 'number' },
    depositpaid: { type: 'boolean' },
    bookingdates: {
      type: 'object',
      properties: {
        checkin: { type: 'string' }, 
        checkout: { type: 'string' }
      },
      required: ['checkin', 'checkout'],
      additionalProperties: false
    },
    additionalneeds: { type: 'string' }
  },
  required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
  additionalProperties: false
};