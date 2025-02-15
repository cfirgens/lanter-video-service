import axios from 'axios';
import { ApiFilmSearch, Film } from '../types';
import { VHS_API, DVD_API, PROJECTOR_API } from '../consts/apiUrls';

async function fetchMovies(apiUrl: string, params: ApiFilmSearch): Promise<Film[]> {
    //Nice to have: Cache data
    try {
        const response = await axios.post<Film[]>(apiUrl,params);
        return response.data;
    } catch (err) {
        console.error(`Error fetching data from ${apiUrl}:`, err)
        return [];
    }
}

export async function getMoviesFromAllSources(
    excludeVHS: boolean,
    excludeDVD: boolean,
    excludeProjector: boolean,
    params: ApiFilmSearch
) : Promise<Film[]> {
    const requests: Promise<Film[]>[] = [];

    if (!excludeVHS) requests.push(fetchMovies(VHS_API, params));
    if (!excludeDVD) requests.push(fetchMovies(DVD_API, params));
    if (!excludeProjector) requests.push(fetchMovies(PROJECTOR_API, params));

    const results = await Promise.all(requests);
    return results.flat();
}


//Deduplicate function

export function sortMovies(movies: Film[], sortField: 'title' | 'releaseYear', sortDirection: 'ASC' | 'DESC'): Film[] {
    return movies.sort((a, b) => {
      if (sortField === 'title') {
        return sortDirection === 'ASC' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      } else {
        return sortDirection === 'ASC' ? a.releaseYear - b.releaseYear : b.releaseYear - a.releaseYear;
      }
    });
}

export function paginateResults(movies: Film[], currentPage: number, pageSize: number): Film[]{
    //TODO: Account for edge cases
    const startPage = (currentPage - 1)* pageSize;
    return movies.slice(startPage, startPage + pageSize);
}
