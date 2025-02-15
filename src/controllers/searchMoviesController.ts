import { Request, Response } from 'express';
import { getMoviesFromAllSources, paginateResults, deduplicateMovies } from '../services/movieService';
import { SearchRequest } from '../types';

export async function searchMoviesController(req: Request, res: Response) {
    try{
        const searchParams: SearchRequest = req.body;

        const movies = await getMoviesFromAllSources(
            searchParams.excludeVHS || false,
            searchParams.excludeDVD || false,
            searchParams.excludeProjector || false,
            searchParams
        );
    
        const deduplicatedMovies = deduplicateMovies(movies);
        const paginatedMovies = paginateResults(deduplicatedMovies, searchParams.currentPage, searchParams.pageSize);
    
        res.json({
            currentPage: searchParams.currentPage,
            pageSize: searchParams.pageSize,
            totalResults: deduplicatedMovies.length,
            results: paginatedMovies
        });
    } catch (err) {
        console.error("Error processing movie search:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
   
}