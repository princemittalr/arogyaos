import { Hospital, Campus, Building, Floor } from '../types';

export class HospitalRepository {
  async getHospitalConfig(hospitalId: string): Promise<Hospital | null> {
    throw new Error('Not implemented');
  }

  async getCampuses(hospitalId: string): Promise<Campus[]> {
    throw new Error('Not implemented');
  }

  async getBuildings(campusId: string): Promise<Building[]> {
    throw new Error('Not implemented');
  }

  async getFloors(buildingId: string): Promise<Floor[]> {
    throw new Error('Not implemented');
  }
}
