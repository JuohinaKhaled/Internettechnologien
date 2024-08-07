export class Ticket {
  ticketID: number;
  roomType: string;
  personType: string;
  seatType: string;
  priceNetto: number;
  priceBrutto: number;

  constructor
  (
    ticketID: number,
    roomType: string,
    personType: string,
    seatType: string,
    priceNetto: number,
    priceBrutto: number
  ) {
    this.ticketID = ticketID;
    this.roomType = roomType;
    this.personType = personType;
    this.seatType = seatType;
    this.priceNetto = priceNetto;
    this.priceBrutto = priceBrutto;
  }

}
