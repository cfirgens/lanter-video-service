import axios from 'axios';
import { ApiFilmSearch, Film } from '../types';
import { VHS_API, DVD_API, PROJECTOR_API } from '../consts/apiUrls';

export async function fetchMovies(apiUrl: string, params: ApiFilmSearch): Promise<Film[]> {
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

export function deduplicateMovies(movies: Film[]): Film[] {
    const movieMap = new Map<string, { 
        numberOfCopiesAvailable: number; 
        distributorSet: Set<string>; 
        director: string;
        title: string;
        releaseYear: number;
    }>();

    for (const movie of movies) {
        const key = `${movie.title}-${movie.releaseYear}`;

        if (!movieMap.has(key)) {
            movieMap.set(key, {
                title: movie.title,
                releaseYear: movie.releaseYear,
                numberOfCopiesAvailable: movie.numberOfCopiesAvailable,
                director: movie.director,
                distributorSet: new Set([movie.distributor])
            });
        } else {
            const existingMovie = movieMap.get(key)!;

            existingMovie.numberOfCopiesAvailable += movie.numberOfCopiesAvailable;
            existingMovie.distributorSet.add(movie.distributor);
        }
    }

    return Array.from(movieMap.values()).map(movie => ({
        title: movie.title,
        releaseYear: movie.releaseYear,
        numberOfCopiesAvailable: movie.numberOfCopiesAvailable,
        director: movie.director,
        distributor: Array.from(movie.distributorSet).join(', '),
    }));
}


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
