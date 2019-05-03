from textwrap import TextWrapper
import tweepy
import datetime
import json
from importer.BigData_db.db_manager import TweetTable, DB_Manager


class StreamWatcherListener(tweepy.StreamListener):
    """
    This class expand the class tweepy.StreamListener to get more information about the tweets than it's provide by
    the class tweepy.StreamListener.
    """


    status_wrapper = TextWrapper(width=60, initial_indent='    ', subsequent_indent='    ')

    def __init__(self, locationid, dbconnection):
        """
        :param locationid: locationid (provide by data base)
        :param dbconnection: connection to database
        """
        tweepy.StreamListener.__init__(self, api=None)
        self.locationid = locationid
        self.dbconnection = dbconnection

    #raw data is a dictionary with variable size
    def on_data(self, raw_data):
        tweetid = None
        createdAt = None
        text = None
        source = None
        language = None
        favoritecount = None
        numberhashtags = None
        retweetcount = None
        coordinatelong = None
        coordinatelat = None
        country = None
        placefullname = None
        placetype = None
        try:
            raw_datadict = json.loads(raw_data)
            if "id_str" in raw_datadict:
                tweetid = raw_datadict["id_str"]
                #print("TweetID: ", tweetid)
            if "created_at" in raw_datadict:
                createdAt = raw_datadict["created_at"]
                #temptime0 = raw_datadict["created_at"]  # interpreted as datetime automatically
                temptime1 = datetime.datetime.strptime(raw_datadict["created_at"], "%a %b %d %H:%M:%S +0000 %Y")
                temptime4 = (temptime1 - datetime.datetime(1970, 1, 1)).total_seconds()  # time needed in seconds
                createdAt = int(temptime4)
                #print("CreatedAt: ", createdAt)
            if "text" in raw_datadict:
                text = raw_datadict["text"]
                print("TweetText: ", text)
            if "source" in raw_datadict:
                source = raw_datadict["source"]
                sourceStart = source.index(">")
                source = source[sourceStart+1:]
                sourceEnd = source.index("<")
                source = source[:sourceEnd]
                #print("Source: ", source)

            if "lang" in raw_datadict:
                language = raw_datadict["lang"]
                #print("Tweet Language: ", language)
            if "favorite_count" in raw_datadict:
                favoritecount = raw_datadict["favorite_count"]
                #print("FavoriteCount: ", favoritecount)
            if "entities" in raw_datadict:
                numberhashtags = len(raw_datadict["entities"]["hashtags"])
                #print("NumberHashtags: ", numberhashtags)
            if "retweet_count" in raw_datadict:
                retweetcount = raw_datadict["retweet_count"]
                #print("RetweetCount: ", retweetcount)
            if "coordinates" in raw_datadict:  # long1="-74,256566", lat1="40,500388"
                if raw_datadict["coordinates"] is not None:
                    if ("type" in raw_datadict["coordinates"]) & (raw_datadict["coordinates"]["type"] == "Point"):
                        coordinatelong = raw_datadict["coordinates"]["coordinates"][0]
                        coordinatelat = raw_datadict["coordinates"]["coordinates"][1]
                            #print("Coordinates: long:", coordinatelong, " lat:", coordinatelat)
            if "place" in raw_datadict:
                if "country" in raw_datadict["place"]:
                    country = raw_datadict["place"]["country"]
                    # print("Country: ", country)
                if "full_name" in raw_datadict["place"]:
                    placefullname = raw_datadict["place"]["full_name"]
                    #print("PlaceFullName: ", placefullname)
                if "place_type" in raw_datadict["place"]:
                    placetype = raw_datadict["place"]["place_type"]
                    #print("PlaceType: ", placetype)

            data = TweetTable(locationarea_locationid=self.locationid, tweetzeit=createdAt, tweetid=tweetid,
                              deviceinfo=source, tweetstring=text, language=language, country=country,
                              favoritecount=favoritecount, numberhashtags=numberhashtags, retweetcount=retweetcount,
                              long=coordinatelong, lat=coordinatelat, placefullname=placefullname, placetype=placetype)

            self.dbconnection.insert(data)
            print(self.status_wrapper.fill(text))
            print('\n %s  %s  via %s\n' % (tweetid, createdAt, source))
        except Exception as exception:
            print(exception)

    """
    def on_status(self, status):

        #uses the StreamWatcherListener Object to write via its dbconnection (variable) into the database

        try:
            temptime0 = status.created_at # interpreted as datetime automatically
            #temptime1 = datetime.datetime.strptime(status.created_at, "%Y-%m-%d %H:%M:%S")
            temptime4 = (temptime0-datetime.datetime(1970, 1, 1)).total_seconds() # time needed in seconds
            # TODO check what information to get out of status. variable
            tweetzeit = int(temptime4)
            author = status.author.screen_name #[0:500] TODO status.author has  way more information!!!!
            #author = status.author.screen_name #[0:500] TODO status.author has  way more information!!!!
            #TODO final challenge, how to get the tweet id here OR use the raw_data method for all stuff
            tweetid = 666
            source = str(status.source)
            text = str(status.text) [0:500]
            data = TweetTable(self.locationid, tweetzeit, author, source, text)
            locationid = self.locationid
            data = TweetTable(locationarea_locationid=self.locationid, tweetzeit=tweetzeit,
                              tweetid=tweetid, deviceinfo=source, tweetstring=text)
            self.dbconnection.insert(data)
            print(self.status_wrapper.fill(status.text))
            print('\n %s  %s  via %s\n' % (status.author.screen_name, status.created_at, status.source))
            return status.text, status.author.screen_name, status.created_at, status.source
        except:
            # Catch any unicode errors while printing to console
            # and just ignore them to avoid breaking application.
            pass"""


    def on_error(self, status_code):
        try:
            """Called when a non-200 status code is returned"""
            print('An error has occured! Status code = %s' % status_code)

            return True  # keep stream alive
        except Exception as exception:
            print(exception)

    def on_timeout(self):
        try:
            print('Snoozing Zzzzzz')
        except Exception as exception:
            print(exception)


    def on_disconnect(self, notice):
        try:
            self.dbconnection.db_close()
            """Called when twitter sends a disconnect notice
            Disconnect codes are listed here:
            https://dev.twitter.com/docs/streaming-apis/messages#Disconnect_messages_disconnect
            """
            return
        except Exception as exception:
            print(exception)

class Tweets(object):
    """
    This class provide the Twitter stream of a specific location
    """

    def __init__(self, dbconnection, locationid, geobox, consumer_key, consumer_secret, access_token, access_token_secret):
        """
        :param locationid: provide by Openweathermap
        :param geobox: can be a list or a tupel specified in the order [long1, lat1, long2 lat2]
        :param dbconnection is the method (db_connection()) of the class DB_Manager
        :param key and token are provided by twitter a specific user (developer)
        """
        self.dbconnection = dbconnection
        self.locationid = locationid
        self.geobox = geobox
        self.consumer_key = consumer_key
        self.consumer_secret = consumer_secret
        self.access_token = access_token
        self.access_token_secret = access_token_secret

    def get(self):
        try:
            auth = tweepy.auth.OAuthHandler(self.consumer_key, self.consumer_secret)
            auth.set_access_token(self.access_token, self.access_token_secret)

            # then it is stuck in a on_status-method loop
            # then it is stuck in a on_status-method loop, which is the wanted behaviour
            stream = tweepy.Stream(auth, StreamWatcherListener(locationid=self.locationid, dbconnection=self.dbconnection), timeout=None)

            # Prompt for mode of streaming
            valid_modes = ['sample', 'filter']

            while True:
                mode = ('filter')
                if mode not in valid_modes:
                    print('Invalid mode! Try again.')
                    break

                if mode == 'sample':
                    stream.sample()


                elif mode == 'filter':


                    location = self.geobox

                    if location:
                        location = location
                    else:
                        location = None


                    stream.filter(locations=location) #locations=location   #track=['nasaberlin']
                    return

        except Exception as exception:
                    print(exception)


 #Testing new Twitter
if __name__ == '__main__':


    consumer_key = 'XXX'
    consumer_secret = 'XXX'
    access_token = 'XXX'
    access_token_secret = 'XXX'
    dbconnection = DB_Manager('XXX')
    dbconnection.db_connection()

    tweet = Tweets(dbconnection=dbconnection, locationid=5128581, geobox = [-74.256566, 40.500388, -73.721076, 40.870018],
                   consumer_key=consumer_key,
                   consumer_secret=consumer_secret, access_token=access_token, access_token_secret=access_token_secret)

                                    #geobox = [long1, lat1, long2 lat2]
    #tweet = Tweets(dbconnection=dbconnection, locationid=1, geobox = [8.333017, 47.894235, 12.001730, 50.308968], consumer_key=consumer_key,
    #tweet = Tweets(dbconnection=dbconnection, locationid=2951825, geobox = [8.333017, 47.894235, 12.001730, 50.308968], consumer_key=consumer_key,
    #               consumer_secret=consumer_secret, access_token=access_token, access_token_secret=access_token_secret)
    tweet.get()
    dbconnection.db_close()

