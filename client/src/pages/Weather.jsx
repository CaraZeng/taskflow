import { useState } from "react";

const WMO_CODES = {
  0:"Clear sky", 1:"Mainly clear", 2:"Partly cloudy", 3:"Overcast",
  45:"Foggy", 48:"Icy fog", 51:"Light drizzle", 53:"Drizzle", 55:"Heavy drizzle",
  61:"Slight rain", 63:"Rain", 65:"Heavy rain", 71:"Slight snow", 73:"Snow", 75:"Heavy snow",
  80:"Rain showers", 81:"Rain showers", 82:"Violent rain showers",
  95:"Thunderstorm", 96:"Thunderstorm with hail", 99:"Thunderstorm with heavy hail",
};

const WMO_ICON = {
  0:"☀️", 1:"🌤", 2:"⛅️", 3:"☁️", 45:"🌫", 48:"🌫",
  51:"🌦", 53:"🌧", 55:"🌧", 61:"🌧", 63:"🌧", 65:"🌧",
  71:"🌨", 73:"❄️", 75:"❄️", 80:"🌦", 81:"🌦", 82:"⛈",
  95:"⛈", 96:"⛈", 99:"⛈",
};

export default function Weather() {
  const [city, setCity]     = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const fetchWeather = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true); setError(null); setWeather(null);
    try {
      // Step 1: geocode city name
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();
      if (!geoData.results?.length) throw new Error(`City "${city}" not found.`);
      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: fetch weather
      const wxRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m`
      );
      const wxData = await wxRes.json();
      const c = wxData.current;
      setWeather({
        city: `${name}, ${country}`,
        temp: Math.round(c.temperature_2m),
        code: c.weather_code,
        wind: Math.round(c.wind_speed_10m),
        humidity: c.relative_humidity_2m,
      });
    } catch (err) {
      setError(err.message || "Failed to fetch weather.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth:480 }}>
      <h1 style={{ fontSize:"1.5rem", marginBottom:"0.5rem" }}>🌤 Weather Check</h1>
      <p style={{ color:"var(--text-secondary)", marginBottom:"1.5rem", fontSize:"0.95rem" }}>
        Check the weather before planning your tasks. Powered by{" "}
        <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a> (free, no API key).
      </p>

      <form onSubmit={fetchWeather} style={{ display:"flex", gap:"0.75rem", marginBottom:"1.5rem" }}>
        <input
          type="text"
          placeholder="Enter a city name…"
          value={city}
          onChange={e => setCity(e.target.value)}
          aria-label="City name"
          required
        />
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ flexShrink:0 }}>
          {loading ? "…" : "Search"}
        </button>
      </form>

      {loading && (
        <div className="spinner-wrap" aria-busy="true">
          <div className="spinner" />
          <p style={{ marginTop:"0.75rem" }}>Fetching weather…</p>
        </div>
      )}

      {error && (
        <div className="error-state" role="alert">
          <p>⚠️ {error}</p>
        </div>
      )}

      {weather && (
        <div className="card" style={{ textAlign:"center" }}>
          <p style={{ fontSize:"0.9rem", color:"var(--text-secondary)", marginBottom:"0.5rem" }}>{weather.city}</p>
          <div style={{ fontSize:"4rem", lineHeight:1 }}>{WMO_ICON[weather.code] || "🌡"}</div>
          <p style={{ fontSize:"3rem", fontWeight:700, margin:"0.5rem 0" }}>{weather.temp}°C</p>
          <p style={{ fontSize:"1.1rem", color:"var(--text-secondary)", marginBottom:"1rem" }}>
            {WMO_CODES[weather.code] || "Unknown"}
          </p>
          <div style={{ display:"flex", justifyContent:"center", gap:"2rem", fontSize:"0.9rem", color:"var(--text-secondary)" }}>
            <span>💨 {weather.wind} km/h</span>
            <span>💧 {weather.humidity}%</span>
          </div>
        </div>
      )}
    </div>
  );
}