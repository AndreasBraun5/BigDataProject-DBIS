from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Float
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Float, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.exc import IntegrityError as DatabaseIntegrityError
from sqlalchemy.orm import Session
from datetime import datetime
from time import mktime

"""every "XxXxTable"-class must be a subclass of "Base" to be able to use sqlalchemy"""
Base = declarative_base()

class WetterTable(Base):
    """
    This class implements the structure of table wetter of the data base
    """
    __tablename__ = 'bachelor_bigdata2_wetter'
    locationarea_locationid=Column(Integer, ForeignKey('bachelor_bigdata2_locationarea.locationid'))
    wetterzeit = Column(Integer)
    wettertyp = Column(String(50), primary_key=True)
    temperatur = Column(Integer)
    luftfeuchte = Column(Integer)
    luftdruck = Column(Integer)
    windgeschwindigkeit = Column(Integer)
    windrichtung = Column(Integer)
    wolken = Column(Integer)
    regenmenge = Column(Integer)
    wettertypdetail = Column(String(50))
    wetterzeitref = Column(Integer)

    def __init__(self, locationarea_locationid, wetterzeit, wettertyp, temperatur, luftfeuchte, luftdruck,
                 windgeschwindigkeit, windrichtung, wolken, regenmenge, wettertypdetail, wetterzeitref):
        self.locationarea_locationid = locationarea_locationid
        self.wetterzeit = wetterzeit
        self.wettertyp = wettertyp
        self.temperatur = temperatur
        self.luftfeuchte = luftfeuchte
        self.luftdruck = luftdruck
        self.windgeschwindigkeit = windgeschwindigkeit
        self.windrichtung = windrichtung
        self.wolken = wolken
        self.regenmenge = regenmenge
        self.wettertypdetail = wettertypdetail
        self.wetterzeitref = wetterzeitref


class LocationareaTable(Base):
    """
    This class implements the structure of table locationarea of the data base
    """
    __tablename__ = 'bachelor_bigdata2_locationarea'
    locationid = Column(Integer, autoincrement=False)
    name = Column(String(50), primary_key=True)
    long1 = Column(Float)
    lat1 = Column(Float)
    long2 = Column(Float)
    lat2 = Column(Float)

    def __init__(self, locationid, name, long1, lat1, long2, lat2):
        self.locationid = locationid
        self.name = name
        self.long1 = long1
        self.lat1 = lat1
        self.long2 = long2
        self.lat2 = lat2


class KeymanagerTable(Base):
    """
    This class implements the structure of table keymanager of the data base
    """
    __tablename__ = 'bachelor_bigdata2_keymanager'
    keyname = Column(String(50), primary_key=True)
    keytype = Column(String(50))
    weatherkey = Column(String(50))
    consumerkey = Column(String(50))
    consumerkeysecret = Column(String(50))
    acesstoken = Column(String(50))
    acesstokensecret = Column(String(50))

    def __init__(self, keyname, keytype, weatherkey, consumerkey, consumerkeysecret, acesstoken, acesstokensecret):
        self.keyname =  keyname
        self.keytype = keytype
        self.weatherkey = weatherkey
        self.consumerkey = consumerkey
        self.consumerkeysecret = consumerkeysecret
        self.acesstoken = acesstoken
        self.acesstokensecret = acesstokensecret


class baederverwaltung(Base):
    """
    This class implements the structure of table baedervewaltung of the data base
    """
    __tablename__ = 'bachelor_bigdata2_baederverwaltung'
    badname = Column(String(50), primary_key=True)
    locationarea_locationid = Column(Integer, ForeignKey('bachelor_bigdata2_locationarea.locationid'))
    anzahlbadegaeste = Column(Integer)
    zeit = Column(BigInteger, primary_key=True)
    wochentag = (Integer)

    def __init__(self, badname, locationarea_locationid, anzahlbadegaeste, zeit, wochentag):
        self.badname = badname
        self.locationarea_locationid = locationarea_locationid
        self.anzahlbadegaeste = anzahlbadegaeste
        self.zeit = zeit
        self.wochentag = wochentag


class TweetTable(Base):
    """
    This class implements the structure of table tweet of the data base
    """
    __tablename__ = 'bachelor_bigdata2_tweet'
    locationarea_locationid = Column(Integer, ForeignKey('bachelor_bigdata2_locationarea.locationid'), primary_key=True)
    tweetzeit = Column(Integer, primary_key=True, autoincrement=False)
    tweetid = Column(BigInteger, primary_key=True, autoincrement=False) # unique=True could be used to
    deviceinfo = Column(String(50))
    tweetstring = Column(String(50))
    language = Column(String(50))
    country = Column(String(50))
    favoritecount = Column(Integer)
    numberhashtags = Column(Integer)
    retweetcount = Column(Integer)
    long = Column(Float)
    lat = Column(Float)
    placefullname = Column(String(50))
    placetype = Column(String(50))

    def __init__(self, locationarea_locationid, tweetzeit, tweetid, deviceinfo, tweetstring, language, country,
                 favoritecount, numberhashtags, retweetcount, long, lat, placefullname, placetype):
        self.locationarea_locationid = locationarea_locationid
        self.tweetzeit = tweetzeit
        self.tweetid = tweetid
        self.deviceinfo = deviceinfo
        self.tweetstring = tweetstring
        self.language = language
        self.country = country
        self.favoritecount = favoritecount
        self.numberhashtags = numberhashtags
        self.retweetcount = retweetcount
        self.long = long
        self.lat = lat
        self.placefullname = placefullname
        self.placetype = placetype


class DB_Manager:
    """
    This class handle the communication with the data base.
    """
    """ An Instance of DB_Manager needs an engineUrl as parameter:
    "<<drivername>>://<<username>>:<<password>>@<<host>>:<<port>>/<<databasename>>?driver=SQL+Server"
    """

    def __init__(self, engineUrl):
        self.engineUrl = engineUrl

    def db_connection(self):
        """
        This method open the communication to data base
        """
        try:
            global engine
            engine = create_engine(self.engineUrl)
            print(engine)
            global session
            session = Session(engine)
            session.connection()
            print('connected to db successful')
        except Exception as exception:
            print(exception)
            print('unable to connected to db')

    def db_close(self):
        """
        This method close the communication to data base
        """
        try:
            session.close()
            print('db_close successful')
        except Exception as exception:
            print(exception)
            print('unable to db_close')

    def insert(self, data):
        """
        This method allow to insert commit data to a table
        """
        try:
            session.add(data)
            session.commit()
            print('Insert successful')
        except DatabaseIntegrityError as dberr:
            session.rollback()
            print(dberr)
            print('unable to insert & ROLLBACK IS DONE')
        except Exception as exception:
            print(exception)
            print("unable to insert")

    def getKey(self):
        """
        This method return the keyList to get data from the owm API and the twitter API
        """
        try:

            i = 1
            keyList = {}
            for row in session.query(KeymanagerTable, KeymanagerTable.keyname, KeymanagerTable.keytype, KeymanagerTable.weatherkey, KeymanagerTable.consumerkey, KeymanagerTable.consumerkeysecret, KeymanagerTable.acesstoken, KeymanagerTable.acesstokensecret).all():
                keyList[str(i) + '_keyname'] = row.keyname
                keyList[str(i) + '_keytype'] = row.keytype
                keyList[str(i) + '_weatherkey'] = row.weatherkey
                keyList[str(i) + '_consumerkey'] = row.consumerkey
                keyList[str(i) + '_consumerkeysecret'] = row.consumerkeysecret
                keyList[str(i) + '_acesstoken'] = row.acesstoken
                keyList[str(i) + '_acesstokensecret'] = row.acesstokensecret
                i = i + 1
            print('Get key successful')
            return keyList
        except Exception as exception:
            print(exception)
            print('unable to get key')



"""
if __name__ == '__main__':
    # TODO Check ports, don´t know why not working
    db.db_connection()
    consumer_key = 'XXX'
    consumer_secret = 'XXX'
    access_token = 'XXX'
    access_token_secret = 'XXX'
    keyCedricTwitter = KeymanagerTable(keyname="CedricTwitter", keytype="owm", weatherkey="0", consumerkey=consumer_key,
                                       consumerkeysecret=consumer_secret, acesstoken=access_token,
                                       access_token_secret=access_token_secret)
    db.insert(keyCedricTwitter)


    locationid = 2951825
    tweetzeit = 11111911
    tweetid = 666
    source = "testSource"
    text = "testText"
    data = TweetTable(locationarea_locationid=locationid, tweetzeit=tweetzeit,
                      tweetid=tweetid, deviceinfo=source, tweetstring=text)
    db.insert(data)
    db.db_close()
"""

"""
if __name__ == '__main__':

    db = DB_Manager('XXX')
    db.db_connection()
    badname = 'Kreuzsteinbad'
    locationarea_locationid = 2951825
    anzahlbadegaeste = 5198
    my_date = datetime(2016, 7, 10, 22, 00, 00)            #1463083200
    zeit = int(mktime(my_date.timetuple())+1e-6*my_date.microsecond)
    print(zeit)
    wochentag = int(my_date.weekday())
    print(wochentag)
    data = baederverwaltung(badname, locationarea_locationid, anzahlbadegaeste, zeit, wochentag)
    db.insert(data)
    db.db_close()
"""
