export type queriedReservationInfo = {
  reservationId: number,
  reservedBookInfoId: number,
  reservationDate: Date,
  endAt: Date,
  orderOfReservation: number,
  title: string,
  image: string,
}

export type reservationInfo = {
  reservationId: number,
  bookInfoId: number,
  createdAt: Date,
  endAt: Date,
  orderOfReservation: number,
  title: string,
  image: string,
}
