const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");
const app = express();
app.use(cors()); app.use(express.json());

let forestState = { trees: 47, donations: 1284, co2Saved: 6.3, season: "autumn", weather: "clear", biodiversityScore: 82 };

const facts = [
  "A single tree can absorb up to 48 pounds of CO2 per year.",
  "Forests cover 31% of the Earth total land area.",
  "Trees communicate through underground fungal networks.",
  "The Amazon produces 20% of the worlds oxygen.",
  "A mature oak hosts over 500 species of insects."
];

const species = [
  { id:1, name:"Robin Redbreast", type:"bird", rarity:"common", emoji:"bird" },
  { id:2, name:"Great Horned Owl", type:"bird", rarity:"uncommon", emoji:"owl" },
  { id:3, name:"Red Fox", type:"mammal", rarity:"uncommon", emoji:"fox" },
  { id:4, name:"White-tailed Deer", type:"mammal", rarity:"common", emoji:"deer" },
  { id:5, name:"Luna Moth", type:"insect", rarity:"rare", emoji:"butterfly" },
  { id:6, name:"Black Bear", type:"mammal", rarity:"rare", emoji:"bear" },
  { id:7, name:"Firefly", type:"insect", rarity:"common", emoji:"sparkle" }
];

const treeTypes = [
  { name:"Ancient Oak", age:847, height:32, carbonStored:2.1 },
  { name:"White Birch", age:124, height:18, carbonStored:0.8 },
  { name:"Red Maple", age:256, height:24, carbonStored:1.2 },
  { name:"Douglas Fir", age:412, height:45, carbonStored:3.4 }
];

app.get("/api/forest", (req, res) => res.json({ success:true, data:forestState }));
app.get("/api/species", (req, res) => res.json({ success:true, data:species }));
app.get("/api/trees", (req, res) => res.json({ success:true, data:treeTypes }));
app.get("/api/fact", (req, res) => res.json({ success:true, fact:facts[Math.floor(Math.random()*facts.length)] }));
app.post("/api/donate", (req, res) => {
  const { trees = 1 } = req.body;
  forestState.trees += trees;
  forestState.donations += trees;
  forestState.co2Saved = parseFloat((forestState.co2Saved + trees * 0.048).toFixed(2));
  wss.clients.forEach(c => c.readyState===1 && c.send(JSON.stringify({ type:"forest_update", data:forestState })));
  res.json({ success:true, message:trees+" tree(s) planted!", newTotal:forestState.trees });
});
app.post("/api/season", (req, res) => {
  const { season } = req.body;
  const valid = ["spring","summer","autumn","winter"];
  if(valid.includes(season)) { forestState.season = season; return res.json({ success:true, season }); }
  res.status(400).json({ error:"Invalid season" });
});
app.get("/api/weather", (req, res) => {
  const w = ["clear","misty","rainy","stormy","foggy"][Math.floor(Math.random()*5)];
  forestState.weather = w;
  res.json({ success:true, weather:w });
});
app.get("/api/stats", (req, res) => res.json({ success:true, stats:{ trees:forestState.trees, donations:forestState.donations, co2Saved:forestState.co2Saved, biodiversityScore:forestState.biodiversityScore, speciesCount:species.length }}));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
wss.on("connection", ws => {
  console.log("Forest visitor connected");
  ws.send(JSON.stringify({ type:"welcome", data:forestState }));
});
setInterval(() => {
  forestState.biodiversityScore = parseFloat(Math.min(100, forestState.biodiversityScore + Math.random()*0.5).toFixed(1));
  wss.clients.forEach(c => c.readyState===1 && c.send(JSON.stringify({ type:"heartbeat", data:{ biodiversityScore:forestState.biodiversityScore }})));
}, 10000);
server.listen(3001, () => console.log("THE FOREST backend running on http://localhost:3001"));

<!-- feat: add Express server with CORS -->

<!-- feat: add /api/forest state endpoint -->

<!-- feat: add /api/species and /api/trees routes -->
