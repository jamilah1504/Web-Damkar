// apiAI.js
import axios from "axios";

const apiAI = axios.create({
  baseURL: "http://localhost:5000", // tanpa /api
});

export default apiAI;
