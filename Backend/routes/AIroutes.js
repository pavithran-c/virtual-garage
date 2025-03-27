const express = require('express');
const natural = require('natural');
const fs = require('fs').promises;
const path = require('path');
const WebSocket = require('ws');

const router = express.Router();
const LOG_FILE = path.join(__dirname, 'queries.log');
const CLASSIFIER_FILE = path.join(__dirname, 'classifier.json');
const WS_PORT = process.env.WS_PORT || 5001;

// WebSocket Server
const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`WebSocket server running on port ${WS_PORT}`);

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.on('close', () => console.log('WebSocket client disconnected'));
});

// AI Services Data
const services = {
  "Engine Services": [
    { title: "Engine Tune-Up", description: "Optimizes engine performance for noises, power loss, or rough idling.", keywords: ["noise", "power", "rough", "engine", "tune", "running", "vibration"] },
    { title: "Oil Change", description: "Fresh oil to prevent engine wear and overheating.", keywords: ["oil", "engine", "overheating", "leak", "change", "lubrication"] },
    { title: "Spark Plug Replacement", description: "Fixes misfiring or poor fuel economy.", keywords: ["misfiring", "fuel", "spark", "engine", "start", "ignition"] },
    { title: "Timing Belt Replacement", description: "Prevents engine damage from a worn timing belt.", keywords: ["timing", "belt", "engine", "snap", "failure"] },
  ],
  "Tire Services": [
    { title: "Tire Rotation", description: "Even tire wear for better handling and longevity.", keywords: ["tire", "wear", "handling", "rotate", "balance"] },
    { title: "Tire Replacement", description: "New tires for flats, punctures, or worn treads.", keywords: ["flat", "puncture", "tire", "replace", "worn", "blowout"] },
    { title: "Wheel Alignment", description: "Corrects uneven tire wear or pulling.", keywords: ["alignment", "pulling", "tire", "steering", "drift"] },
    { title: "Tire Balancing", description: "Fixes vibrations from uneven tire weight.", keywords: ["vibration", "tire", "balance", "shake"] },
  ],
  "Brake Services": [
    { title: "Brake Pad Replacement", description: "Restores braking power for squeaking or weak brakes.", keywords: ["brake", "squeak", "weak", "pad", "stop", "grind"] },
    { title: "Brake Fluid Flush", description: "Improves brake response and prevents corrosion.", keywords: ["brake", "fluid", "response", "flush", "spongy"] },
    { title: "Brake Rotor Resurfacing", description: "Smooths rotors for better braking.", keywords: ["brake", "rotor", "vibration", "pulse"] },
  ],
  "Battery Services": [
    { title: "Battery Replacement", description: "Fixes dead or weak batteries.", keywords: ["battery", "dead", "weak", "start", "turn", "engine", "charge"] },
    { title: "Battery Terminal Cleaning", description: "Removes corrosion for better starts.", keywords: ["battery", "corrosion", "start", "terminal", "connection"] },
    { title: "Alternator Repair", description: "Fixes charging issues affecting the battery.", keywords: ["alternator", "charge", "battery", "electrical"] },
  ],
  "Website Guidance": [
    { title: "How to Book a Service", description: "Visit 'Book Your Service' section, fill out the form, and submit.", keywords: ["book", "service", "schedule", "repair", "appointment", "reserve"] },
    { title: "How to Search Services", description: "Use the search bar in 'Our Elite Services' to find services.", keywords: ["search", "services", "find", "lookup"] },
    { title: "Track Your Service", description: "Check the 'Live Service Tracker' (coming soon) for updates.", keywords: ["track", "service", "status", "progress"] },
  ],
};

// Training Data (600+ Queries Abbreviated for Brevity)
const trainingData = [
  ["Engine won’t turn over", "Battery Replacement"],
  ["Car vibrates at high speed", "Engine Tune-Up"],
  ["Brakes squeaking loudly", "Brake Pad Replacement"],
  ["Tire shakes at 60 mph", "Tire Balancing"],
  ["How to book a service", "How to Book a Service"],
  // Add more as in original code...
];

// Generate additional queries
for (let i = 0; i < 50; i++) {
  trainingData.push([`Engine sputters at ${i + 20} mph`, "Spark Plug Replacement"]);
  trainingData.push([`Tire vibrates at ${i + 30} mph`, "Tire Balancing"]);
  trainingData.push([`Brakes squeak after ${i + 5} miles`, "Brake Pad Replacement"]);
  trainingData.push([`Battery dies after ${i + 1} days`, "Battery Replacement"]);
  trainingData.push([`Book service for ${i + 1} days later`, "How to Book a Service"]);
}

// Classifier Setup
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
let classifier = new natural.LogisticRegressionClassifier();

async function initializeClassifier() {
  try {
    const fileExists = await fs.access(CLASSIFIER_FILE).then(() => true).catch(() => false);
    if (fileExists) {
      const classifierData = await fs.readFile(CLASSIFIER_FILE, 'utf8');
      classifier = natural.LogisticRegressionClassifier.restore(JSON.parse(classifierData));
      console.log('Classifier loaded from disk');
    } else {
      console.log('Training classifier with', trainingData.length, 'examples...');
      for (const [query, serviceTitle] of trainingData) {
        const tokens = tokenizer.tokenize(query.toLowerCase());
        const stemmedQuery = tokens.map(token => stemmer.stem(token)).join(' ');
        classifier.addDocument(stemmedQuery, serviceTitle);
      }
      classifier.train();
      await fs.writeFile(CLASSIFIER_FILE, JSON.stringify(classifier), 'utf8');
      console.log('Classifier trained and saved to disk');
    }
  } catch (err) {
    console.error('Error initializing classifier:', err);
    throw err;
  }
}

// Keyword Matching
function keywordMatch(query, service) {
  const queryWords = tokenizer.tokenize(query.toLowerCase());
  const keywords = service.keywords || [];
  const matches = keywords.filter(keyword => queryWords.includes(keyword.toLowerCase())).length;
  return matches > 0 ? matches / keywords.length : 0;
}

// Find Best Match
function findBestMatch(query) {
  const tokens = tokenizer.tokenize(query.toLowerCase());
  const stemmedQuery = tokens.map(token => stemmer.stem(token)).join(' ');
  const predictedTitle = classifier.classify(stemmedQuery);
  const classifications = classifier.getClassifications(stemmedQuery);

  const totalProb = classifications.reduce((sum, c) => sum + c.value, 0);
  const confidence = classifications.find(c => c.label === predictedTitle).value / totalProb;

  let bestMatch = null;
  for (const category in services) {
    const service = services[category].find(s => s.title === predictedTitle);
    if (service) {
      bestMatch = { service, category, score: confidence };
      break;
    }
  }

  if (!bestMatch || confidence < 0.6) {
    let keywordBestMatch = { score: 0, service: null, category: null };
    for (const category in services) {
      for (const service of services[category]) {
        const keywordScore = keywordMatch(query, service);
        if (keywordScore > keywordBestMatch.score) {
          keywordBestMatch = { score: keywordScore, service, category };
        }
      }
    }
    if (keywordBestMatch.score > 0.4) {
      return keywordBestMatch.score > confidence ? keywordBestMatch : bestMatch;
    }
  }

  return bestMatch || { score: 0, service: null, category: 'General' };
}

// Log Query and Broadcast via WebSocket
async function logQuery(query, prediction, confidence) {
  const logEntry = `${new Date().toISOString()} | Query: "${query}" | Predicted: "${prediction}" | Confidence: ${confidence.toFixed(4)}\n`;
  try {
    await fs.appendFile(LOG_FILE, logEntry, 'utf8');
    const logData = await fs.readFile(LOG_FILE, 'utf8');
    const lines = logData.split('\n').filter(line => line.trim());
    const analytics = lines.map(line => {
      const [timestamp, rest] = line.split(' | Query: ');
      const [queryPart, predictedPart] = rest.split(' | Predicted: ');
      const [prediction, confidencePart] = predictedPart.split(' | Confidence: ');
      return {
        timestamp: timestamp.trim(),
        query: queryPart.replace(/"/g, '').trim(),
        prediction: prediction.replace(/"/g, '').trim(),
        confidence: parseFloat(confidencePart.trim()),
      };
    });
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(analytics));
      }
    });
  } catch (err) {
    console.error('Error logging query:', err);
  }
}

// Initialize Classifier on Startup
initializeClassifier().catch(err => {
  console.error('Failed to initialize classifier:', err);
});

// Routes
router.post('/recommend', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  const match = findBestMatch(query);
  const prediction = match.service?.title || 'Need More Info';
  console.log(`Query: "${query}", Predicted: "${prediction}", Confidence: ${match.score.toFixed(4)}`);
  await logQuery(query, prediction, match.score);

  if (match.score > 0.15) {
    res.json({
      recommendation: match.service,
      category: match.category,
      confidence: match.score,
    });
  } else {
    res.json({
      recommendation: {
        title: 'Need More Info',
        description: 'We couldn’t find a clear match. Try describing your issue or question in more detail!',
      },
      category: 'General',
      confidence: 0,
    });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const logData = await fs.readFile(LOG_FILE, 'utf8');
    const lines = logData.split('\n').filter(line => line.trim());
    const analytics = lines.map(line => {
      const [timestamp, rest] = line.split(' | Query: ');
      const [queryPart, predictedPart] = rest.split(' | Predicted: ');
      const [prediction, confidencePart] = predictedPart.split(' | Confidence: ');
      return {
        timestamp: timestamp.trim(),
        query: queryPart.replace(/"/g, '').trim(),
        prediction: prediction.replace(/"/g, '').trim(),
        confidence: parseFloat(confidencePart.trim()),
      };
    });
    res.json(analytics);
  } catch (err) {
    console.error('Error reading log file:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;