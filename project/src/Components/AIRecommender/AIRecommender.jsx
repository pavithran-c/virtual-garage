import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCarAlt, FaTools, FaExclamationTriangle, FaHistory, FaSmile, FaInfoCircle, FaTrash,
  FaMicrophone, FaPalette, FaMoon, FaSun, FaStar, FaMapMarkerAlt, FaComment, FaAngleDown,
  FaAngleUp, FaDownload, FaArrowUp, FaLanguage, FaDirections
} from "react-icons/fa";
import { LinearProgress, CircularProgress } from "@mui/material";
import { SketchPicker } from "react-color";

export default function AIRecommender() {
  const [query, setQuery] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [category, setCategory] = useState("All");
  const [isListening, setIsListening] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [themeColor, setThemeColor] = useState("#e1b382");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showCostEstimator, setShowCostEstimator] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [favoritesCollapsed, setFavoritesCollapsed] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const chatEndRef = useRef(null);

  const categories = ["All", "Engine", "Tires", "Brakes", "Battery", "Website"];
  const popularQueries = {
    All: ["Engine won’t turn over", "Car vibrates at high speed", "Brakes squeaking loudly", "Tire shakes at 60 mph", "How to book a service", "Battery dead overnight", "Oil leaking under car"],
    Engine: ["Engine won’t turn over", "Car vibrates at high speed", "Oil leaking under car", "Engine rattles on startup", "Check engine light blinks", "Engine sputters at 60 mph", "Power drops when accelerating"],
    Tires: ["Car vibrates at high speed", "Tire shakes at 60 mph", "Flat tire from pothole", "Tires squeal on sharp turns", "Tire losing air fast", "Tire sidewall torn", "Shaking at 70 mph"],
    Brakes: ["Brakes squeaking loudly", "Brake pedal feels mushy", "Grinding brakes when pressed", "Brake pedal shakes hard", "Slow brake response time", "Brakes screech on stop", "Brake light stays on"],
    Battery: ["Battery dead overnight", "Car won’t start, battery dead", "Battery dies after parking", "Headlights dim when cranking", "Battery not charging up", "Slow engine crank noise", "Dashboard flickers on start"],
    Website: ["How to book a service", "Schedule a repair now", "Track my repair status", "Book appointment online", "Look up repair services", "Reserve a service slot", "How to schedule a fix?"],
  };

  const translations = {
    "en-US": {
      appTitle: "Friends Car Care AI",
      diagnoseLabel: "Diagnose Your Car",
      placeholder: "e.g., 'Engine won’t turn over' or 'Book a service'",
      getSolution: "Get Solution",
      analyzing: "Analyzing...",
      solutionFor: "Solution for",
      confidence: "Confidence",
      moreInfo: "More Info",
      hideDetails: "Hide Details",
      estimateCost: "Estimate Cost",
      bookNow: "Book Now",
      quickTip: "Quick Tip",
      costEstimateTitle: "Cost Estimate",
      close: "Close",
      fccLocations: "FCC Locations",
      liveChat: "Live Chat",
      typeMessage: "Type a message...",
      favoriteQueries: "Favorite Queries",
      recentQueries: "Recent Queries",
      filterHistory: "Filter history...",
      clearHistory: "Clear History",
      feedback: "Feedback",
      exportAnalytics: "Export Analytics",
      viewAnalytics: "View Analytics Dashboard",
      contact: "Contact",
      directions: "Directions",
      defaultChatMessage: "How can I assist you today?",
      tips: [
        "Check tire pressure monthly for safety.",
        "Replace brake pads every 50,000 miles.",
        "Schedule an oil change every 5,000 miles.",
      ],
      chatResponses: {
        hi: "Hello! How can I assist you today?",
        hours: "Our hours are 9 AM to 6 PM, Monday to Saturday.",
        location: "We’re at Friends Car Care, check the map!",
        cost: "Costs vary by service. Use the cost estimator!",
        service: "What service do you need? Try the main tool!",
        default: "I’m not sure how to help with that. Try 'hours', 'location', or 'cost'!",
      },
    },
    "ta-IN": {
      appTitle: "பிரண்ட்ஸ் கார் கேர் AI",
      diagnoseLabel: "உங்கள் காரை சோதிக்கவும்",
      placeholder: "எ.கா., 'இன்ஜின் தொடங்கவில்லை' அல்லது 'சேவையை முன்பதிவு செய்யவும்'",
      getSolution: "தீர்வு பெறவும்",
      analyzing: "பகுப்பாய்வு செய்கிறது...",
      solutionFor: "இதற்கான தீர்வு",
      confidence: "நம்பிக்கை",
      moreInfo: "மேலும் தகவல்",
      hideDetails: "விவரங்களை மறை",
      estimateCost: "செலவு மதிப்பீடு",
      bookNow: "இப்போது முன்பதிவு செய்யவும்",
      quickTip: "விரைவு குறிப்பு",
      costEstimateTitle: "செலவு மதிப்பீடு",
      close: "மூடு",
      fccLocations: "FCC இடங்கள்",
      liveChat: "நேரடி அரட்டை",
      typeMessage: "ஒரு செய்தியை தட்டச்சு செய்யவும்...",
      favoriteQueries: "பிடித்த கேள்விகள்",
      recentQueries: "சமீபத்திய கேள்விகள்",
      filterHistory: "வரலாற்றை வடிகட்டவும்...",
      clearHistory: "வரலாற்றை அழி",
      feedback: "பின்னூட்டம்",
      exportAnalytics: "பகுப்பாய்வுகளை ஏற்றுமதி செய்யவும்",
      viewAnalytics: "பகுப்பாய்வு டாஷ்போர்டை பார்க்கவும்",
      contact: "தொடர்பு",
      directions: "வழிமுறைகள்",
      defaultChatMessage: "இன்று உங்களுக்கு எவ்வாறு உதவ முடியும்?",
      tips: [
        "பாதுகாப்பிற்காக மாதாந்திர டயர் அழுத்தத்தை சரிபார்க்கவும்.",
        "ஒவ்வொரு 50,000 மைல்களுக்கும் பிரேக் பேட்களை மாற்றவும்.",
        "ஒவ்வொரு 5,000 மைல்களுக்கும் எண்ணெய் மாற்றத்தை திட்டமிடவும்.",
      ],
      chatResponses: {
        hi: "வணக்கம்! இன்று உங்களுக்கு எவ்வாறு உதவ முடியும்?",
        hours: "எங்கள் நேரம் திங்கள் முதல் சனி வரை காலை 9 மணி முதல் மாலை 6 மணி வரை.",
        location: "நாங்கள் பிரண்ட்ஸ் கார் கேர்-ல் இருக்கிறோம், வரைபடத்தைப் பாருங்கள்!",
        cost: "சேவைக்கு ஏற்ப செலவு மாறுபடும். செலவு மதிப்பீட்டைப் பயன்படுத்தவும்!",
        service: "உங்களுக்கு எந்த சேவை தேவை? முதன்மைக் கருவியை முயற்சிக்கவும்!",
        default: "அதற்கு எப்படி உதவுவது என்று தெரியவில்லை. 'hours', 'location', அல்லது 'cost' என்று முயற்சிக்கவும்!",
      },
    },
  };

  const categoryIcons = {
    Engine: <FaTools className="mr-2" />,
    Tires: <FaCarAlt className="mr-2" />,
    Brakes: <FaTools className="mr-2" />,
    Battery: <FaStar className="mr-2" />,
    Website: <FaInfoCircle className="mr-2" />,
  };

  useEffect(() => {
    setTimeout(() => setIsAppLoading(false), 3000);

    if (query.length > 2) {
      const filtered = popularQueries[category]
        .filter(q => q.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, category]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  useEffect(() => {
    if (showChat && chatMessages.length === 0) {
      setChatMessages([{ text: translations[language].defaultChatMessage, sender: "bot" }]);
    }
  }, [showChat, language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendation(null);
    setSuggestions([]);

    try {
      const response = await fetch("http://localhost:5000/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("Failed to fetch recommendation");

      const data = await response.json();
      setRecommendation(data);
      setHistory(prev => [query, ...prev.filter(q => q !== query).slice(0, 9)]);
    } catch (err) {
      setError(translations[language].error || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    // Ensure this runs only on the client side
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window)) {
      alert("Sorry, your browser doesn’t support voice input or this feature is unavailable.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setError(translations[language].error || "Voice recognition failed. Try again.");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleFeedback = () => {
    alert(translations[language].feedbackThanks || "Thank you for your feedback! We’ll improve based on your input.");
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const toggleFavorite = (item) => {
    setFavorites(prev => 
      prev.includes(item) ? prev.filter(f => f !== item) : [...prev, item]
    );
  };

  const estimateCost = () => {
    if (!recommendation) return "₹0";
    const USD_TO_INR = 83;
    const baseCostsUSD = {
      "Engine Tune-Up": 100,
      "Oil Change": 50,
      "Spark Plug Replacement": 80,
      "Timing Belt Replacement": 150,
      "Tire Rotation": 40,
      "Tire Replacement": 120,
      "Wheel Alignment": 90,
      "Tire Balancing": 60,
      "Brake Pad Replacement": 110,
      "Brake Fluid Flush": 70,
      "Brake Rotor Resurfacing": 130,
      "Battery Replacement": 100,
      "Battery Terminal Cleaning": 30,
      "Alternator Repair": 140,
      "How to Book a Service": 0,
      "How to Search Services": 0,
      "Track Your Service": 0,
    };
    const baseUSD = baseCostsUSD[recommendation.recommendation.title] || 50;
    const baseINR = baseUSD * USD_TO_INR;
    return `₹${baseINR.toLocaleString('en-IN')} - ₹${(baseINR + 50 * USD_TO_INR).toLocaleString('en-IN')}`;
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { text: chatInput, sender: "user" };
    setChatMessages(prev => [...prev, userMessage]);

    const responses = translations[language].chatResponses;
    const botResponse = { text: responses[chatInput.toLowerCase()] || responses["default"], sender: "bot" };
    setChatMessages(prev => [...prev, botResponse]);
    setChatInput("");
  };

  const downloadAnalytics = async () => {
    setExporting(true);
    try {
      const response = await fetch("http://localhost:5000/api/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      const csv = [
        "Timestamp,Query,Prediction,Confidence",
        ...data.map(entry => `${entry.timestamp},${entry.query},${entry.prediction},${entry.confidence}`)
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "queries_log.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download analytics: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const getQueryCategory = (item) => {
    for (const cat in popularQueries) {
      if (popularQueries[cat].includes(item)) return cat;
    }
    return recommendation?.category || "All";
  };

  const filteredHistory = history.filter(item => item.toLowerCase().includes(historyFilter.toLowerCase()));

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "en-US" ? "ta-IN" : "en-US"));
  };

  if (isAppLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"} flex items-center justify-center`}>
        <motion.div
          className="relative flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className={`text-[${themeColor}] text-4xl md:text-6xl`}
            animate={{ x: [-100, 100, -100], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <FaCarAlt />
          </motion.div>
          <motion.div
            className="absolute text-2xl md:text-4xl font-bold text-[#c89666] tracking-widest"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            FCC
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-100"} text-${darkMode ? "white" : "gray-900"} transition-colors duration-500 overflow-x-hidden relative`}>
      <div className={`absolute inset-0 bg-gradient-to-br from-[${themeColor}]/20 via-[#c89666]/20 to-transparent opacity-30`} />

      <motion.div
        className="w-full max-w-6xl mx-auto py-4 px-4 sm:px-6 lg:px-8 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Header */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#e1b382] to-[#c89666] tracking-tight"
          initial={{ y: -50, rotate: -2 }}
          animate={{ y: 0, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        >
          {translations[language].appTitle}
        </motion.h1>

        {/* Controls */}
        <div className="flex flex-wrap justify-end gap-2 sm:gap-3 mb-6">
          <motion.button
            className="p-2 rounded-full bg-gradient-to-r from-[#e1b382] to-[#c89666] text-gray-900 shadow-md relative group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Dark Mode"
          >
            {darkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Dark Mode</span>
          </motion.button>
          <motion.button
            className="p-2 rounded-full bg-gradient-to-r from-[#e1b382] to-[#c89666] text-gray-900 shadow-md relative group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Customize Theme"
          >
            <FaPalette size={16} />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Theme</span>
          </motion.button>
          <motion.button
            className="p-2 rounded-full bg-gradient-to-r from-[#e1b382] to-[#c89666] text-gray-900 shadow-md relative group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleLanguage}
            title={language === "en-US" ? "Switch to Tamil" : "Switch to English"}
          >
            <FaLanguage size={16} />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {language === "en-US" ? "Tamil" : "English"}
            </span>
          </motion.button>
          <motion.button
            className="p-2 rounded-full bg-gradient-to-r from-[#e1b382] to-[#c89666] text-gray-900 shadow-md relative group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMap(!showMap)}
            title="Show Locations"
          >
            <FaMapMarkerAlt size={16} />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Map</span>
          </motion.button>
          <motion.button
            className="p-2 rounded-full bg-gradient-to-r from-[#e1b382] to-[#c89666] text-gray-900 shadow-md relative group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChat(!showChat)}
            title="Live Chat"
          >
            <FaComment size={16} />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Chat</span>
          </motion.button>
          {showColorPicker && (
            <motion.div
              className="absolute top-12 right-0 z-20 bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-700"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-sm">Select Theme</span>
                <motion.button
                  className="text-gray-400 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowColorPicker(false)}
                >
                  X
                </motion.button>
              </div>
              <SketchPicker
                color={themeColor}
                onChangeComplete={(color) => setThemeColor(color.hex)}
              />
            </motion.div>
          )}
        </div>

        {/* Category Tabs */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map(cat => (
            <motion.button
              key={cat}
              className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full font-semibold text-sm ${category === cat ? `bg-gradient-to-r from-[${themeColor}] to-[#c89666] text-gray-900` : `${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"} hover:bg-opacity-80 transition-colors`}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* Input Form */}
        <motion.div
          className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 sm:p-6 rounded-xl shadow-lg mb-6 border ${darkMode ? "border-gray-700" : "border-gray-200"} hover:shadow-xl transition-shadow duration-300 max-w-3xl mx-auto`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <label className="flex items-center text-lg sm:text-xl font-semibold mb-3 justify-center">
            <FaTools className={`mr-2 text-[${themeColor}]`} /> {translations[language].diagnoseLabel}
          </label>
          <div className="relative">
            <FaCarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={translations[language].placeholder}
              className={`${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-200 text-gray-900 border-gray-300"} w-full pl-10 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[${themeColor}] focus:border-[${themeColor}] transition-all duration-300`}
              required
              disabled={loading}
            />
            <motion.button
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 ${isListening ? `text-[${themeColor}]` : "text-gray-400"}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleVoiceInput}
              disabled={loading}
              title="Voice Input"
            >
              <FaMicrophone size={16} />
            </motion.button>
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.ul
                  className={`${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200"} absolute z-10 w-full mt-1 rounded-lg shadow-lg border`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {suggestions.map((sug, index) => (
                    <li
                      key={index}
                      className={`${darkMode ? "text-gray-300 hover:bg-gray-600" : "text-gray-700 hover:bg-gray-100"} p-2 cursor-pointer transition-colors text-sm`}
                      onClick={() => { setQuery(sug); setSuggestions([]); }}
                    >
                      {sug}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            className={`mt-4 w-full bg-gradient-to-r from-[${themeColor}] to-[#c89666] text-gray-900 py-2 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? translations[language].analyzing : translations[language].getSolution}
          </motion.button>
        </motion.div>

        {/* Loading Spinner */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="flex justify-center items-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CircularProgress sx={{ color: themeColor }} size={32} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-red-900/70 p-4 rounded-xl mb-6 text-red-200 flex items-center shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <FaExclamationTriangle className="mr-2 text-xl" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommendation */}
        <AnimatePresence>
          {recommendation && !loading && !error && (
            <motion.div
              className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 sm:p-6 rounded-xl shadow-lg mb-6 border ${darkMode ? "border-gray-700" : "border-gray-200"} hover:shadow-xl transition-shadow duration-300 max-w-3xl mx-auto`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-lg sm:text-xl font-bold mb-3 text-center">
                {translations[language].solutionFor} "<span className={`text-[${themeColor}]`}>{query}</span>"
              </h2>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-[#c89666]">
                  {recommendation.category}: {recommendation.recommendation.title}
                </h3>
                <motion.button
                  className={`text-[${themeColor}] hover:text-[#f5c78e]`}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => toggleFavorite(query)}
                  title="Add to Favorites"
                >
                  <FaStar size={16} className={`${favorites.includes(query) ? "text-yellow-400" : ""}`} />
                </motion.button>
              </div>
              <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} mb-3 text-sm`}>{recommendation.recommendation.description}</p>
              <div className="mb-3">
                <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mb-2 text-sm`}>{translations[language].confidence}: {(recommendation.confidence * 100).toFixed(2)}%</p>
                <LinearProgress
                  variant="determinate"
                  value={recommendation.confidence * 100}
                  sx={{
                    height: 6,
                    borderRadius: 4,
                    backgroundColor: darkMode ? "#4b5563" : "#e5e7eb",
                    "& .MuiLinearProgress-bar": { backgroundColor: themeColor },
                  }}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mb-3 justify-center">
                <button
                  className={`text-[${themeColor}] flex items-center hover:text-[#f5c78e] transition-colors text-sm`}
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <FaInfoCircle className="mr-1" /> {showDetails ? translations[language].hideDetails : translations[language].moreInfo}
                </button>
                <button
                  className={`text-[${themeColor}] flex items-center hover:text-[#f5c78e] transition-colors text-sm`}
                  onClick={() => setShowCostEstimator(true)}
                >
                  <FaInfoCircle className="mr-1" /> {translations[language].estimateCost}
                </button>
              </div>
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs mb-3`}
                  >
                    <p>Estimated Cost: {estimateCost()}</p>
                    <p>Time Required: 1-2 hours</p>
                    <p>Action: Book with FCC now!</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {recommendation.category !== "General" && (
                <motion.button
                  className="w-full bg-gradient-to-r from-[#2d545e] to-[#12343b] text-white py-2 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => alert(`Redirecting to book ${recommendation.recommendation.title}`)}
                >
                  {translations[language].bookNow}
                </motion.button>
              )}
              <div className={`${darkMode ? "text-gray-400" : "text-gray-600"} mt-3 text-xs text-center`}>
                <p className="font-semibold">{translations[language].quickTip}:</p>
                <p>{translations[language].tips[Math.floor(Math.random() * translations[language].tips.length)]}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cost Estimator Popup */}
        <AnimatePresence>
          {showCostEstimator && recommendation && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 rounded-xl shadow-lg border ${darkMode ? "border-gray-700" : "border-gray-200"} w-full max-w-sm`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <h3 className="text-lg font-semibold mb-3 text-center">{translations[language].costEstimateTitle}</h3>
                <p className={`${darkMode ? "text-gray-300" : "text-gray-700"} mb-3 text-center text-sm`}>
                  For "{recommendation.recommendation.title}":<br />{estimateCost()}
                </p>
                <motion.button
                  className={`w-full bg-gradient-to-r from-[${themeColor}] to-[#c89666] text-gray-900 py-2 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCostEstimator(false)}
                >
                  {translations[language].close}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Popup */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 w-64 sm:w-72 h-64 sm:h-72 bg-gray-800 rounded-xl shadow-lg border border-gray-700 z-50 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex justify-between items-center p-2 sm:p-3 border-b border-gray-700">
                <h3 className="text-sm sm:text-base font-semibold text-white">{translations[language].fccLocations}</h3>
                <motion.button
                  className="text-gray-400 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowMap(false)}
                >
                  X
                </motion.button>
              </div>
              <div className="flex-1 p-2">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3909.8008754335706!2d77.87190327489351!3d11.494283988701502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba95e3e310837d7%3A0x530acf67217dbdb0!2sFriends%20Car%20Care!5e0!3m2!1sen!2sin!4v1742966942065!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>
              <div className="p-2">
                <motion.button
                  className="w-full bg-gradient-to-r from-[#e1b382] to-[#c89666] text-gray-900 py-1 rounded-lg font-semibold text-xs shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open("https://www.google.com/maps/dir/?api=1&destination=11.4942839,77.8719033", "_blank")}
                >
                  <FaDirections className="mr-1" /> {translations[language].directions}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Popup */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 w-64 sm:w-72 h-64 sm:h-72 bg-gray-800 rounded-xl shadow-lg border border-gray-700 z-50 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="flex justify-between items-center p-2 sm:p-3 border-b border-gray-700">
                <h3 className="text-sm sm:text-base font-semibold text-white">{translations[language].liveChat}</h3>
                <motion.button
                  className="text-gray-400 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowChat(false)}
                >
                  X
                </motion.button>
              </div>
              <div className="flex-1 p-2 overflow-y-auto">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                    <span className={`${msg.sender === "user" ? `bg-[${themeColor}]` : "bg-gray-700"} text-white p-1 rounded-lg inline-block max-w-[80%] text-xs`}>
                      {msg.text}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleChatSubmit} className="p-2 border-t border-gray-700">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={translations[language].typeMessage}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-1 text-xs focus:outline-none focus:ring-2 focus:ring-[${themeColor}]"
                />
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Favorites */}
        {favorites.length > 0 && (
          <motion.div
            className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 sm:p-6 rounded-xl shadow-lg mb-6 border ${darkMode ? "border-gray-700" : "border-gray-200"} hover:shadow-xl transition-shadow duration-300 max-w-3xl mx-auto`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center">
                <FaStar className={`mr-2 text-[${themeColor}]`} /> {translations[language].favoriteQueries}
              </h2>
              <motion.button
                className={`text-[${themeColor}] hover:text-[#f5c78e]`}
                whileHover={{ scale: 1.1 }}
                onClick={() => setFavoritesCollapsed(!favoritesCollapsed)}
              >
                {favoritesCollapsed ? <FaAngleDown /> : <FaAngleUp />}
              </motion.button>
            </div>
            <AnimatePresence>
              {!favoritesCollapsed && (
                <motion.ul
                  className={`${darkMode ? "text-gray-300" : "text-gray-700"} space-y-2 max-h-40 overflow-y-auto`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {favorites.map((item, index) => (
                    <li key={index} className="flex justify-between items-center text-xs">
                      <span className={`cursor-pointer hover:text-[${themeColor}] transition-colors flex items-center`}>
                        {categoryIcons[getQueryCategory(item)] || <FaStar className={`mr-2 text-[${themeColor}]`} />}
                        {item}
                      </span>
                      <button
                        className={`text-[${themeColor}] hover:text-[#f5c78e]`}
                        onClick={() => toggleFavorite(item)}
                      >
                        <FaTrash size={12} />
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* History with Filter */}
        {history.length > 0 && (
          <motion.div
            className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 sm:p-6 rounded-xl shadow-lg mb-6 border ${darkMode ? "border-gray-700" : "border-gray-200"} hover:shadow-xl transition-shadow duration-300 max-w-3xl mx-auto`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center">
                <FaHistory className={`mr-2 text-[${themeColor}]`} /> {translations[language].recentQueries}
              </h2>
              <motion.button
                className={`text-[${themeColor}] hover:text-[#f5c78e]`}
                whileHover={{ scale: 1.1 }}
                onClick={() => setHistoryCollapsed(!historyCollapsed)}
              >
                {historyCollapsed ? <FaAngleDown /> : <FaAngleUp />}
              </motion.button>
            </div>
            <AnimatePresence>
              {!historyCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <input
                    type="text"
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    placeholder={translations[language].filterHistory}
                    className={`${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-gray-200 text-gray-900 border-gray-300"} w-full p-2 border rounded-lg mb-3 text-xs focus:outline-none focus:ring-2 focus:ring-[${themeColor}]`}
                  />
                  <ul className={`${darkMode ? "text-gray-300" : "text-gray-700"} space-y-2 max-h-40 overflow-y-auto`}>
                    {filteredHistory.map((item, index) => (
                      <li key={index} className={`cursor-pointer hover:text-[${themeColor}] transition-colors flex items-center text-xs`}>
                        {categoryIcons[getQueryCategory(item)] || <FaHistory className={`mr-2 text-[${themeColor}]`} />}
                        {item}
                      </li>
                    ))}
                  </ul>
                  <motion.button
                    className={`mt-3 text-[${themeColor}] flex items-center hover:text-[#f5c78e] transition-colors text-xs`}
                    whileHover={{ scale: 1.05 }}
                    onClick={clearHistory}
                  >
                    <FaTrash className="mr-1" /> {translations[language].clearHistory}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          className={`${darkMode ? "bg-gray-800" : "bg-white"} p-4 sm:p-6 rounded-xl shadow-lg text-center border ${darkMode ? "border-gray-700" : "border-gray-200"} hover:shadow-xl transition-shadow duration-300 max-w-3xl mx-auto`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-3">{translations[language].appTitle}</h2>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mb-3 text-sm`}>
            {translations[language].contact}: <span className={`text-[${themeColor}] font-semibold`}>(123) 456-7890</span>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            <motion.button
              className={`bg-gradient-to-r from-[${themeColor}] to-[#c89666] text-gray-900 py-2 px-4 rounded-lg font-semibold flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 text-sm`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFeedback}
            >
              <FaSmile className="mr-1" /> {translations[language].feedback}
            </motion.button>
            <motion.button
              className={`bg-gradient-to-r from-[${themeColor}] to-[#c89666] text-gray-900 py-2 px-4 rounded-lg font-semibold flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 text-sm`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadAnalytics}
              disabled={exporting}
            >
              {exporting ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} className="mr-1" />
              ) : (
                <FaDownload className="mr-1" />
              )}
              {translations[language].exportAnalytics}
            </motion.button>
          </div>
          <a href="/analytics" className={`text-[${themeColor}] mt-3 inline-block hover:text-[#f5c78e] transition-colors text-sm`}>
            {translations[language].viewAnalytics}
          </a>
        </motion.div>

        {/* Back to Top */}
        <motion.button
          className={`fixed bottom-2 left-2 sm:bottom-4 sm:left-4 bg-[${themeColor}] text-gray-900 p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaArrowUp size={16} />
        </motion.button>
      </motion.div>
    </div>
  );
}