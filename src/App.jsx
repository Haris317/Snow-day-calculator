import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [location, setLocation] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAutoLocation, setIsAutoLocation] = useState(false)

  // Weather API configuration
  const API_KEY = '7f1a3c4e8b9d2f5a6c8e1b4d7a9c2e5f'
  const BASE_URL = 'https://api.openweathermap.org/data/2.5'

  // Fetch weather by coordinates (for auto-location)
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true)
    setError(null)
    setIsAutoLocation(true)

    try {
      // Add minimum loading time for better UX
      const startTime = Date.now()

      const [weatherResponse, forecastResponse, locationResponse] = await Promise.all([
        axios.get(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
        axios.get(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
        axios.get(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`)
      ])

      const locationName = locationResponse.data[0]
        ? `${locationResponse.data[0].name}, ${locationResponse.data[0].state || locationResponse.data[0].country}`
        : `${lat.toFixed(2)}, ${lon.toFixed(2)}`

      const combinedData = {
        current: weatherResponse.data,
        forecast: forecastResponse.data,
        displayLocation: locationName
      }

      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, 2000 - elapsedTime)

      setTimeout(() => {
        setWeatherData(combinedData)
        setLoading(false)
        setIsAutoLocation(false)
      }, remainingTime)

    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Failed to fetch weather data. Please try again.')
      setLoading(false)
      setIsAutoLocation(false)
    }
  }

  // Fetch weather by location name
  const fetchWeather = async (locationQuery) => {
    if (!locationQuery.trim()) return

    setLoading(true)
    setError(null)
    setIsAutoLocation(false)

    try {
      // Add minimum loading time for better UX
      const startTime = Date.now()

      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(`${BASE_URL}/weather?q=${locationQuery}&appid=${API_KEY}&units=metric`),
        axios.get(`${BASE_URL}/forecast?q=${locationQuery}&appid=${API_KEY}&units=metric`)
      ])

      const combinedData = {
        current: weatherResponse.data,
        forecast: forecastResponse.data,
        displayLocation: weatherResponse.data.name + ', ' + weatherResponse.data.sys.country
      }

      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, 2000 - elapsedTime)

      setTimeout(() => {
        setWeatherData(combinedData)
        setLoading(false)
      }, remainingTime)

    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Location not found. Please check the spelling and try again.')
      setLoading(false)
    }
  }

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          fetchWeatherByCoords(latitude, longitude)
        },
        (error) => {
          console.error('Geolocation error:', error)
          setError('Location access denied. Please enter your location manually.')
        }
      )
    } else {
      setError('Geolocation is not supported by this browser.')
    }
  }

  // Auto-fetch location on component mount
  useEffect(() => {
    getUserLocation()
  }, [])

  const handleLocationSubmit = (e) => {
    e.preventDefault()
    fetchWeather(location)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <h1>❄️ Snow Day Calculator</h1>
          </div>
          <p className="subtitle">Get accurate snow day predictions for your area</p>
        </div>
      </header>

      <main className="main-content">
        <div className="search-section">
          <form onSubmit={handleLocationSubmit} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city name or ZIP code..."
                className="search-input"
                disabled={loading}
              />
              <button
                type="submit"
                className="search-button"
                disabled={loading || !location.trim()}
              >
                {loading ? '🔄' : '🔍'}
              </button>
            </div>
          </form>

          <button
            onClick={getUserLocation}
            className="location-button"
            disabled={loading}
          >
            📍 Use My Location
          </button>
        </div>

        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>{isAutoLocation ? 'Getting weather for your location...' : 'Searching for weather data...'}</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>❌ {error}</p>
          </div>
        )}

        {weatherData && <WeatherDisplay weatherData={weatherData} />}
      </main>

      <FAQ />

      <footer className="footer">
        <p>&copy; 2024 Snow Day Calculator. Weather data provided by OpenWeatherMap.</p>
      </footer>
    </div>
  )
}

// Weather Display Component
function WeatherDisplay({ weatherData }) {
  const { current, forecast, displayLocation } = weatherData

  // Calculate snow day probability
  const calculateSnowDayProbability = (weather) => {
    let probability = 0
    const temp = weather.main.temp
    const condition = weather.weather[0].main.toLowerCase()
    const windSpeed = weather.wind?.speed || 0
    const visibility = weather.visibility || 10000

    // Temperature factor (higher chance if below freezing)
    if (temp <= 0) probability += 40
    else if (temp <= 2) probability += 30
    else if (temp <= 5) probability += 20
    else if (temp <= 10) probability += 10

    // Weather condition factor
    if (condition.includes('snow')) probability += 35
    else if (condition.includes('sleet') || condition.includes('freezing')) probability += 30
    else if (condition.includes('rain') && temp <= 2) probability += 25
    else if (condition.includes('storm')) probability += 20

    // Wind factor
    if (windSpeed > 10) probability += 15
    else if (windSpeed > 7) probability += 10

    // Visibility factor
    if (visibility < 1000) probability += 10
    else if (visibility < 5000) probability += 5

    return Math.min(100, Math.max(0, probability))
  }

  const getWeatherIcon = (condition) => {
    const icons = {
      'clear': '☀️',
      'clouds': '☁️',
      'rain': '🌧️',
      'drizzle': '🌦️',
      'thunderstorm': '⛈️',
      'snow': '🌨️',
      'mist': '🌫️',
      'fog': '🌫️',
      'haze': '🌫️'
    }
    return icons[condition.toLowerCase()] || '🌤️'
  }

  const getSnowDayMessage = (probability) => {
    if (probability >= 80) return { text: "Very High - School likely closed!", color: "#dc2626" }
    if (probability >= 60) return { text: "High - Good chance of closure", color: "#ea580c" }
    if (probability >= 40) return { text: "Moderate - Possible closure", color: "#d97706" }
    if (probability >= 20) return { text: "Low - Unlikely closure", color: "#65a30d" }
    return { text: "Very Low - School will be open", color: "#16a34a" }
  }

  const currentProbability = calculateSnowDayProbability(current)
  const snowDayMessage = getSnowDayMessage(currentProbability)

  // Get next 3 days forecast
  const dailyForecasts = []
  const processedDates = new Set()

  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000)
    const dateStr = date.toDateString()

    if (!processedDates.has(dateStr) && dailyForecasts.length < 3) {
      processedDates.add(dateStr)
      dailyForecasts.push({
        date: date,
        weather: item,
        probability: calculateSnowDayProbability(item)
      })
    }
  })

  return (
    <div className="weather-display">
      <div className="current-weather">
        <h2>📍 {displayLocation}</h2>
        <div className="current-stats">
          <div className="temperature">
            <span className="temp-value">{Math.round(current.main.temp)}°C</span>
            <span className="weather-icon">{getWeatherIcon(current.weather[0].main)}</span>
          </div>
          <div className="weather-details">
            <p className="condition">{current.weather[0].description}</p>
            <p className="feels-like">Feels like {Math.round(current.main.feels_like)}°C</p>
          </div>
        </div>

        <div className="snow-day-prediction">
          <h3>❄️ Snow Day Probability</h3>
          <div className="probability-display">
            <div className="probability-circle">
              <span className="probability-number">{currentProbability}%</span>
            </div>
            <p className="probability-message" style={{ color: snowDayMessage.color }}>
              {snowDayMessage.text}
            </p>
          </div>
        </div>
      </div>

      <div className="forecast-section">
        <h3>📅 3-Day Snow Day Forecast</h3>
        <div className="forecast-grid">
          {dailyForecasts.map((day, index) => {
            const dayMessage = getSnowDayMessage(day.probability)
            return (
              <div key={index} className="forecast-card">
                <h4>{day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h4>
                <div className="forecast-weather">
                  <span className="forecast-icon">{getWeatherIcon(day.weather.weather[0].main)}</span>
                  <span className="forecast-temp">{Math.round(day.weather.main.temp)}°C</span>
                </div>
                <div className="forecast-probability">
                  <span className="forecast-percent">{day.probability}%</span>
                  <p className="forecast-message" style={{ color: dayMessage.color }}>
                    {dayMessage.text}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="weather-details-grid">
        <div className="detail-card">
          <h4>🌡️ Temperature</h4>
          <p>High: {Math.round(current.main.temp_max)}°C</p>
          <p>Low: {Math.round(current.main.temp_min)}°C</p>
        </div>
        <div className="detail-card">
          <h4>💨 Wind</h4>
          <p>Speed: {current.wind?.speed || 0} m/s</p>
          <p>Direction: {current.wind?.deg || 0}°</p>
        </div>
        <div className="detail-card">
          <h4>💧 Humidity</h4>
          <p>{current.main.humidity}%</p>
        </div>
        <div className="detail-card">
          <h4>👁️ Visibility</h4>
          <p>{((current.visibility || 10000) / 1000).toFixed(1)} km</p>
        </div>
      </div>
    </div>
  )
}

// FAQ Component
function FAQ() {
  const [openFAQ, setOpenFAQ] = useState(null)

  const faqs = [
    {
      question: "How accurate are the snow day predictions?",
      answer: "Our predictions are based on real-time weather data including temperature, precipitation, wind speed, and visibility. While we use proven meteorological factors, actual school closure decisions depend on local policies and road conditions."
    },
    {
      question: "What factors determine snow day probability?",
      answer: "We consider temperature (especially below freezing), precipitation type and intensity, wind speed, visibility, and weather conditions. Snow, sleet, and freezing rain increase probability significantly."
    },
    {
      question: "Why might schools close even with low probability?",
      answer: "School districts consider factors beyond weather, including road conditions, bus safety, staff availability, and local infrastructure. Rural areas may close more readily than urban areas."
    },
    {
      question: "How often is the data updated?",
      answer: "Weather data is updated in real-time from OpenWeatherMap. We recommend checking again closer to the evening or early morning for the most current predictions."
    },
    {
      question: "Can I check predictions for other locations?",
      answer: "Yes! You can search for any city, town, or ZIP code. Use the search bar or click 'Use My Location' to get predictions for your current area."
    }
  ]

  return (
    <section className="faq-section">
      <h2>❓ Frequently Asked Questions</h2>
      {faqs.map((faq, index) => (
        <div key={index} className="faq-item">
          <button
            className={`faq-question ${openFAQ === index ? 'active' : ''}`}
            onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
          >
            {faq.question}
            <span className="faq-toggle">{openFAQ === index ? '−' : '+'}</span>
          </button>

          {openFAQ === index && (
            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </section>
  )
}

export default App