var cityList = [];
var now = moment();
var currentDate = moment().format("D/M/YYYY");
var cityNameEl = document.querySelector("#city-name");
var cDateEl = document.querySelector("#current-date");
var cSymbolEl = document.querySelector("#current-symbol");
var cTemperatureEl = document.querySelector("#current-temperature");
var cHumidityEl = document.querySelector("#current-humidity");
var cWindEl = document.querySelector("#current-wind");
var cUVIndexEl = document.querySelector("#current-uvindex");
var cityInputFormEl = document.querySelector("#city-input-form");
var cityListEl = document.querySelector("#city-list");

var initialize = function () {
    var hardCodedCity = "New York City, New York";
    cityList = JSON.parse(localStorage.getItem("cityList"));
    if (!cityList) {
        getWeatherCall(hardCodedCity)
        cityList = [];
    } else {
        getWeatherCall(cityList[0].cityNameId);
        initalizeCitySearchList(cityList);
    }
}

var initalizeCitySearchList = function (cityList) {
    for (var i = 0; i < cityList.length; i++) {
        var cityName = cityList[i].cityNameId;
        var buttonName = cityList[i].buttonNameId;
        listEl = document.createElement("li");
        buttonEl = document.createElement("button")
        buttonEl.textContent = cityName;
        buttonEl.setAttribute("id", cityName);
        buttonEl.setAttribute("buttonId", buttonName);
        listEl.appendChild(buttonEl);
        cityListEl.appendChild(listEl);
    }
}

var inputHandler = function () {
    event.preventDefault();
    var cityName = document.querySelector("input[name='city-input']").value;
    if (!cityName) {
        alert("You need to input a city name to continue");
    }
    else {
        getWeatherCall(cityName);
        createListElement(cityName);
    }
}

var cityListHandler = function (event) {
    var cityName = event.target.getAttribute("id");
    getWeatherCall(cityName);
}

var createListElement = function (cityName) {
    listEl = document.createElement("li");
    buttonEl = document.createElement("button")
    var buttonName = cityName;
    fetch('http://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=5e858884005a9d64472a576b80548c7d')
        .then(function (currentWeatherResponse) {
            if (currentWeatherResponse.ok) {
                return currentWeatherResponse.json();
            }
            else {
                alert("Error: " + currentWeatherResponse.status);
            }
        })
        .then(function (currentWeatherResponse) {
            buttonName = currentWeatherResponse.name;
            buttonEl.textContent = buttonName;
            buttonEl.setAttribute("id", cityName);
            buttonEl.setAttribute("buttonId", buttonName);
            listEl.appendChild(buttonEl);
            cityListEl.appendChild(listEl);
            var buttonIds = {
                cityNameId: cityName,
                buttonNameId: buttonName
            }
            cityList.push(buttonIds);
            localStorage.setItem("cityList", JSON.stringify(cityList));
        })
}

var getWeatherCall = function (cityName) {
    fetch('http://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=5e858884005a9d64472a576b80548c7d')
        .then(function (currentWeatherResponse) {
            if (currentWeatherResponse.ok) {
                return currentWeatherResponse.json();
            }
            else {
                alert("Error: " + currentWeatherResponse.status);
            }
        })
        .then(function (currentWeatherResponse) {
            currentWeatherReportUpdate(currentWeatherResponse);
            return fetch('http://api.openweathermap.org/data/2.5/forecast?q=' + cityName + '&appid=5e858884005a9d64472a576b80548c7d')
        }).then(function (fiveDayResponse) {
            if (fiveDayResponse.ok) {
                return fiveDayResponse.json();
            }
            else {
                alert("Error: " + fiveDayResponse.status);
            }
        })
        .then(function (fiveDayResponse) {
            fiveDayForecastUpdate(fiveDayResponse);
        })
};

var currentWeatherReportUpdate = function (cityWeather) {
    var cityName = cityWeather.name;
    var temperature = Math.round((((((cityWeather.main.temp) - 273.15) * 1.8) + 32) * 10)) / 10;
    var humidity = cityWeather.main.humidity;
    var wind = Math.round(((cityWeather.wind.speed) * 2.23694) * 10) / 10;
    temperature = temperature + " \u00B0F";
    humidity = humidity + "%";
    wind = wind + " MPH";
    var titleDate = "(" + currentDate + ")";
    var symbol = cityWeather.weather[0].icon;
    symbol = "http://openweathermap.org/img/wn/" + symbol + "@2x.png";
    cityNameEl.textContent = cityName;
    cDateEl.textContent = titleDate;
    cSymbolEl.textContent = "";
    cTemperatureEl.textContent = temperature;
    cHumidityEl.textContent = humidity;
    cWindEl.textContent = wind;
    cSymbolEl.innerHTML = "<img src=" + symbol + " alt='weather symbol' />";
    getUVIndex(cityWeather);
};

function getUVIndex(cityWeather) {
    var lat = cityWeather.coord.lat;
    var lng = cityWeather.coord.lon;
    $.ajax({
        type: 'GET',
        dataType: 'json',
        beforeSend: function (request) {
            request.setRequestHeader('x-access-token', 'b2c749cf5ce77d02b2a8a7c81493dbce');
        },
        url: 'https://api.openuv.io/api/v1/uv?lat=' + lat + '&lng=' + lng,
        success: function (response) {
            var uvIndex = response.result.uv_max;
            uvIndex = Math.round(uvIndex * 100) / 100;
            cUVIndexEl.textContent = uvIndex;
            $("#current-uvindex").removeClass("bg-success bg-warning bg-danger");
            if (uvIndex <= 2) {
                $("#current-uvindex").addClass("bg-success");
            }
            else if (uvIndex > 2 && uvIndex <= 6) {
                $("#current-uvindex").addClass("bg-warning");
            }
            else {
                $("#current-uvindex").addClass("bg-danger");
            }
        },
        error: function (response) {
            alert("Error: " + response.status);
        }
    });
}

var fiveDayForecastUpdate = function (cityWeather) {
    for (var i = 0; i < 5; i++) {
        var listIndex = (i * 8);
        var elementIncrementer = i + 1;
        var symbolEl = "#symbol-" + elementIncrementer;
        var tempEl = "#temp-" + elementIncrementer;
        var humidityEl = "#hum-" + elementIncrementer;
        var dateEl = "#date-" + elementIncrementer;
        var temperature = Math.round((((((cityWeather.list[listIndex].main.temp) - 273.15) * 1.8) + 32) * 10)) / 10;
        temperature = temperature + " \u00B0F";
        var humidity = cityWeather.list[listIndex].main.humidity;
        humidity = humidity + "%";
        var symbol = cityWeather.list[listIndex].weather[0].icon;
        symbol = "http://openweathermap.org/img/wn/" + symbol + "@2x.png";
        var dayDate = cityWeather.list[listIndex].dt_txt;
        var parsedDate = dayDate.split("-");
        var parsedDayandTime = parsedDate[2].split(" ");
        var headerDate = parsedDayandTime[0] + "/" + parsedDate[1] + "/" + parsedDate[0];
        $(dateEl).text(headerDate);
        $(tempEl).text(temperature);
        $(humidityEl).text(humidity);
        $(symbolEl).html("<img src=" + symbol + " alt='weather symbol' />")
    }
};

initialize();
cityInputFormEl.addEventListener("submit", inputHandler);
cityListEl.addEventListener("click", cityListHandler);
