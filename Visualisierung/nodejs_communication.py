# 
# Kuemmert sich um die Kommunikation mit dem Importer und node.js
# 
# geschrieben fuer das Bachelorprojekt BigData 2016, AI IV / Universitaet Bayreuth
# 
# Author: BigData2
# 

#import sys

#sys.path.append("../..")

from importer.BigData_importer.importer_manager import *

if __name__ == "__main__":
	zustand = 0
	
	processing = Processing()
	
	# Reagiere auf Eingaben von nwjs
	while True:
		c = sys.stdin.readline()
		
		if c == "zurueck\n":
			zustand = 0
		
		elif zustand == 0:
			if c == "startOWM\n":
				zustand = 2
			
			elif c == "stop\n":
				zustand = 1
			
			elif c == "list\n":
				zustand = 4
				
			elif c == "startTWITTER\n":
				zustand = 3
			
		elif zustand == 1:
			if c != "" and c != "\n" and c != "\r" and c != "\r\n":
				try:
					processing.stop(int(float(c)))
				except Exception as exception:
					print(exception)
				
				zustand = 0
		elif zustand == 2:
			if c != "" and c != "\n" and c != "\r" and c != "\r\n":
				try:
					args1=(int(float(c)), 'keyowm')
					
					daten = {"1-name" : "getandwritedb_wetter", "1-args" : args1}
					
					processing.start(daten)
				except Exception as exception:
					print(exception)
				
				zustand = 0
		
		elif zustand == 3:
			if c != "" and c != "\n" and c != "\r" and c != "\r\n":
				try:
					datenCity = c.split(';')
					
					geobox = []
					
					for i in range(0, len(datenCity)):
						if i == 0:
							cityID = int(float(datenCity[i]))
						
						else:
							geobox.append(float(datenCity[i]))
					
					print(cityID)
					
					if len(geobox) == 4:
						args1 = (cityID, geobox, 'keytwitter')
						
						daten = {"1-name" : "getandwritedb_tweets", "1-args" : args1}
						
						processing.start(daten)
				except Exception as exception:
					print(exception)
				
				zustand = 0
		
		elif zustand == 4:
			if c != "" and c != "\n" and c != "\r" and c != "\r\n":
				nr = int(float(c))
				
				processList = processing.getListProcess()
				
				data = {}
				
				for i in processList:
					parts = i.split('_')
					
					if not parts[0] in data:
						data[parts[0]] = {}
					
					data[parts[0]][parts[1]] = processList[i]
				
				processes = 'Process_list_pid@' + str(nr)
				
				for i in data:
					processes += '|' + str(data[i]['object'].pid)
				
				print(processes)
				
				zustand = 0
		
		sys.stdout.flush()