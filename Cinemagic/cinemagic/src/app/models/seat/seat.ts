export class Seat {
  seatID: number;
  roomID: number;
  rowNumber: number;
  seatNumber: number;
  seatType: string
  bookingStatus: string;
  ticketID: number;
  personType: string;
  priceBrutto: number;
  priceNetto: number;
  selected: boolean;
  isBooked:boolean;


  constructor
  (
    seatID: number,
    roomID: number,
    rowNumber: number,
    seatNumber: number,
    seatType: string,
    bookingStatus: string
  ) {
    this.seatID = seatID;
    this.roomID = roomID;
    this.rowNumber = rowNumber;
    this.seatNumber = seatNumber;
    this.seatType = seatType
    this.bookingStatus = bookingStatus;
    this.ticketID = 0;
    this.personType = '';
    this.priceBrutto = 0;
    this.priceNetto = 0;
    this.selected = false;
    this.isBooked = false;
  }

}
