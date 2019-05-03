from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Float
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Float, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.exc import IntegrityError as DatabaseIntegrityError
from sqlalchemy.orm import Session

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


class BadegaesteTable(Base):
    """
    This class implements the structure of table badegaeste of the data base
    """
    __tablename__ = 'bachelor_bigdata2_badegaeste'
    schwimmbad_badname = Column(String(50), ForeignKey('bachelor_bigdata2_schwimmbad.schwimmbad_badname'))
    schwimmbad_badstandort = Column(String(50), ForeignKey('bachelor_bigdata2_schwimmbad.schwimmbad_badstandort'))
    badegaestzeit = Column(Integer)
    anzahlbadegaeste = Column(Integer, primary_key=True)

    def __init__(self, schwimmbad_badname, schwimmbad_badstandort, badegaestzeit, anzahlbadegaeste):
        self.schwimmbad_badname = schwimmbad_badname
        self.schwimmbad_badstandort = schwimmbad_badstandort
        self.badegaestzeit = badegaestzeit
        self.anzahlbadegaeste = anzahlbadegaeste


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


class OeffnungszeitenTable(Base):
    """
    this class implements the structure of table oeffnungszeiten of the data base
    """
    __tablename__ = 'bachelor_bigdata2_oeffnungszeiten'
    schwimmbad_badname = Column(String(50), ForeignKey('bachelor_bigdata2_schwimmbad.schwimmbad_badname'))
    schwimmbad_badstandort = Column(String(50), ForeignKey('bachelor_bigdata2_schwimmbad.schwimmbad_badstandort'))
    wochentag = Column(Integer)
    badesaison = Column(Integer, primary_key=True)
    oeffnetstd = Column(Integer)
    oeffnetmin = Column(Integer)
    schliesststd = Column(Integer)
    schliesstmin = Column(Integer)

    def __init__(self, schwimmbad_badname, schwimmbad_badstandort, wochentag, badesaison, oeffnetstd, oeffnetmin,
                 schliesststd, schliesstmin):
        self.schwimmbad_badname = schwimmbad_badname
        self.schwimmbad_badstandort = schwimmbad_badstandort
        self.wochentag = wochentag
        self.badesaison = badesaison
        self.oeffnetstd = oeffnetstd
        self.oeffnetmin = oeffnetmin
        self.schliesststd = schliesststd
        self.schliesstmin = schliesstmin


class SchwimmbadTable(Base):
    """
    This class implements the structure of table schwimmbad of the data base
    """
    __tablename__ = 'bachelor_bigdata2_schwimmbad'
    schwimmbad_badname = Column(String(50), primary_key=True)
    schwimmbad_badstandort = Column(String(50), primary_key=True)

    def __init__(self, schwimmbad_badname, schwimmbad_badstandort):
        self.schwimmbad_badname = schwimmbad_badname
        self.schwimmbad_badstandort = schwimmbad_badstandort


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
    'mssql://TeamUser:Bigdata2016@81.169.244.134:1433/TestDatabase2?driver=SQL+Server'
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
    # db = DB_Manager('mssql://Group2:Fit4Life!2@132.180.195.104:1433/bigDataGroup2_2?driver=SQL+Server')
    # db = DB_Manager('mssql://Group2:Fit4Life!2@132.180.195.104:1434/bigDataGroup2_2?driver=SQL+Server')
    db = DB_Manager('mssql://TeamUser:Bigdata2016@81.169.244.134:1433/TestDatabase2?driver=SQL+Server')
    db.db_connection()
    consumer_key = 'jPk1O1aFiVe70AbWObrWhS5nH'
    consumer_secret = 'MURs2naGcS6PN6JOh310fuiruL09pjmB5HpzivnSrBHNAGvQq6'
    access_token = '741956576404242432-9CH2S0U5Fe2oEEM6TWJQqm7HcQkMsJZ'
    access_token_secret = '6TntDaoD4QWYkvTqcDT0NiGuNWFvxMZsMlPxG7MsNGrrH'
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

