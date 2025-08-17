
# ❄️ Snow Day Calculator

A modern, responsive React application that predicts snow days based on real-time weather data. Built with React, Vite, and the OpenWeatherMap API.

## 🌟 Features

- **Real-time Weather Data**: Fetches current weather conditions using OpenWeatherMap API
- **Snow Day Predictions**: Intelligent algorithm that analyzes temperature, precipitation, and weather patterns
- **Beautiful UI**: Modern design with gradient animations and smooth transitions
- **Weather Icons**: Visual weather icons for each hourly forecast
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive FAQ**: Expandable FAQ section with common questions
- **Loading Animation**: Beautiful snowflake loading animation
- **Location Search**: Search by city name or ZIP code

## 🚀 Live Demo

https://haris317.github.io/Snow-day-calculator/

## 🛠️ Technologies Used

- **React 19.1.1** - Frontend framework
- **Vite** - Build tool and development server
- **Axios** - HTTP client for API requests
- **OpenWeatherMap API** - Weather data provider
- **CSS3** - Modern styling with gradients and animations
- **ESLint** - Code linting and formatting

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/snow-day-calculator.git
cd snow-day-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Get your OpenWeatherMap API key:
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Get your API key

4. Update the API key in `src/App.jsx`:
```javascript
const API_KEY = 'your_api_key_here'
```

5. Start the development server:
```bash
npm run dev
```

## 🎯 How It Works

1. **Enter Location**: Type in your city name or ZIP code
2. **Weather Analysis**: The app fetches 5-day weather forecast data
3. **Snow Day Prediction**: Algorithm analyzes:
   - Temperature patterns
   - Precipitation type and intensity
   - Weather conditions
   - Seasonal factors
4. **Results Display**: Shows prediction probability with detailed hourly forecasts

## 🌨️ Prediction Algorithm

The snow day calculator considers multiple factors:

- **High Chance**: Snow conditions with temperatures below 2°C
- **Medium Chance**: Snow with temperatures below 5°C or heavy rain with freezing temperatures
- **Low Chance**: Extreme cold conditions below -10°C
- **No Chance**: Clear weather or off-season conditions

## 📱 Screenshots

[Add screenshots of your application here]

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Weather data provided by [OpenWeatherMap](https://openweathermap.org)
- Icons and emojis for visual enhancement
- React and Vite communities for excellent documentation

## 📞 Contact

Haris - [haris@example.com]
Project Link: [https://github.com/Haris317/Snow-day-calculator]
