export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds: string;
}

// The POST response wraps the booking, the GET response does not
export interface BookingResponse {
  bookingid: number;
  booking: Booking;
}