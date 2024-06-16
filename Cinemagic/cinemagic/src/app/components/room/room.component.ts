import {Component, OnInit} from '@angular/core';
import {RoomService} from "../../services/room/room.service";
import {ActivatedRoute} from "@angular/router";
import {MovieService} from "../../services/movie/movie.service";
import {TicketService} from "../../services/ticket/ticket.service";
import {Room} from "../../models/room/room";
import {of, switchMap} from "rxjs";
import {catchError, tap} from "rxjs/operators";
import {SocketService} from "../../services/socket/socket.service";
import {EventService} from "../../services/event/event.service";


@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
})
export class RoomComponent implements OnInit {

  modal: any;
  room?: Room;
  event: any;
  movie: any;
  seats: any[] = [];
  groupedSeats: any[][] = [];
  eventID: number = 0;
  movieID: number = 0;
  adultCounterValue: number = 0;
  studentCounterValue: number = 0;
  childCounterValue: number = 0;
  totalPriceBrutto: number = 0;
  totalPriceNetto: number = 0;
  selectedSeats: any[] = [];
  otherSelectedSeats: any[] = [];
  tickets: any[] = [];


  constructor(private roomService: RoomService,
              private route: ActivatedRoute,
              private movieService: MovieService,
              private ticketService: TicketService,
              private socketService: SocketService,
              private eventService: EventService) {
  }

  ngOnInit(): void {
    this.getModal();
    this.getEventID();
    this.getMovieID();
    this.getRoom();
    this.getSeats();
    this.getMovie();
    this.getEvent();
    this.getOtherClientSeats();
    this.getCurrentClientSeats();
    this.getSeatsReleasedByOtherClient();
    this.setCounter();
  }

  getModal() {
    this.modal = document.getElementById('maxSeatsModal');
  }

  getEventID() {
    this.eventID = +this.route.snapshot.paramMap.get('eventID')!;
    console.log('Movie ID:', this.eventID);

    if (!this.eventID) {
      console.error('No event data found in state.');
    } else {
      console.log('Event data loaded:', this.eventID);
    }
  }

  setCounter() {
    this.socketService.getCurrentCount('Adult', this.eventID).subscribe(
      startValue => {
        this.adultCounterValue = startValue;
      },
      error => {
        console.error("Error loading counter:", error);
      });
    this.socketService.getCurrentCount('Child', this.eventID).subscribe(
      startValue => {
        this.childCounterValue = startValue;
      },
      error => {
        console.error("Error loading counter:", error);
      });
    this.socketService.getCurrentCount('Student', this.eventID).subscribe(
      startValue => {
        this.studentCounterValue = startValue;
      },
      error => {
        console.error("Error loading counter:", error);
      });
  }

  getOtherClientSeats() {
    this.socketService.getOtherClientSeat(this.eventID).subscribe(
      (data) => {
        this.otherSelectedSeats = data;
        this.otherSelectedSeats.forEach(seat => {
          const seatToUpdate = this.seats.find(s => s.Reihennummer === seat.Reihennummer && s.Sitznummer === seat.Sitznummer);
          if (seatToUpdate) {
            seatToUpdate.Buchungsstatus = 'Occupied';
          }
        });
      },
      (error) => {
        console.error("Error loading seats:", error);
      });
  }

  getSeatsReleasedByOtherClient() {
    this.socketService.getSeatReleasedByOtherClient(this.eventID).subscribe(
      (seat) => {
        const seatToUpdate = this.seats.find(s => s.Reihennummer === seat.Reihennummer && s.Sitznummer === seat.Sitznummer);
        if (seatToUpdate) {
          seatToUpdate.Buchungsstatus = 'Free';
        }
      },
      (error) => {
        console.error("Error loading released seats:", error);
      }
    );
  }

  getCurrentClientSeats() {
    this.socketService.getCurrentClientSeat(this.eventID).subscribe(
      (data) => {
        this.selectedSeats = data;
        this.selectedSeats.forEach(seat => {
          const seatToSelect = this.seats.find(s => s.Reihennummer === seat.Reihennummer && s.Sitznummer === seat.Sitznummer);
          if (seatToSelect) {
            seatToSelect.selected = true;
          }
        });
        this.updateTotalPrice();
        console.log("Seats loaded:", this.selectedSeats);
      },
      (error) => {
        console.error("Error loading seats:", error);
      });
  }


  getMovieID() {
    this.movieID = +this.route.snapshot.paramMap.get('movieID')!;
    console.log('Movie ID:', this.movieID);

    if (!this.movieID) {
      console.error('No movie data found in state.');
    } else {
      console.log('Event data loaded:', this.movieID);
    }
  }

  getEvent() {
    this.eventService.getEvent(this.eventID).subscribe(
      (data) => {
        this.event = data;
        console.log("Movie loaded:", this.movie);
      },
      (error) => {
        console.error("Error fetching movie details:", error);
      }
    );
  }

  getRoom() {
    this.roomService.getRoom(this.eventID).pipe(
      tap((data) => {
        this.room = new Room(data[0].roomID, data[0].roomName, data[0].roomCapacity, data[0].roomType);
        console.log("Room loaded:", this.room);
      }), switchMap(() => {
        if (this.room) {
          return this.ticketService.getTickets(this.room.roomType).pipe(
            tap((data) => {
              this.tickets = data;
              console.log('Ticket data loaded:', this.tickets);
            })
          );
        } else {
          return of([]);
        }
      }),
      catchError(error => {
        console.error("Error loading room:", error);
        return of([]);
      })
    ).subscribe();
  }

  getSeats() {
    this.roomService.getSeats(this.eventID).subscribe(
      (data) => {
        this.seats = data;
        console.log("Seats loaded:", this.seats);
        this.groupSeatsByRow();
      },
      (error) => {
        console.error("Error loading seats:", error);
      }
    );
  }


  groupSeatsByRow(): void {
    let rowIndex = 0;
    this.groupedSeats = [];
    for (let i = 0; i < this.seats.length; i += 10) {
      this.groupedSeats[rowIndex] = this.seats.slice(i, i + 10);
      rowIndex++;
    }
  }

  getMovie() {
    this.movieService.getMovieDetails(this.movieID).subscribe(
      (data) => {
        this.movie = data;
        console.log("Movie loaded:", this.movie);
      },
      (error) => {
        console.error("Error fetching movie details:", error);
      }
    );
  }

  onCounterValueChanged(type: string, value: number) {
    console.log(type, value);

    switch (type) {
      case 'Adult':
        console.log('Erwachsen:' + this.adultCounterValue, value);
        this.adultCounterValue = value;
        break;
      case 'Student':
        console.log('Student:' + this.studentCounterValue, value);
        this.studentCounterValue = value;
        break;
      case 'Child':
        console.log('Child:' + this.childCounterValue, value);
        this.childCounterValue = value;
        break;
      default:
        break;
    }
    this.updateSelectedSeats(type);
  }

  updateSelectedSeats(personType: string) {
    console.log("HIEEEEER:", this.otherSelectedSeats, this.selectedSeats)
    const totalSeats = this.getTotalCount();
    if (this.selectedSeats.length > totalSeats) {
      console.log('WHAT: :D', this.selectedSeats.length, this.selectedSeats);
      const seatIndex = this.selectedSeats.findIndex(s => s.personType === personType);
      console.log("SEATINDEX:", seatIndex);
      if (seatIndex !== -1) {
        const removedSeat = this.selectedSeats.splice(seatIndex, 1)[0];
        console.log("RemovedSeat", removedSeat);
        const seatToDeselect = this.seats.find(s => s.Reihennummer === removedSeat.Reihennummer && s.Sitznummer === removedSeat.Sitznummer);
        console.log("SeatToDeselect", seatToDeselect);
        this.socketService.releaseSeat(seatToDeselect, this.eventID);
        if (seatToDeselect) {
          seatToDeselect.selected = false;
        }
      }
    } else {
      const selectedSeatsOfType = this.selectedSeats.filter(s => s.personType === personType).length;
      // Überprüfe, ob die Anzahl der ausgewählten Sitze kleiner als der entsprechende Counter ist

      if (selectedSeatsOfType > this.getCounterValue(personType)) {
        const index = this.selectedSeats.findIndex(s => s.personType === personType);

        console.log(index);
        if (index !== -1) {
          const oldSeat = this.selectedSeats.splice(index, 1)[0];
          const newSeat = this.seats.find(s => s.Reihennummer === oldSeat.Reihennummer && s.Sitznummer === oldSeat.Sitznummer);

          const newPersonType = this.getPersonType();
          const newPriceBrutto = this.getBruttoPrice(newPersonType, newSeat);
          const newPriceNetto = this.getNettoPrice(newPersonType, newSeat);

          const updatedSeat = {
            ...oldSeat,
            personType: newPersonType,
            priceBrutto: newPriceBrutto,
            priceNetto: newPriceNetto
          };
          console.log('Alter Sitz:', oldSeat);
          console.log('Neuer Sitz: ', updatedSeat);
          this.selectedSeats.splice(index, 0, updatedSeat);
          this.socketService.updateSeat(updatedSeat, this.eventID);
        }
      }
    }
  }

  getCounterValue(personType: string) {
    let count: number = 0;
    switch (personType) {
      case 'Adult':
        count = this.adultCounterValue;
        break;
      case 'Student':
        count = this.studentCounterValue;
        break;
      case 'Child':
        count = this.childCounterValue;
        break;
      default:
        break;
    }
    return count;
  }

  getTotalCount(): number {
    return this.adultCounterValue + this.studentCounterValue + this.childCounterValue;
  }

  canSelectMoreSeats(): boolean {
    return this.selectedSeats.length < this.getTotalCount();
  }

  getPersonType(): string {
    let personType = '';
    let adult = this.selectedSeats.filter(pt => pt.personType === 'Adult').length;
    let student = this.selectedSeats.filter(pt => pt.personType === 'Student').length;
    let child = this.selectedSeats.filter(pt => pt.personType === 'Child').length;

    if (adult < this.adultCounterValue) {
      personType = 'Adult';
    } else if (student < this.studentCounterValue) {
      personType = 'Student';
    } else if (child < this.childCounterValue) {
      personType = 'Child';
    }

    return personType;
  }

  getBruttoPrice(personType: string, seat: any): number {
    let priceData = this.tickets.find(t => t.Tickettyp === personType && t.Sitztyp === seat.Sitztyp);
    console.log('Ausgewähltes Ticket', priceData);
    if (priceData) {
      console.log('Preis: ', priceData.PreisBrutto)
      return priceData.PreisBrutto;
    } else {
      return 0;
    }
  }

  getNettoPrice(personType: string, seat: any) {
    let priceData = this.tickets.find(t => t.Tickettyp === personType && t.Sitztyp === seat.Sitztyp);
    console.log('Ausgewähltes Ticket', priceData);
    if (priceData) {
      console.log('Preis: ', priceData.PreisBrutto)
      return priceData.PreisNetto;
    } else {
      return 0;
    }
  }

  onSeatSelected(seat: any) {
    console.log("Seat selected: ", seat);
    if (this.isSeatAlreadySelected(seat)) {
      console.log("Seat already selected, removing...");
      this.removeSeat(seat);
      console.log("delete : ", seat)
    } else {
      if (this.canSelectMoreSeats()) {
        seat.selected = true;
        const personType = this.getPersonType();
        console.log(personType);
        const priceBrutto = this.getBruttoPrice(personType, seat);
        const priceNetto = this.getNettoPrice(personType, seat);
        this.socketService.reserveSeat({
          Sitztyp: seat.Sitztyp,
          Reihennummer: seat.Reihennummer,
          Sitznummer: seat.Sitznummer,
          personType,
          priceBrutto,
          priceNetto
        }, this.eventID);
      } else {
        this.modal.classList.add('show');
        this.modal.style.display = 'block';
      }
    }
  }

  isSeatAlreadySelected(seat: any): boolean {
    return this.selectedSeats.some(s => s.Reihennummer === seat.Reihennummer && s.Sitznummer === seat.Sitznummer);
  }

  removeSeat(seat: any) {
    console.log("Removing seat: ", seat);
    const index = this.selectedSeats.findIndex(s => s.Reihennummer === seat.Reihennummer && s.Sitznummer === seat.Sitznummer);
    if (index > -1) {
      console.log("Seat found at index: ", index);
      const seatToDeselect = this.seats.find(s => s.Reihennummer === seat.Reihennummer && s.Sitznummer === seat.Sitznummer);
      this.socketService.releaseSeat(seatToDeselect, this.eventID);
      if (seatToDeselect) {
        seatToDeselect.selected = false;
      }
      console.log('Seat removed:', seat);
    } else {
      console.log('Seat not found in selectedSeats:', seat);
    }
  }

  updateTotalPrice() {
    this.totalPriceBrutto = 0;
    this.totalPriceNetto = 0;
    this.selectedSeats.forEach(seat => {
      this.totalPriceBrutto += seat.priceBrutto;
      this.totalPriceNetto += seat.priceNetto;
    })
  }

  closeModal() {
    this.modal.classList.remove('show');
    this.modal.style.display = 'none';
  }

}