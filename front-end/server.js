import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000;

// Lấy __dirname trong ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files từ Angular dist
app.use(express.static(path.join(__dirname, "dist/chat-app")));

// Route tất cả request khác về index.html (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/chat-app/index.html"));
});

app.listen(PORT, () => {
  console.log(`Frontend is running on port ${PORT}`);
});
