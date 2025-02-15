import express from "express";
import routes from "./routes";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.send("Lanter Video Rental is healthy!");
});

app.use("/api", routes);

// Global Error Handler to prevent server crashes, logging for errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

export default app;
