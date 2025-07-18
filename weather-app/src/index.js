/**
 * Welcome to the Single-File Weather App on Cloudflare Workers!
 *
 * This updated version includes more detailed weather metrics and an improved UI.
 *
 * - The `handleRequest` function is the main entry point.
 * - It routes requests:
 * - `/weather?city=...` is handled by `handleApiRequest` to fetch weather data.
 * - All other requests (e.g., `/`) are handled by `handleFrontendRequest` to serve the HTML page.
 * - The API key is securely fetched from Worker secrets (`env.OPENWEATHER_API_KEY`).
 */

export default {
  async fetch(request, env) {
    return await handleRequest(request, env);
  },
};

async function handleRequest(request, env) {
  const url = new URL(request.url);

  if (url.pathname.startsWith('/weather')) {
    return handleApiRequest(request, env);
  }

  return handleFrontendRequest();
}

/**
 * Handles the API request to OpenWeatherMap.
 * @param {Request} request The incoming request
 * @param {object} env The environment variables, including secrets
 */
async function handleApiRequest(request, env) {
  const url = new URL(request.url);
  const city = url.searchParams.get('city');

  if (!city) {
    return new Response(JSON.stringify({ error: 'City not provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = env.OPENWEATHER_API_KEY;
  if (!apiKey) {
     return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const weatherResponse = await fetch(apiUrl);
    const weatherData = await weatherResponse.json();

    if (weatherResponse.status !== 200) {
      return new Response(JSON.stringify({ error: weatherData.message || 'City not found' }), {
        status: weatherResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract the expanded data to send to the client
    const simplifiedData = {
      city: weatherData.name,
      country: weatherData.sys.country,
      temperature: weatherData.main.temp,
      feels_like: weatherData.main.feels_like,
      temp_min: weatherData.main.temp_min,
      temp_max: weatherData.main.temp_max,
      humidity: weatherData.main.humidity,
      wind_speed: weatherData.wind.speed,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      sunrise: weatherData.sys.sunrise,
      sunset: weatherData.sys.sunset,
    };

    return new Response(JSON.stringify(simplifiedData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch weather data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Serves the entire frontend application as a single HTML response.
 */
function handleFrontendRequest() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weather Worker</title>
        <style>
            :root {
                --bg-color: #121212;
                --card-color: #1e1e1e;
                --primary-text: #e0e0e0;
                --secondary-text: #b0b0b0;
                --accent-color: #03dac6;
                --border-color: #2c2c2c;
                --error-color: #cf6679;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background-color: var(--bg-color);
                color: var(--primary-text);
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                padding: 1rem;
            }
            .container {
                width: 100%;
                max-width: 420px;
                padding: 2rem;
                background-color: var(--card-color);
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                border: 1px solid var(--border-color);
                text-align: center;
            }
            h1 {
                font-size: 2rem;
                margin: 0;
            }
            .subtitle {
                font-size: 1rem;
                color: var(--secondary-text);
                margin-top: 0.25rem;
                margin-bottom: 2rem;
            }
            .search-form {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }
            #city-input {
                flex-grow: 1;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--border-color);
                background-color: var(--bg-color);
                color: var(--primary-text);
                font-size: 1rem;
                outline: none;
                transition: border-color 0.2s;
            }
            #city-input:focus {
                border-color: var(--accent-color);
            }
            button {
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                border: none;
                background-color: var(--accent-color);
                color: #000;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            button:hover {
                background-color: #018786;
            }
            .weather-result {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.5s ease, transform 0.5s ease;
            }
            .weather-result.visible {
                opacity: 1;
                transform: translateY(0);
            }
            .main-info {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                margin-bottom: 2rem;
            }
            .main-text {
                text-align: left;
            }
            .city-name {
                font-size: 2rem;
                font-weight: 500;
            }
            .description {
                font-size: 1.1rem;
                color: var(--secondary-text);
                text-transform: capitalize;
            }
            .weather-icon {
                width: 80px;
                height: 80px;
            }
            .temperature {
                font-size: 4rem;
                font-weight: bold;
                line-height: 1;
            }
            .temp-minmax {
                font-size: 1rem;
                color: var(--secondary-text);
            }
            .weather-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                text-align: left;
                padding-top: 1.5rem;
                border-top: 1px solid var(--border-color);
            }
            .detail-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .detail-icon {
                width: 24px;
                height: 24px;
                fill: var(--secondary-text);
            }
            .detail-text .label {
                font-size: 0.8rem;
                color: var(--secondary-text);
                text-transform: uppercase;
            }
            .detail-text .value {
                font-size: 1.1rem;
                font-weight: 500;
            }
            .message {
                color: var(--secondary-text);
                margin-top: 1rem;
            }
            .error {
                color: var(--error-color);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Weather Now</h1>
            <p class="subtitle">Get current weather conditions in any city of the world</p>
            <form id="weather-form" class="search-form">
                <input type="text" id="city-input" placeholder="Enter a city name" required>
                <button type="submit">Go</button>
            </form>
            <div id="weather-result">
                 <div id="message-display" class="message">
                    Weather details will appear here.
                 </div>
            </div>
        </div>

        <script>
            const form = document.getElementById('weather-form');
            const cityInput = document.getElementById('city-input');
            const weatherResultDiv = document.getElementById('weather-result');
            const messageDisplay = document.getElementById('message-display');

            // SVG Icons for details
            const icons = {
                feels_like: \`<svg class="detail-icon" viewBox="0 0 24 24"><path d="M12 4a4 4 0 100 8 4 4 0 000-8zm0 1.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm-2 12.5h4v5h-4zM9 13h6v1H9zm0 2h6v1H9zm-2-4a5.5 5.5 0 1011 0V7a5.5 5.5 0 00-11 0z"></path></svg>\`,
                humidity: \`<svg class="detail-icon" viewBox="0 0 24 24"><path d="M12 2a9 9 0 00-9 9c0 2.39 1.41 4.7 4 6.39V20a1 1 0 001 1h4a1 1 0 001-1v-2.61c2.59-1.69 4-4 4-6.39a9 9 0 00-9-9zm-2 15h4v1h-4zm0 2h4v1h-4z"></path></svg>\`,
                wind_speed: \`<svg class="detail-icon" viewBox="0 0 24 24"><path d="M12 12H3m9-5h6M3 7h3m0 10H3"></path><path d="M12 12c-2.5 0-4.5 2-4.5 4.5S9.5 21 12 21s4.5-2 4.5-4.5S14.5 12 12 12z"></path></svg>\`,
                sunrise: \`<svg class="detail-icon" viewBox="0 0 24 24"><path d="M4 18h16M4 12h1m14 0h1m-1-5l-1-1M6 7L5 6m7-3v3m0 11l-4 4h8l-4-4z"></path></svg>\`,
                sunset: \`<svg class="detail-icon" viewBox="0 0 24 24"><path d="M4 18h16m-8 3v-3M4 12h1m14 0h1m-1-5l-1-1M6 7L5 6m7 8l-4-4h8l-4 4z"></path></svg>\`
            };

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const city = cityInput.value.trim();
                if (!city) return;

                weatherResultDiv.classList.remove('visible');
                weatherResultDiv.innerHTML = \`<div id="message-display" class="message">Fetching weather...</div>\`;

                try {
                    const response = await fetch(\`/weather?city=\${encodeURIComponent(city)}\`);
                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || 'Something went wrong');
                    }
                    
                    displayWeatherData(data);

                } catch (error) {
                    weatherResultDiv.innerHTML = \`<div id="message-display" class="message error">Error: \${error.message}</div>\`;
                } finally {
                    weatherResultDiv.classList.add('visible');
                }
            });

            function displayWeatherData(data) {
                const iconUrl = \`https://openweathermap.org/img/wn/\${data.icon}@2x.png\`;

                const formatTime = (timestamp) => {
                    const date = new Date(timestamp * 1000);
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                };
                
                const weatherInfoHTML = \`
                    <div class="main-info">
                        <img src="\${iconUrl}" alt="\${data.description}" class="weather-icon">
                        <div class="main-text">
                           <div class="temperature">\${Math.round(data.temperature)}&deg;</div>
                           <h2 class="city-name">\${data.city}, \${data.country}</h2>
                           <div class="description">\${data.description}</div>
                        </div>
                    </div>
                    
                    <div class="weather-details">
                        <div class="detail-item">
                            \${icons.feels_like}
                            <div class="detail-text">
                                <div class="label">Feels Like</div>
                                <div class="value">\${Math.round(data.feels_like)}&deg;C</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            \${icons.humidity}
                            <div class="detail-text">
                                <div class="label">Humidity</div>
                                <div class="value">\${data.humidity}%</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            \${icons.wind_speed}
                            <div class="detail-text">
                                <div class="label">Wind Speed</div>
                                <div class="value">\${data.wind_speed.toFixed(1)} m/s</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon" style="text-align:center; font-weight: bold;">H/L</span>
                             <div class="detail-text">
                                <div class="label">High / Low</div>
                                <div class="value">\${Math.round(data.temp_max)}&deg; / \${Math.round(data.temp_min)}&deg;</div>
                            </div>
                        </div>
                         <div class="detail-item">
                            \${icons.sunrise}
                            <div class="detail-text">
                                <div class="label">Sunrise</div>
                                <div class="value">\${formatTime(data.sunrise)}</div>
                            </div>
                        </div>
                         <div class="detail-item">
                            \${icons.sunset}
                            <div class="detail-text">
                                <div class="label">Sunset</div>
                                <div class="value">\${formatTime(data.sunset)}</div>
                            </div>
                        </div>
                    </div>
                \`;
                weatherResultDiv.innerHTML = weatherInfoHTML;
            }
        </script>
    </body>
    </html>
  `;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}