import type { Doctor } from '@/domain/entities/Doctor';
import type { SearchType } from '@/domain/constants/searchType';

export interface IDoctorSearchService {
  fetchDoctors(searchTerm: string, searchType: SearchType): Promise<Doctor[]>;
}
