import { ProcedureBooking, OperatingTheatre } from '../types';

export class ProcedureRepository {
  async findBookingById(id: string): Promise<ProcedureBooking | null> {
    throw new Error('Not implemented');
  }

  async findBookingsByTheatre(theatreId: string, date: string): Promise<ProcedureBooking[]> {
    throw new Error('Not implemented');
  }

  async saveBooking(booking: ProcedureBooking): Promise<ProcedureBooking> {
    throw new Error('Not implemented');
  }

  async getTheatre(theatreId: string): Promise<OperatingTheatre | null> {
    throw new Error('Not implemented');
  }
}
