import { searchMoviesController } from "../../src/controllers/searchMoviesController";
import { getMoviesFromAllSources, deduplicateMovies, paginateResults } from "../../src/services/movieService";
import { Request, Response } from "express";
import { SearchRequest, Film } from "../../src/types";

jest.mock("../../src/services/movieService.ts");

describe("searchMoviesController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    sendMock = jest.fn();

    req = {
      body: {
        excludeVHS: false,
        excludeDVD: false,
        excludeProjector: false,
        currentPage: 1,
        pageSize: 2,
        sortField: "title",
        sortDirection: "ASC",
        search: {
          title: "Matrix",
          releaseYear: 1999,
          director: "Wachowskis",
          distributor: "Warner Bros",
        },
      },
    };

    res = {
      json: jsonMock,
      status: statusMock,
      send: sendMock,
    };
  });

  test("should return paginated and deduplicated movies", async () => {
    const mockMovies: Film[] = [
      { title: "Matrix", releaseYear: 1999, numberOfCopiesAvailable: 3, director: "Wachowskis", distributor: "Warner Bros" },
      { title: "Matrix", releaseYear: 1999, numberOfCopiesAvailable: 2, director: "Wachowskis", distributor: "Sony" },
    ];
    
    const deduplicatedMovies: Film[] = [
      { title: "Matrix", releaseYear: 1999, numberOfCopiesAvailable: 5, director: "Wachowskis", distributor: "Warner Bros, Sony" },
    ];

    const paginatedMovies: Film[] = [deduplicatedMovies[0]];

    (getMoviesFromAllSources as jest.Mock).mockResolvedValue(mockMovies);
    (deduplicateMovies as jest.Mock).mockReturnValue(deduplicatedMovies);
    (paginateResults as jest.Mock).mockReturnValue(paginatedMovies);

    await searchMoviesController(req as Request, res as Response);

    expect(getMoviesFromAllSources).toHaveBeenCalledWith(
      false, false, false, req.body
    );
    expect(deduplicateMovies).toHaveBeenCalledWith(mockMovies);
    expect(paginateResults).toHaveBeenCalledWith(deduplicatedMovies, 1, 2);

    expect(jsonMock).toHaveBeenCalledWith({
      currentPage: 1,
      pageSize: 2,
      totalResults: 1,
      results: paginatedMovies,
    });
  });

  test("should return 500 Internal Server Error if service throws an error", async () => {
    (getMoviesFromAllSources as jest.Mock).mockRejectedValue(new Error("API Error"));

    await searchMoviesController(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});
