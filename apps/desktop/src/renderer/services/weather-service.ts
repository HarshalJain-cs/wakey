/**
 * @fileoverview Weather Widget Service
 * 
 * Fetches weather data from OpenWeatherMap API (free tier: 1000 calls/day)
 * Provides current conditions and forecast for productivity context.
 */

export interface WeatherData {
    location: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    description: string;
    icon: string;
    windSpeed: number;
    sunrise: Date;
    sunset: Date;
}

export interface WeatherForecast {
    date: Date;
    tempHigh: number;
    tempLow: number;
    description: string;
    icon: string;
}

export interface WeatherConfig {
    enabled: boolean;
    apiKey: string | null;
    location: string;
    units: 'metric' | 'imperial';
}

// Weather icon to emoji mapping
const WEATHER_ICONS: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
};

class WeatherService {
    private config: WeatherConfig;
    private currentWeather: WeatherData | null = null;
    private forecast: WeatherForecast[] = [];
    private lastFetch: Date | null = null;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): WeatherConfig {
        try {
            const stored = localStorage.getItem('wakey_weather');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load weather config:', error);
        }

        return {
            enabled: true,
            apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || null,
            location: 'New York',
            units: 'metric',
        };
    }

    private saveConfig(): void {
        localStorage.setItem('wakey_weather', JSON.stringify(this.config));
    }

    /**
     * Check if weather is configured
     */
    isConfigured(): boolean {
        return this.config.enabled && !!this.config.apiKey;
    }

    /**
     * Fetch current weather
     */
    async fetchWeather(): Promise<WeatherData | null> {
        // Check cache (don't fetch more than once per 10 minutes)
        if (this.lastFetch && this.currentWeather) {
            const timeSinceLastFetch = Date.now() - this.lastFetch.getTime();
            if (timeSinceLastFetch < 10 * 60 * 1000) {
                return this.currentWeather;
            }
        }

        if (!this.config.apiKey) {
            // Return demo data
            return this.getDemoWeather();
        }

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(this.config.location)}&units=${this.config.units}&appid=${this.config.apiKey}`
            );

            if (!response.ok) {
                throw new Error('Weather API request failed');
            }

            const data = await response.json();

            this.currentWeather = {
                location: data.name,
                temperature: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                humidity: data.main.humidity,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                windSpeed: data.wind.speed,
                sunrise: new Date(data.sys.sunrise * 1000),
                sunset: new Date(data.sys.sunset * 1000),
            };

            this.lastFetch = new Date();
            return this.currentWeather;
        } catch (error) {
            console.error('Failed to fetch weather:', error);
            return this.getDemoWeather();
        }
    }

    /**
     * Get demo weather data
     */
    private getDemoWeather(): WeatherData {
        const now = new Date();
        const sunrise = new Date(now);
        sunrise.setHours(6, 30, 0, 0);
        const sunset = new Date(now);
        sunset.setHours(18, 45, 0, 0);

        return {
            location: this.config.location || 'Demo City',
            temperature: 22,
            feelsLike: 21,
            humidity: 65,
            description: 'partly cloudy',
            icon: '02d',
            windSpeed: 3.5,
            sunrise,
            sunset,
        };
    }

    /**
     * Get weather emoji
     */
    getWeatherEmoji(iconCode: string): string {
        return WEATHER_ICONS[iconCode] || '🌤️';
    }

    /**
     * Get current weather
     */
    getCurrentWeather(): WeatherData | null {
        return this.currentWeather;
    }

    /**
     * Get productivity tip based on weather
     */
    getProductivityTip(): string {
        if (!this.currentWeather) {
            return 'Check the weather to optimize your day!';
        }

        const { temperature, description, icon } = this.currentWeather;

        // Rainy weather
        if (icon.includes('09') || icon.includes('10')) {
            return '🌧️ Rainy day - perfect for deep focus work indoors!';
        }

        // Sunny and nice
        if (icon === '01d' && temperature >= 18 && temperature <= 26) {
            return '☀️ Beautiful day! Consider a walking meeting or outdoor break.';
        }

        // Very hot
        if (temperature > 30) {
            return '🔥 Hot day - stay hydrated and take more breaks!';
        }

        // Cold
        if (temperature < 5) {
            return '❄️ Cold outside - cozy up with some focused work!';
        }

        // Cloudy
        if (icon.includes('03') || icon.includes('04')) {
            return '☁️ Overcast day - great for screen work, less glare!';
        }

        return `Current: ${temperature}° - ${description}`;
    }

    /**
     * Update configuration
     */
    updateConfig(updates: Partial<WeatherConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
        this.currentWeather = null; // Force refetch
    }

    /**
     * Get configuration
     */
    getConfig(): WeatherConfig {
        return { ...this.config };
    }
}

export const weatherService = new WeatherService();
export default weatherService;
