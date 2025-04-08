// Aplicação adaptável para várias utilizações
// 08/04/2025
// Tentei fazer uma backend com strapi e outras tools mas não consegui, resolvi fazer uma app mais simples como esta




import express from "express";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB  } from "./lib/db.js";
import job from "./lib/cron.js";

const app = express();
const PORT = process.env.PORT || 3000;
job.start();
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);


app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
connectDB();

});