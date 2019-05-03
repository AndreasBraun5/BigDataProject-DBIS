import pyowm
import datetime
import time


class OwmHandler(object):
    """
    This class provides the getWeather()-method to easily access the weather. If one wants to get weather information
    you must create a Instance of the OwmHanlder and call its getWeather()-method.
    """

    def __init__(self, standort, cityid, apikey):
        """
        :param again: flag for a second call if something goes wrong # TODO look up what this can be used for
        """
        self.again = False
        self.standort = standort
        self.cityid = cityid
        self.apikey = apikey

    def getWeather(self):
        """
        returns a tupel containing all relevant weather information. Retries if something went wrong (param again).
        returns 0 if the API is offline.
        """

        try:
            # You MUST provide a valid API key
            # owm represents a owm-api-object
            owm = pyowm.OWM(self.apikey)
            if not owm.is_API_online():
                print("OWM API is currently not available")
                # Error code for offline API.
                return 0

            observation = owm.weather_at_id(self.cityid)
            w = observation.get_weather()

            ############################################################################################################
            # get weather details that will be returned
            ############################################################################################################
            wetterzeit = datetime.datetime.now()
            wetterzeit = time.mktime(wetterzeit.timetuple())  # switch back ->  datetime.datetime.fromtimestamp(wetterZeit)

            standort = self.standort

            wettertyp = w.get_status()
            # wind info, getting dictionary
            wind = w.get_wind()  # {'speed': 4.6, 'deg': 330}
            windgeschwindigkeit = wind['speed']
            # if there is no wind,  so to say the speed of wind = 0, then there is no entry in the dictionary for the wind direction
            # the access to wind direction fails --> unable to get weather from api
            if "deg" in wind.keys():
                windrichtung = wind['deg']
            else:
                windrichtung = 0

            luftfeuchte = w.get_humidity()  # 87

            wolken = w.get_clouds()

            # temperature info, getting dictionary. param celsius defines which unit it should be
            temperatur = w.get_temperature('celsius')  # {'temp_max': 10.5, 'temp': 9.7, 'temp_min': 9.0}
            temperatur = temperatur['temp']

            # luftdruck info, getting dictionary.
            luftdruck = w.get_pressure()
            luftdruck = luftdruck['press']

            raindict = w.get_rain()
            if len(raindict) == 0:
                rain = 0
            else:
                try:
                    if "3h" in raindict:
                        rain = raindict["3h"]
                    else:
                        rain = 0
                except Exception as exception:
                    print(exception)
                    rain = 0
            wettertypdetail = w.get_detailed_status()
            tempwetterzeitref1 = w.get_reference_time(timeformat='iso')
            wetterzeitref2 =  datetime.datetime.strptime(tempwetterzeitref1, "%Y-%m-%d %H:%M:%S+00")
            wetterzeitref = int((wetterzeitref2 - datetime.datetime(1970, 1, 1)).total_seconds())

            print('get weather from OWM-API successfully: ', int(wetterzeit), ', ', standort, ', ', wettertyp, ', ',
                  int(temperatur), ', ', luftfeuchte, ', ', wolken, ', ', windrichtung, ', ', int(windgeschwindigkeit),
                  ', ', luftdruck, rain, wettertypdetail, wetterzeitref)

            return self.again, int(wetterzeit), standort, wettertyp, int(temperatur), luftfeuchte, wolken,\
                   windrichtung, int(windgeschwindigkeit), luftdruck, rain, wettertypdetail, wetterzeitref

        except Exception as exception:
            print(exception)
            print('unable to get weather from OWM-API')
            self.again = True
            return self.again

