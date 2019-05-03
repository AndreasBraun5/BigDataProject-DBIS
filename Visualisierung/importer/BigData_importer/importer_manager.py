from importer.BigData_api.api_owm import OwmHandler
from importer.BigData_api.api_twitter import Tweets
from importer.BigData_db.db_manager import WetterTable, LocationareaTable, BadegaesteTable, OeffnungszeitenTable,\
    SchwimmbadTable, TweetTable, KeymanagerTable, DB_Manager
from multiprocessing import *
import sys
import time
import numpy as np


# this variabe is needed to get access to the DB
engineURl = "mssql://TeamUser:Bigdata2016@81.169.244.134:1433/TestDatabase2?driver=SQL+Server"

# getandwritedb_XxXx methods need to be given all necessary parameter regarding to specify what you want
# and valid keys to get access to the corresponding API

def getandwritedb_wetter(locationarea_locationid, apikey):
    """
    Method to get data from owm API and put the data in the correct table of the data base in a while loop every 10 min
    """
    while True:
        try:
            weather = OwmHandler(standort=locationarea_locationid, cityid=locationarea_locationid, apikey=apikey)
            data_weather = weather.getWeather()
            if data_weather == 0:
                print("OWM API offline")
            db = DB_Manager(engineUrl=engineURl)
            db.db_connection()
            data = WetterTable(wetterzeit=data_weather[1], locationarea_locationid=data_weather[2], wettertyp=data_weather[3],
                               temperatur=data_weather[4], luftfeuchte=data_weather[5], wolken=data_weather[6],
                               windrichtung=data_weather[7], windgeschwindigkeit=data_weather[8], luftdruck=data_weather[9],
                               regenmenge=data_weather[10], wettertypdetail=data_weather[11], wetterzeitref=data_weather[12])
            db.insert(data)
            db.db_close()
            time.sleep(600)
            print('method wetter sucessful')
        except Exception as exception:
            print(exception)
            print('method wetter unable')

def getandwritedb_locationarea(locationid, name, long1, lat1, long2, lat2):
    """
    Method to add the locationarea in the correct table of the data base
    :param locationid: provide by Openweathermap
    """
    try:
        db = DB_Manager(engineUrl=engineURl)
        db.db_connection()
        data = LocationareaTable(locationid = locationid, name = name, long1 = long1, lat1 = lat1, long2 = long2, lat2 = lat2)
        db.insert(data)
        db.db_close()
        print('method locationarea sucessful')
    except Exception as exception:
        print(exception)
        print('method locationarea unable')


def writedbPredefinedLocationarea():
    """
    Static write some e.g. locationareas by using the method getandwritedb_locationarea
    """
    getandwritedb_locationarea(locationid=2951825, name="Sueddeutschland", long1="12,00173", lat1="50,308968", long2="8,333017", lat2="47,894235")
    getandwritedb_locationarea(locationid=2643741, name="London", long1="-0,298672", lat1="51,618603", long2="0,099385", lat2="51,446068")
    getandwritedb_locationarea(locationid=5128581, name="New York", long1="-74,256566", lat1="40,500388", long2="-73,721076", lat2="40,870018")


def getandwritedb_keymanager(keyname, keytype, weatherkey, consumerkey, consumerkeysecret, accesstoken, accesstokensecret):
    """
    Method to add key information of an user in the correct table of the data base
    :param keyname: perhabs a mixture of the username und the apiname
    :param keytype: owm or twitter
    """
    try:
        db = DB_Manager(engineUrl=engineURl)
        db.db_connection()
        data = KeymanagerTable(keyname=keyname, keytype=keytype, weatherkey=weatherkey, consumerkey=consumerkey,
                               consumerkeysecret=consumerkeysecret, acesstoken=accesstoken, acesstokensecret=accesstokensecret)
        db.insert(data)
        db.db_close()
        print('method keymanager sucessful')
    except Exception as exception:
        print(exception)
        print('method keymanager unable')


def writedbPredefinedKeys():
    """
    static write some e.g. keys by using the method getandwritedb_keymanager
    """

    getandwritedb_keymanager(keyname="AndiOwm", keytype="owm", weatherkey="346663fa246db36587b584205fb72678",
                             consumerkey="0", consumerkeysecret="0", accesstoken="0", accesstokensecret="0")
    getandwritedb_keymanager(keyname="BeniOwm", keytype="owm", weatherkey="78021bf9dd8d4e4e8597277d85ebcb80",
                             consumerkey="0", consumerkeysecret="0", accesstoken="0", accesstokensecret="0")
    getandwritedb_keymanager(keyname="CedricOwm", keytype="owm", weatherkey="d2eedcb387d9c549cb4dbf090fbed603",
                             consumerkey="0", consumerkeysecret="0", accesstoken="0", accesstokensecret="0")
    getandwritedb_keymanager(keyname="AndiTwitter", keytype="twitter", weatherkey="0",
                             consumerkey="q6rBhiLkvjz9RDPTdKv7U7kdX",
                             consumerkeysecret="11ohIs9SzXzaNXPlgLzSuMGwAUR4dXqdiIUQ6Vk8SV0VtNHw2D",
                             accesstoken="3140256963-NqTvR6hchY4sdVo9ie7dv6ELsZkxfFoWDEyQGAZ",
                             accesstokensecret="NV78aKujpPyDdo6gOdVewxBFmW8Mzrc3TvFwZaGNK05Hc")

    getandwritedb_keymanager(keyname="CedricTwitter", keytype="twitter", weatherkey="0",
                             consumerkey="jPk1O1aFiVe70AbWObrWhS5nH",
                             consumerkeysecret="MURs2naGcS6PN6JOh310fuiruL09pjmB5HpzivnSrBHNAGvQq6",
                             accesstoken="741956576404242432-9CH2S0U5Fe2oEEM6TWJQqm7HcQkMsJZ",
                             accesstokensecret="6TntDaoD4QWYkvTqcDT0NiGuNWFvxMZsMlPxG7MsNGrrH")
    getandwritedb_keymanager(keyname="JasminTwitter", keytype="twitter", weatherkey="0",
                             consumerkey="x4aV0RaJow1uqUTPNTpthZMo",
                             consumerkeysecret="br6hPqWrwMXE5sbscRxFKlM2Rg3RH6c0ZM50woT2xvcXIksYOQ",
                             accesstoken="745180990084001792-weEbQ59Cwt35UZvM4iMl1SjZiCy4wp3",
                             accesstokensecret="aa9xtHFW6DOWKAl2lhHOwSemrIksGiNr6NaEIqJWqXNjn")


""" # future method to use for kreuzsteinbad
def badegaeste(schwimmbad_badname, schwimmbad_badstandort, badegaestzeit, anzahlbadegaeste):
    try:
        db = DB_Manager(engineUrl=engineURl)
        db.db_connection()

        data = BadegaesteTable(schwimmbad_badname = schwimmbad_badname, schwimmbad_badstandort = schwimmbad_badstandort,
                               badegaestzeit = badegaestzeit, anzahlbadegaeste = anzahlbadegaeste)

        db.insert(data)
        db.db_close()
        print('method badegaeste sucessfully')
        print('method badegaeste sucessful')
    except:
        print('method badegaeste unable')
"""

"""
def oeffnungszeiten(schwimmbad_badname, schwimmbad_badstandort, wochentag, badesaison, oeffnetstd, oeffnetmin,
                    schliesststd, schliesstmin):
    try:
        db = DB_Manager(engineUrl=engineURl)
        db.db_connection()

        data = OeffnungszeitenTable(schwimmbad_badname = schwimmbad_badname, schwimmbad_badstandort = schwimmbad_badstandort,
                                    wochentag = wochentag, badesaison = badesaison, oeffnetstd = oeffnetstd,
                                    oeffnetmin = oeffnetmin, schliesststd = schliesststd, schliesstmin = schliesstmin)

        db.insert(data)
        db.db_close()
        print('method oeffnungszeiten sucessfully')
        print('method oeffnungszeiten sucessful')
    except:
        print('method oeffnungszeiten unable')
"""

"""
def schwimmbad(schwimmbad_badname, schwimmbad_badstandort):
    try:
        db = DB_Manager(engineUrl=engineURl)
        db.db_connection()

        data = SchwimmbadTable(schwimmbad_badname = schwimmbad_badname, schwimmbad_badstandort = schwimmbad_badstandort)

        db.insert(data)
        db.db_close()
        print('method schwimmbad sucessfully')
        print('method schwimmbad sucessful')
    except:
        print('method schwimmbad unable')
"""


def getandwritedb_tweets(locationarea_locationid, geobox, consumer_key, consumer_secret, access_token, access_token_secret):
    """
    Method to add tweet of a specific loacationarea in the correct table of the data base
    :param locationarea_locationid:
    :param geobox: can be a list or a tupel specified in the order [long1, lat1, long2 lat2]
    """
    """
    In comparison to the other getandwritedb_xxx-methods the received tweets are directly written to the database via the
    on_status-mehtod of the StreamWatcherListener.
    """
    try:
        dbconnection = DB_Manager(engineUrl=engineURl)
        dbconnection.db_connection()
        tweet = Tweets(dbconnection=dbconnection, locationid=locationarea_locationid, geobox=geobox, consumer_key=consumer_key,
                       consumer_secret=consumer_secret, access_token=access_token, access_token_secret=access_token_secret)
        tweet.get()
        dbconnection.db_close()
        print('method tweets sucessful')
    except Exception as exception:
        print(exception)
        print('method tweets unable')


# The use_wetter function will be kept until, the different parts of the applications are connected and tested.
def static_use_wetter():
    while True:
        try:
            #Süddeutchland == Bayreuth Wetter
            getandwritedb_wetter(locationarea_locationid = 2951825, apikey ='d2eedcb387d9c549cb4dbf090fbed603')

            #City of London
            getandwritedb_wetter(locationarea_locationid = 2643741, apikey ='78021bf9dd8d4e4e8597277d85ebcb80')

            #New York City
            getandwritedb_wetter(locationarea_locationid = 5128581, apikey = '346663fa246db36587b584205fb72678')

            time.sleep(600)
            print('Main: wetter successful')
        except Exception as exception:
            print(exception)
            print('Main: wetter unable')


def static_use_tweets_Sueddeutschland():
    try:
        # Key Beni
        consumer_key = 'C4c6D0GDnhmRxfNgEM49EAzOu'
        consumer_secret = 'CPSFRuwfYVWLyFwKcCxIFdZZ5BpneGdQk2eklF0HtdUzZsQq6u'
        access_token = '751069119039045632-sEJT9eTdAKMAjorJES7ipOYaE69F81A'
        access_token_secret = 'eJdoOwratxMRXGLaubExzhOQj97T1RDPDI2W4gL9xAtpv'
        getandwritedb_tweets(locationarea_locationid = 2951825, geobox = [8.333017, 47.894235, 12.001730, 50.308968], consumer_key = consumer_key,
                             consumer_secret = consumer_secret, access_token = access_token, access_token_secret = access_token_secret)
        print('Main: tweets sucessful')
    except Exception as exception:
        print(exception)
        print('Main: tweets unable')


def static_use_tweets_London():
    try:
        # Key Beni
        consumer_key = 'C4c6D0GDnhmRxfNgEM49EAzOu'
        consumer_secret = 'CPSFRuwfYVWLyFwKcCxIFdZZ5BpneGdQk2eklF0HtdUzZsQq6u'
        access_token = '751069119039045632-sEJT9eTdAKMAjorJES7ipOYaE69F81A'
        access_token_secret = 'eJdoOwratxMRXGLaubExzhOQj97T1RDPDI2W4gL9xAtpv'
        getandwritedb_tweets(locationarea_locationid = 2643741, geobox = [-0.298672, 51.446068, 0.099385, 51.618603], consumer_key = consumer_key,
                             consumer_secret = consumer_secret, access_token = access_token, access_token_secret = access_token_secret)
        print('Main: tweets sucessful')
    except Exception as exception:
        print(exception)
        print('Main: tweets unable')


def static_use_tweets_NewYork():
    try:
        # Key Beni
        consumer_key = 'C4c6D0GDnhmRxfNgEM49EAzOu'
        consumer_secret = 'CPSFRuwfYVWLyFwKcCxIFdZZ5BpneGdQk2eklF0HtdUzZsQq6u'
        access_token = '751069119039045632-sEJT9eTdAKMAjorJES7ipOYaE69F81A'
        access_token_secret = 'eJdoOwratxMRXGLaubExzhOQj97T1RDPDI2W4gL9xAtpv'
        getandwritedb_tweets(locationarea_locationid = 5128581, geobox = [-74.256566, 40.500388, -73.721076, 40.870018], consumer_key = consumer_key,
                             consumer_secret = consumer_secret, access_token = access_token, access_token_secret = access_token_secret)
        print('Main: tweets sucessful')
    except Exception as exception:
        print(exception)
        print('Main: tweets unable')

class Processing():
    """
    Class the handle multiprocessing (start and stop). This class also manage the keys for the different APIs.
    """

    def __init__(self):

        self.daten = {}
        self.listProcess = {}                       #e.g.: {'1_object':None, '1_pid':None,'1_key':None,'2_object':None, '2_pid':None,'2_key':None,'3_object':None, '3_pid':None,'3_key':None,}
        self.engineURL = engineURl
        self.keyList = self.getListKeyFromDB()
        self.keyowm = '0'
        self.keytwitter0 = '0'
        self.keytwitter1 = '0'
        self.keytwitter2 = '0'
        self.keytwitter3 = '0'
        self.countProcess = 1
    # function, key_i


    def start(self, daten):
        """
        This method start a process with all parameters in data and also take the right key from keyList
        :param data: type = dictionary with target method and the args for the target method e.g.:  args1=(2951825, [8.333017, 47.894235, 12.001730, 50.308968], 'keytwitter')
                                                                                                    daten1 = {"1-name" : "getandwritedb_tweets", "1-args" : args1}
        """
        try:
            self.daten = daten
            i = 1
            args = []
            type = 'default'
            for k in self.daten:
                if i%2==0: continue
                method_name = self.daten[str(i) + '-name'] # set by the command line options
                args0 = self.daten[str(i)+'-args']
                if args0 != False:
                    lengthArgsParm = len(args0)
                    if args0[lengthArgsParm-1] == 'keyowm':
                        print(self.keyList)
                        type = 'keyowm'
                        self.getKey('keyowm')
                        key = self.keyowm
                        args = args0[0:lengthArgsParm-1] + (key,)
                        print(args)
                        print('Insert keyowm successfull')
                    elif args0[lengthArgsParm-1] == 'keytwitter':
                        self.getKey('keytwitter')
                        type = 'keytwitter'
                        keytwitter0 = self.keytwitter0
                        keytwitter1 = self.keytwitter1
                        keytwitter2 = self.keytwitter2
                        keytwitter3 = self.keytwitter3
                        args = args0[0:lengthArgsParm-4] + (keytwitter0,) + (keytwitter1,) + (keytwitter2,) + (keytwitter3,)
                        print('Insert keytwitter successfull')

                possibles = globals().copy()
                possibles.update(locals())
                method = possibles.get(method_name)
                if not method:
                     raise NotImplementedError("Method %s not implemented" % method_name)
                name = Process(target=method, args=args)
                name.start()
                self.listProcess[str(self.countProcess) + '_object'] = name
                self.listProcess[str(self.countProcess) + '_pid'] = name.pid
                if args0[lengthArgsParm-1] == 'keyowm':
                    self.listProcess[str(self.countProcess) + '_key'] = self.keyowm
                elif args0[lengthArgsParm-1] == 'keytwitter':
                    self.listProcess[str(self.countProcess) + '_key'] = self.keytwitter0
                print(name.name)
                print(name.pid)
                print(self.listProcess)
                i = i +1
                self.countProcess = self.countProcess + 1
                print('Neuers_Prozess:' + '|Name:' + name.name + '|PID:' + str(name.pid) + '|Type:' + type + '|Locationid:' + str(args[0]))
                return name, name.pid, self.listProcess, self.countProcess
            print('Start processing successful')
        except Exception as exception:
            print(exception)
            print('Unable to start processing')

    def getListKeyFromDB(self):
        """
        get all keys from data base no matter which API
        """
        try:
            db = DB_Manager(engineUrl = self.engineURL)
            db.db_connection()
            self.keyList = db.getKey()
            print(self.keyList)
            print('Get key list successful')
            return self.keyList
        except Exception as exception:
            print(exception)
            print('Unable to get list')

    def getKey(self, keytype):
        """
        get the keyList with all possible keys for the APIs no matter which API
        :param keytype: 'keyowm' or 'keytwitter'
        """
        try:
            if keytype == 'keyowm':
                for key in self.keyList:
                    if self.keyList[key] == 'owm':
                        j = int(key[0])
                        self.keyowm = self.keyList[str(j) + '_weatherkey']
                        del self.keyList[str(j) + '_keyname']
                        del self.keyList[str(j) + '_keytype']
                        del self.keyList[str(j) + '_weatherkey']
                        del self.keyList[str(j) + '_consumerkey']
                        del self.keyList[str(j) + '_consumerkeysecret']
                        del self.keyList[str(j) + '_acesstoken']
                        del self.keyList[str(j) + '_acesstokensecret']
                        print(self.keyList)
                        return self.keyowm, self.keyList
            elif keytype == 'keytwitter':
                 for key in self.keyList:
                    if self.keyList[key] == 'twitter':
                        j = int(key[0])
                        self.keytwitter0 = self.keyList[str(j) + '_consumerkey']
                        self.keytwitter1 = self.keyList[str(j) + '_consumerkeysecret']
                        self.keytwitter2 = self.keyList[str(j) + '_acesstoken']
                        self.keytwitter3 = self.keyList[str(j) + '_acesstokensecret']
                        del self.keyList[str(j) + '_keyname']
                        del self.keyList[str(j) + '_keytype']
                        del self.keyList[str(j) + '_weatherkey']
                        del self.keyList[str(j) + '_consumerkey']
                        del self.keyList[str(j) + '_consumerkeysecret']
                        del self.keyList[str(j) + '_acesstoken']
                        del self.keyList[str(j) + '_acesstokensecret']
                        print(self.keyList)
                        return self.keytwitter0, self.keytwitter1, self.keytwitter2, self.keytwitter3, self.keyList

        except Exception as exception:
            print(exception)
            print('Unable to get listKeys')
    def getListProcess(self):
        """
        get the list of all in this class started processes
        """
        try:
            print(self.listProcess)
            print('Get list successful')
            return self.listProcess
        except Exception as exception:
            print(exception)
            print('Unable to get list')

    def stop(self, prozess):
        """
        This method stop a specific process and give the used key free for the next process
        :param prozess: is just a number like 1
        """
        try:

            process = self.listProcess[str(prozess) + '_object']
            print(process)
            print(self.keyList)
            process.terminate()

            listFromDB = self.getListKeyFromDB()
            for key, value in listFromDB.items():
                if self.listProcess[str(prozess) + '_key'] == value:
                    j = key[0]
                    self.keyList[str(j) + '_keyname'] = listFromDB[str(j) + '_keyname']
                    self.keyList[str(j) + '_keytype'] = listFromDB[str(j) + '_keytype']
                    self.keyList[str(j) + '_weatherkey'] = listFromDB[str(j) + '_weatherkey']
                    self.keyList[str(j) + '_consumerkey'] = listFromDB[str(j) + '_consumerkey']
                    self.keyList[str(j) + '_consumerkeysecret'] = listFromDB[str(j) + '_consumerkeysecret']
                    self.keyList[str(j) + '_acesstoken'] = listFromDB[str(j) + '_acesstoken']
                    self.keyList[str(j) + '_acesstokensecret'] = listFromDB[str(j) + '_acesstokensecret']

            print(self.keyList)
            processObject = self.listProcess[str(prozess) + '_object']
            processPid = self.listProcess[str(prozess) + '_pid']
            processKey = self.listProcess[str(prozess) + '_key']


            del self.listProcess[str(prozess) + '_object']
            del self.listProcess[str(prozess) + '_pid']
            del self.listProcess[str(prozess) + '_key']

            self.countProcess = self.countProcess -1

            print('Stop_Prozess:' + '|Name:' + str(processObject) + '|PID:' + str(processPid) + '|Type:' + str(processKey))
            print('Close process successful')
            return self.listProcess, self.countProcess
        except Exception as exception:
            print(exception)
            print('Unable to stop the prozess')

if __name__ == "__main__":

    #static_use_wetter()
    #static_use_tweets_NewYork()
    #static_use_tweets_London()
    """
    # wenn keine args übergeben werden müssen z.B. für static_user_wetter dann folgendes schreiben {"1-name" : "static_use_wetter", "1-args" : False}
    processing = Processing()


    #Süddeutschland ##########################################################################################
    args1=(2951825, [8.333017, 47.894235, 12.001730, 50.308968], 'keytwitter')
    daten1 = {"1-name" : "getandwritedb_tweets", "1-args" : args1}
    processing.start(daten1)

    args2=(2951825, 'keyowm')
    daten2 = {"1-name" : "getandwritedb_wetter00", "1-args" : args2}
    processing.start(daten2)


    #London ##########################################################################################
    args3=(2643741, [-0.298672, 51.446068, 0.099385, 51.618603], 'keytwitter')
    daten3 = {"1-name" : "getandwritedb_tweets", "1-args" : args3}
    processing.start(daten3)

    args4=(2643741, 'keyowm')
    daten4 = {"1-name" : "getandwritedb_wetter00", "1-args" : args4}
    processing.start(daten4)


    #NY ##########################################################################################
    args5=(5128581, [-74.256566, 40.500388, -73.721076, 40.870018], 'keytwitter')
    daten5 = {"1-name" : "getandwritedb_tweets", "1-args" : args5}
    processing.start(daten5)

    args6=(5128581, 'keyowm')
    daten6 = {"1-name" : "getandwritedb_wetter00", "1-args" : args6}
    processing.start(daten6)
    """
    """
    processing.getListProcess()
    print(processing.keyList)
    time.sleep(15)
    processing.stop(1)
    time.sleep(15)
    processing.stop(2)
    processing.start(daten2)
    processing.start(daten4)
    processing.getListProcess()
    print(processing.keyList)
    time.sleep(15)
    processing.stop(1)
    processing.stop(2)
    """



#Beni Testing Twitter Keys, nicht in die DB schreiben!!
#Access Token751069119039045632-sEJT9eTdAKMAjorJES7ipOYaE69F81A
#Access Token SecreteJdoOwratxMRXGLaubExzhOQj97T1RDPDI2W4gL9xAtpv
#Consumer Key (API Key)C4c6D0GDnhmRxfNgEM49EAzOu
#Consumer Secret (API Secret)CPSFRuwfYVWLyFwKcCxIFdZZ5BpneGdQk2eklF0HtdUzZsQq6u

