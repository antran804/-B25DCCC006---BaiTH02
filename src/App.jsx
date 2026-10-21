import React, { useState } from 'react';
import './App.css';


// Danh sách 8 thành phố chuẩn tọa độ theo tài liệu API Open-Meteo
const CITIES = [
  { name: "Hà Nội", lat: 21.0285, lon: 105.8542 },
  { name: "Hải Phòng", lat: 20.8449, lon: 106.6881 },
  { name: "Huế", lat: 16.4637, lon: 107.5909 },
  { name: "Đà Nẵng", lat: 16.0544, lon: 108.2022 },
  { name: "Nha Trang", lat: 12.2388, lon: 109.1967 },
  { name: "Đà Lạt", lat: 11.9404, lon: 108.4583 },
  { name: "TP. Hồ Chí Minh", lat: 10.8231, lon: 106.6297 },
  { name: "Cần Thơ", lat: 10.0452, lon: 105.7469 }
];

export default function App() {
  const [selectedCity, setSelectedCity] = useState(null); 
  const [weatherData, setWeatherData] = useState(null);   
  const [loading, setLoading] = useState(false);         
  const [error, setError] = useState(false);               
  const [unit, setUnit] = useState('C');

  // Khi người dùng tương tác chọn thành phố
  const handleSelectCity = async (city) => {
    setSelectedCity(city);   
    setLoading(true);        
    setError(false);         
    setWeatherData(null);   

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FBangkok&forecast_days=7`
      );

      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu");
      }

      const data = await response.json();
      setWeatherData(data);
      setLoading(false);
    } catch (err) {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="weather-app-container">
      {/* CỘT TRÁI: DANH SÁCH THÀNH PHỐ */}
      <div className="sidebar">
        <h2>Thành phố Việt Nam</h2>
        <ul className="city-list">
          {CITIES.map((city, index) => (
            <li 
              key={index} 
              className={`city-item ${selectedCity?.name === city.name ? 'active' : ''}`}
              onClick={() => handleSelectCity(city)}
            >
              {city.name}
            </li>
          ))}
        </ul>
      </div>

      {/* CỘT PHẢI: NỘI DUNG THỜI TIẾT */}
      <div className="main-content">
        <div className="top-bar">
          <button 
            className="unit-toggle-btn"
            onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
          >
            °C / °F (Đang là: °{unit})
          </button>
        </div>

        <div className="content-display">
          {!selectedCity && !loading && (
            <div className="state-container">
              <p>Vui lòng chọn một thành phố để xem thời tiết.</p>
            </div>
          )}

          {loading && (
            <div className="state-container">
              <p>Đang tải dữ liệu thời tiết của {selectedCity?.name}...</p>
            </div>
          )}

          {error && (
            <div className="state-container error">
              <p>Không thể tải dữ liệu thời tiết. Vui lòng kiểm tra lại mạng!</p>
              <button className="retry-btn" onClick={() => handleSelectCity(selectedCity)}>
                Thử lại
              </button>
            </div>
          )}

          {weatherData && !loading && !error && (
            <>
              <div className="current-weather">
                <h3>{selectedCity.name}</h3>
                <div className="weather-details-grid">
                  <p>
                    Nhiệt độ: <strong>
                      {unit === 'C' 
                        ? `${weatherData.current.temperature_2m}°C` 
                        : `${Math.round(weatherData.current.temperature_2m * 9/5 + 32)}°F`}
                    </strong>
                  </p>
                  <p>Độ ẩm: <strong>{weatherData.current.relative_humidity_2m}%</strong></p>
                  <p>Gió: <strong>{weatherData.current.wind_speed_10m} km/h</strong></p>
                  <p>Mã thời tiết: <strong>{weatherData.current.weather_code}</strong></p>
                </div>
                <p className="update-time">Cập nhật lúc: {weatherData.current.time}</p>
              </div>

              <div className="forecast-section">
                <h4>Dự báo 7 ngày tới</h4>
                <div className="forecast-list">
                  {weatherData.daily.time.map((date, idx) => {
                    const maxTemp = weatherData.daily.temperature_2m_max[idx];
                    const minTemp = weatherData.daily.temperature_2m_min[idx];
        
                    const displayMax = unit === 'C' ? `${maxTemp}°` : `${Math.round(maxTemp * 9/5 + 32)}°`;
                    const displayMin = unit === 'C' ? `${minTemp}°` : `${Math.round(minTemp * 9/5 + 32)}°`;

                    return (
                      <div className="forecast-card" key={idx}>
                        <p>{date}</p>
                        <p>🌤️</p>
                        <p><strong>{displayMax} / {displayMin}</strong></p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}