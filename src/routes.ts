import express from "express";
import { searchMoviesController } from "./controllers/searchMoviesController";

const router = express.Router();

router.post("/api/movies/search", searchMoviesController);

export default router;
