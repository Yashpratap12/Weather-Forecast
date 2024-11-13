// API key for the weather API
const apiKey = "c3d1cab6249d4373bc3131136240608";

// Selecting various HTML elements for user input and displaying weather information
const userInput = document.querySelector("#input-location"); // Input field for city name
const submit = document.querySelector("#submit"); // Submit button
const displayCity = document.querySelector("#display-city"); // Element to display city name
const displaytemp = document.querySelector("#temperature"); // Element to display temperature
const displaycountry = document.querySelector("#display-country"); // Element to display country name
const displaylat = document.querySelector("#lat"); // Element to display latitude
const displaylong = document.querySelector("#long"); // Element to display longitude
const displaypressure = document.querySelector("#display-pressure"); // Element to display pressure
const displaywind = document.querySelector("#display-wind"); // Element to display wind speed
const displayhumidity = document.querySelector("#display-humidity"); // Element to display humidity
const displayheat = document.querySelector("#display-heat"); // Element to display heat index
const displaycondition = document.querySelector("#display-condition"); // Element to display weather condition
const currentLocation = document.querySelector("#current-locate"); // Button to get current location
const icons = document.querySelector("#icon-img"); // Image element to display weather icon
const displays = document.querySelector(".display-section"); // Section to display weather data
const dropdown = document.querySelector("#recent-searches"); // Dropdown for recent searches
const forecastdate = document.querySelectorAll(".forecast-date");

// Function to load recent city searches from local storage
const loadRecentSearches = () => {
  // Get recent cities from local storage or initialize an empty array
  const recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

  // Populate the dropdown with recent cities
  recentCities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city; // Set value of option to city name
    option.textContent = city; // Set displayed text to city name
    dropdown.appendChild(option); // Append option to dropdown
  });

  // Show the dropdown if there are recent cities
  if (recentCities.length > 0) {
    dropdown.style.display = "block";
  }
};

// Function to save a city to recent searches in local storage
const saveCity = (city) => {
  const recentCities = JSON.parse(localStorage.getItem("recentCities")) || []; // Get existing cities
  // Add city if it's not already in the list
  if (!recentCities.includes(city)) {
    recentCities.push(city);
    localStorage.setItem("recentCities", JSON.stringify(recentCities)); // Save updated list
  }
};

// Function to fetch and display weather data based on city name or coordinates
const weatherOperation = (lat, lon) => {
  let query;
  // Determine the query based on user input or coordinates
  if (userInput.value) {
    query = userInput.value;
  } else if (lat && lon) {
    query = `${lat},${lon}`;
  } else {
    alert("Please provide a city name or allow location access...");
    return; // Exit if no valid query
  }

  // Fetch weather data from the API
  fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}`)
    .then((response) => {
      // Check if the response is okay
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json(); // Parse JSON response
    })
    .then((data) => {
      // Extract relevant data from the response
      const location = data.location.name;
      const country = data.location.country;
      const latitude = data.location.lat;
      const longitude = data.location.lon;
      const displayIcon = data.current.condition.icon; // Icon URL
      const temperature = data.current.temp_c;
      const pressure = data.current.pressure_mb;
      const humidity = data.current.humidity;
      const wind = data.current.wind_kph;
      const heat = data.current.heatindex_c;
      const condition = data.current.condition.text;

      // Update HTML elements with the fetched data
      displayCity.innerHTML = location;
      displaycountry.innerHTML = country;
      icons.src = `https:${displayIcon}`; // Set icon source
      displaylat.innerHTML = `Latitude: ${latitude}° `;
      displaylong.innerHTML = `Longitude: ${longitude}° `;
      displaytemp.innerText = `${temperature}°C `;
      displaypressure.innerText = `${pressure} mb `;
      displayheat.innerText = `${heat}°C `;
      displaycondition.innerText = condition;
      displaywind.innerText = `${wind} kmph `;
      displayhumidity.innerText = `${humidity}% `;
      displays.style.display = "inline"; // Show the weather display section
      userInput.value = ""; // Clear user input

      const forecastIcons = document.querySelectorAll(".forecast-icon"); // Select all icon elements

      for (
        let i = 0;
        i < forecastIcons.length &&
        i < data.forecast.forecastday[0].hour.length;
        i++
      ) {
        const iconlogo =
          data.forecast.forecastday[0].hour[i + 4].condition.icon;
        forecastIcons[i].src = `https:${iconlogo}`; // Set the src for each icon element
      }

      const forecasttemp = document.querySelectorAll(".forecast-temp");
      const hourData = data.forecast.forecastday[0].hour;
      for (let i = 0; i < forecasttemp.length && i < hourData.length; i++) {
        const temp = hourData[i].temp_c;
        forecasttemp[i].innerHTML = `Temperature : ${temp}°C`;
      }

      const forecasthumidity = document.querySelectorAll(".forecast-humidity");
      const humidityData = data.forecast.forecastday[0].hour;
      for (let i = 0; i < forecasttemp.length && i < humidityData.length; i++) {
        const humid = humidityData[i].humidity;
        forecasthumidity[i].innerHTML = `Humidity :  ${humid}%`;
      }

      // Get 5 forecast's date
      const today = new Date();
      forecastdate.forEach((datelement, index) => {
        const futureDate = new Date(today); // Clone the current date
        futureDate.setDate(today.getDate() + index); // Set the date to today + index
        const day = futureDate.getDate();
        const month = futureDate.getMonth() + 1; // Months are 0-based, so add 1
        const year = futureDate.getFullYear();
        // Set the innerHTML of each date element
        datelement.innerHTML = `${day}/${month}/${year}`;
      });

      // Save the city to recent searches and update the dropdown
      saveCity(location);
      updateDropdown(location);
    })
    .catch((error) => {
      console.log(error);
      alert("Error fetching data..."); // Alert user on error
    });
};

// Function to update the dropdown with a new city
const updateDropdown = (city) => {
  const option = document.createElement("option");
  option.value = city; // Set value of option to city name
  option.textContent = city; // Set displayed text to city name
  dropdown.appendChild(option); // Append option to dropdown
  dropdown.style.display = "block"; // Show the dropdown
};

// Event listener for dropdown selection to fetch weather for selected city
dropdown.addEventListener("change", (event) => {
  const selectedCity = event.target.value; // Get selected city
  userInput.value = selectedCity; // Populate input with selected city
  weatherOperation(); // Fetch weather data
});

// Function to get current weather based on user's geolocation
const currentOperation = () => {
  if (navigator.geolocation) {
    // If geolocation is supported, get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude; // Get latitude
        const lon = position.coords.longitude; // Get longitude
        weatherOperation(lat, lon); // Fetch weather using coordinates
      },
      (error) => {
        console.error("Error getting Location", error);
        alert("Unable to retrieve your location.."); // Alert user on error
      }
    );
  } else {
    alert("Geolocation is not supported by this browser"); // Alert if geolocation is not supported
  }
};

// Event listener for the submit button to fetch weather data
submit.addEventListener("click", weatherOperation);

// Event listener for the current location button to fetch weather based on location
currentLocation.addEventListener("click", currentOperation);

// Load recent searches when the page loads
loadRecentSearches();
