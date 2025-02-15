import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { fetchMovies, getMoviesFromAllSources, deduplicateMovies, sortMovies, paginateResults } from "../../src/services/movieService";
import { VHS_API, DVD_API, PROJECTOR_API } from "../../src/consts/apiUrls";
import { ApiFilmSearch, Film } from "../../src/types";

const mockAxios = new MockAdapter(axios);

describe("fetchMovies Service Tests", () => {
  const mockParams: ApiFilmSearch = {
    currentPage: 1,
    pageSize: 2,
    sortField: "title",
    sortDirection: "ASC",
    search: { title: "Test", releaseYear: 2022, director: "Director", distributor: "Distributor" },
  };

  const mockMovies: Film[] = [
    { title: "Movie A", releaseYear: 2022, numberOfCopiesAvailable: 3, director: "Director", distributor: "Distributor A" },
    { title: "Movie B", releaseYear: 2021, numberOfCopiesAvailable: 2, director: "Director", distributor: "Distributor B" },
  ];

  afterEach(() => {
    mockAxios.reset();
  });

  test("fetchMovies should return movie data when API call is successful", async () => {
    mockAxios.onPost(VHS_API).reply(200, mockMovies);
    const result = await fetchMovies(VHS_API, mockParams);
    expect(result).toEqual(mockMovies);
  });

  test("fetchMovies should return an empty array when API call fails", async () => {
    mockAxios.onPost(VHS_API).networkError();
    const result = await fetchMovies(VHS_API, mockParams);
    expect(result).toEqual([]);
  });

  test("fetchMovies should not throw unexpected network errors", async () => {
    mockAxios.onAny().reply(500, {});

    const result = await fetchMovies(VHS_API, mockParams);
    expect(result).toEqual([]);
  });

  test("getMoviesFromAllSources should call all sources when no exclusions are set", async () => {
    mockAxios.onPost(VHS_API).reply(200, mockMovies);
    mockAxios.onPost(DVD_API).reply(200, mockMovies);
    mockAxios.onPost(PROJECTOR_API).reply(200, []);

    const result = await getMoviesFromAllSources(false, false, false, mockParams);
    expect(result.length).toBe(4); // 2 from VHS, 2 from DVD, 0 from Projector
  });

  test("getMoviesFromAllSources should exclude sources based on flags", async () => {
    mockAxios.onPost(DVD_API).reply(200, mockMovies);
    const result = await getMoviesFromAllSources(true, false, true, mockParams);
    expect(result.length).toBe(2); // Only DVD source included
  });

  test("deduplicateMovies should merge duplicates and sum number of copies", () => {
    const inputMovies: Film[] = [
      { title: "Movie A", releaseYear: 2022, numberOfCopiesAvailable: 2, director: "Director", distributor: "Distributor A" },
      { title: "Movie A", releaseYear: 2022, numberOfCopiesAvailable: 5, director: "Director", distributor: "Distributor B" },
    ];

    const result = deduplicateMovies(inputMovies);
    expect(result).toEqual([
      {
        title: "Movie A",
        releaseYear: 2022,
        numberOfCopiesAvailable: 7,
        director: "Director",
        distributor: "Distributor A, Distributor B",
      },
    ]);
  });

  test("deduplicateMovies should handle an empty array", () => {
    expect(deduplicateMovies([])).toEqual([]);
  });

  test("sortMovies should sort movies by title in ascending order", () => {
    const sorted = sortMovies(mockMovies, "title", "ASC");
    expect(sorted[0].title).toBe("Movie A");
    expect(sorted[1].title).toBe("Movie B");
  });

  test("sortMovies should sort movies by releaseYear in descending order", () => {
    const sorted = sortMovies(mockMovies, "releaseYear", "DESC");
    expect(sorted[0].releaseYear).toBe(2022);
    expect(sorted[1].releaseYear).toBe(2021);
  });

  test("paginateResults should return the correct page of movies", () => {
    const movies = [
      { title: "Movie A", releaseYear: 2022, numberOfCopiesAvailable: 3, director: "Director", distributor: "Distributor A" },
      { title: "Movie B", releaseYear: 2021, numberOfCopiesAvailable: 2, director: "Director", distributor: "Distributor B" },
      { title: "Movie C", releaseYear: 2020, numberOfCopiesAvailable: 1, director: "Director", distributor: "Distributor C" },
    ];

    const page1 = paginateResults(movies, 1, 2);
    expect(page1.length).toBe(2);
    expect(page1[0].title).toBe("Movie A");
    expect(page1[1].title).toBe("Movie B");

    const page2 = paginateResults(movies, 2, 2);
    expect(page2.length).toBe(1);
    expect(page2[0].title).toBe("Movie C");
  });

  test("paginateResults should return an empty array if the page is out of bounds", () => {
    expect(paginateResults(mockMovies, 5, 2)).toEqual([]);
  });
});
