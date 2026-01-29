import type { IDoctorSearchService } from '@/application/ports/IDoctorSearchService';
import type { Doctor } from '@/domain/entities/Doctor';
import type { SearchType } from '@/domain/constants/searchType';
import { fetchDoctors } from '@/infrastructure/services/doctorService';

export class DoctorSearchServiceGateway implements IDoctorSearchService {
  fetchDoctors(searchTerm: string, searchType: SearchType): Promise<Doctor[]> {
    return fetchDoctors(searchTerm, searchType);
  }
}
