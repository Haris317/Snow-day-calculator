import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import Logo from './components/Logo'

function App() {
  const [location, setLocation] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // OpenWeatherMap API key - you'll need to get your own from openweathermap.org
  const API_KEY = '0bb10a966d4e894fff91f902a48cf629'

  const fetchWeatherByCoords = async (lat, lon, locationName = null) => {
    setLoading(true)
    setError(null)

    try {
      // Add minimum 2-second loading time for better UX
      const startTime = Date.now()

      // Get weather forecast
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      )

      // If no location name provided, get it from reverse geocoding
      let displayLocation = locationName
      if (!displayLocation) {
        try {
          const reverseGeoResponse = await axios.get(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
          )
          if (reverseGeoResponse.data.length > 0) {
            const locationData = reverseGeoResponse.data[0]
            displayLocation = locationData.name + (locationData.state ? `, ${locationData.state}` : '') + (locationData.country ? `, ${locationData.country}` : '')
          } else {
            displayLocation = `${lat.toFixed(2)}, ${lon.toFixed(2)}`
          }
        } catch (geoErr) {
          displayLocation = `${lat.toFixed(2)}, ${lon.toFixed(2)}`
        }
      }

      // Ensure minimum 2-second loading time
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, 2000 - elapsedTime)

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      }

      setWeatherData({ ...weatherResponse.data, displayLocation })
    } catch (err) {
      // Ensure minimum 2-second loading time even for errors
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, 2000 - elapsedTime)

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      }

      if (err.response?.status === 401) {
        setError('❌ Invalid API key. Please check your OpenWeatherMap API key and make sure it\'s activated.')
      } else {
        setError(err.message)
      }
      console.error('Weather fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeather = async (locationName) => {
    setLoading(true)
    setError(null)

    try {
      // Add minimum 2-second loading time for better UX
      const startTime = Date.now()

      // Get coordinates for the location
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${locationName}&limit=1&appid=${API_KEY}`
      )

      if (geoResponse.data.length === 0) {
        throw new Error('Location not found')
      }

      const { lat, lon, name, state, country } = geoResponse.data[0]
      const displayLocation = name + (state ? `, ${state}` : '') + (country ? `, ${country}` : '')

      // Get weather forecast
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      )

      // Ensure minimum 2-second loading time
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, 2000 - elapsedTime)

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      }

      setWeatherData({ ...weatherResponse.data, displayLocation })
    } catch (err) {
      // Ensure minimum 2-second loading time even for errors
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, 2000 - elapsedTime)

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      }

      if (err.response?.status === 401) {
        setError('❌ Invalid API key. Please check your OpenWeatherMap API key and make sure it\'s activated.')
      } else {
        setError(err.message)
      }
      console.error('Weather fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-detect user's location on component mount
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        setLoading(true)
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords
              await fetchWeatherByCoords(latitude, longitude)
            } catch (err) {
              console.error('Error fetching weather for current location:', err)
              setError('Unable to fetch weather for your current location')
              setLoading(false)
            }
          },
          (error) => {
            console.error('Geolocation error:', error)
            setLoading(false)
            // Don't show error for geolocation denial, just leave the app ready for manual input
          },
          {
            timeout: 10000,
            enableHighAccuracy: true,
            maximumAge: 300000 // 5 minutes
          }
        )
      }
    }

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
            <Logo size={50} />
            <h1>Snow Day Calculator</h1>
          </div>
          <form onSubmit={handleLocationSubmit} className="location-form">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city name or ZIP code"
              className="location-input"
            />
            <button type="submit" className="get-weather-btn">
              Get Weather
            </button>
          </form>
        </div>
      </header>

      <main className="main-content">
        {loading && (
          <div className="loading">
            <div className="loading-content">
              <div className="snowflake-loader">
                <div className="snowflake">❄️</div>
              </div>
              <div className="loading-text">
                <h3>{location ? 'Fetching Weather Data' : 'Detecting Your Location'}</h3>
                <p>{location ? 'Analyzing conditions for snow day predictions...' : 'Getting weather forecast for your area...'}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error">
            {error === 'Please add your OpenWeatherMap API key to use this feature' ? (
              <div>
                <p>{error}</p>
                <p>Get your free API key at: <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer">openweathermap.org</a></p>
              </div>
            ) : (
              <p>Error: {error}</p>
            )}
          </div>
        )}

        {weatherData && <WeatherDisplay weatherData={weatherData} />}

        {!weatherData && !loading && !error && (
          <div className="placeholder">
            <p>🌨️ Enter a location to check snow day predictions!</p>
            <p style={{fontSize: '0.9rem', color: '#64748b', marginTop: '1rem'}}>
              💡 Allow location access for automatic weather detection
            </p>
          </div>
        )}
      </main>

      <FAQ />

      <footer className="footer">
        <p>© 2025 Snow Day Calculator. All rights reserved.</p>
        <p>Weather data provided by <a href="https://openweathermap.org" target="_blank" rel="noopener noreferrer">OpenWeatherMap</a></p>
        <p>Today is {new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}, {new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}</p>
        <p>💡 Tip: Check the forecast regularly for the most accurate predictions!</p>
      </footer>
    </div>
  )
}

// Weather Display Component
function WeatherDisplay({ weatherData }) {
  const groupForecastByDay = (list) => {
    const grouped = {}

    list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(item)
    })

    return grouped
  }

  const getSnowDayPrediction = (dayForecasts) => {
    const hasSnow = dayForecasts.some(forecast =>
      forecast.weather[0].main.toLowerCase().includes('snow') ||
      forecast.weather[0].description.toLowerCase().includes('snow')
    )

    const hasHeavyRain = dayForecasts.some(forecast =>
      forecast.weather[0].description.toLowerCase().includes('heavy rain')
    )

    const lowTemp = Math.min(...dayForecasts.map(f => f.main.temp))
    const avgTemp = dayForecasts.reduce((sum, f) => sum + f.main.temp, 0) / dayForecasts.length

    if (hasSnow && lowTemp < 2) {
      return { emoji: '❄️', message: 'High chance of snow day!', probability: 'High', className: 'high-chance' }
    } else if (hasSnow && avgTemp < 5) {
      return { emoji: '🌨️', message: 'Possible snow day - monitor conditions', probability: 'Medium', className: 'medium-chance' }
    } else if (hasHeavyRain && lowTemp < 0) {
      return { emoji: '🧊', message: 'Possible ice day - be cautious', probability: 'Medium', className: 'medium-chance' }
    } else if (lowTemp < -10) {
      return { emoji: '🥶', message: 'Extreme cold - possible closure', probability: 'Low', className: 'low-chance' }
    } else {
      const currentMonth = new Date().getMonth()
      const isWinterSeason = currentMonth >= 11 || currentMonth <= 2 // Dec, Jan, Feb

      if (!isWinterSeason) {
        return { emoji: '🌞', message: "It's off-season. No snow day expected.", probability: 'None', className: 'no-chance' }
      } else {
        return { emoji: '🌤️', message: 'No snow day expected', probability: 'None', className: 'no-chance' }
      }
    }
  }

  const groupedForecasts = groupForecastByDay(weatherData.list)
  const days = Object.keys(groupedForecasts).slice(0, 3) // Show 3 days

  return (
    <div className="weather-display">
      <h2>Weather Forecast for {weatherData.displayLocation || 'Your Location'}</h2>

      {days.map(day => {
        const dayForecasts = groupedForecasts[day]
        const prediction = getSnowDayPrediction(dayForecasts)
        const dayName = new Date(day).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })

        return (
          <div key={day} className={`day-forecast ${prediction.className}`}>
            <div className="day-header">
              <h3 className="prediction-message">
                <span className="prediction-emoji">{prediction.emoji}</span>
                {prediction.message}
                <span className={`probability-badge ${prediction.className}`}>
                  {prediction.probability}
                </span>
              </h3>
              <h4>{dayName}</h4>
            </div>

            <div className="hourly-forecasts">
              {dayForecasts.map(forecast => {
                const time = new Date(forecast.dt * 1000).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })
                const temp = Math.round(forecast.main.temp)
                const description = forecast.weather[0].description
                const weatherMain = forecast.weather[0].main.toLowerCase()
                const weatherDesc = description.toLowerCase()

                // Get weather icon based on conditions
                const getWeatherIcon = () => {
                  if (weatherDesc.includes('snow') || weatherMain === 'snow') return '❄️'
                  if (weatherDesc.includes('rain') || weatherMain === 'rain') return '🌧️'
                  if (weatherDesc.includes('drizzle')) return '🌦️'
                  if (weatherDesc.includes('thunderstorm') || weatherDesc.includes('storm')) return '⛈️'
                  if (weatherDesc.includes('mist') || weatherDesc.includes('fog')) return '🌫️'
                  if (weatherDesc.includes('clear')) return '☀️'
                  if (weatherDesc.includes('cloud')) {
                    if (weatherDesc.includes('few') || weatherDesc.includes('scattered')) return '⛅'
                    if (weatherDesc.includes('broken') || weatherDesc.includes('overcast')) return '☁️'
                    return '🌤️'
                  }
                  return '🌤️' // default
                }

                return (
                  <div key={forecast.dt} className="hourly-item">
                    <div className="hourly-time">{time}</div>
                    <div className="hourly-icon">{getWeatherIcon()}</div>
                    <div className="hourly-temp">{temp}°C</div>
                    <div className="hourly-desc">{description}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// FAQ Component
function FAQ() {
  const [openFAQ, setOpenFAQ] = useState(null)

  const faqs = [
    {
      question: "What is a Snow Day Calculator?",
      answer: "A snow day calculator is a tool that predicts school closures due to weather conditions. It analyzes temperature, precipitation, and weather patterns to estimate the likelihood of snow days in your area."
    },
    {
      question: "How accurate is the snow day calculator?",
      answer: "The snow day calculator uses real-time weather data and historical patterns to make predictions. While we strive for accuracy, actual school closure decisions depend on local school district policies and road conditions."
    },
    {
      question: "Can I check snow days by region?",
      answer: "Yes, you can predict snow days for your area by entering your ZIP code or city name. The calculator will provide location-specific weather forecasts and snow day predictions."
    },
    {
      question: "Is there a difference between Snow Day Calculator and Snow Day Predictor?",
      answer: "Both refer to the same concept, but tools vary in accuracy and data sources. Our calculator uses OpenWeatherMap data and considers multiple weather factors for comprehensive predictions."
    },
    {
      question: "Where can I use the snow day calculator online?",
      answer: "Our snow day calculator works for multiple regions including rural, urban, and suburban schools. Simply enter your location to get personalized predictions for your area."
    }
  ]

  return (
    <section className="faq-section">
      <h2>Snow Day Calculator FAQs</h2>

      {faqs.map((faq, index) => (
        <div key={index} className="faq-item">
          <button
            className="faq-question"
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
