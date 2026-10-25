import app from "./app.js";

const PORT = Number(process.env.API_PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Bravo API running on port ${PORT}`);
});