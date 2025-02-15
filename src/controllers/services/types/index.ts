export interface Film {
    title: string;
    releaseYear: number;
    numberOfCopiesAvailable: number;
    director: string;
    distributor: string;
  }
  
  export interface ApiFilmSearch {
    currentPage: number;
    pageSize: number;
    sortField: 'title' | 'releaseYear';
    sortDirection: 'ASC' | 'DESC';
    search: {
      title?: string;
      releaseYear?: number;
      director?: string;
      distributor?: string;
    };
  }
  
  export interface SearchRequest {
    excludeVHS?: boolean;
    excludeDVD?: boolean;
    excludeProjector?: boolean;
    currentPage: number;
    pageSize: number;
    sortField: 'title' | 'releaseYear';
    sortDirection: 'ASC' | 'DESC';
    search: {
      title?: string;
      releaseYear?: number;
      director?: string;
      distributor?: string;
    };
  }
  