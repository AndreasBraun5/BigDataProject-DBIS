BigDataProjectDBIS

Installationsanleitung:
1) NW.js: Die Version v.15.04 (normal) im Repo enthalten. (http://nwjs.io/)
2) Python Interpreter / Miniconda Version Python 3.5: 
   2.1 Download .exe and install: http://conda.pydata.org/miniconda.html
   2.2 öffnen der Konsole (cmd.exe)
   2.3 integrieren von Paketen durch den Befehl: conda install PaketXY oder pip install PaketXY
   2.4 Folgende Pakete werden benötigt: pyodbc, sqlalchemy, mssql, pyowm, tweepy, numpy und multiprocessing

Möglichkeiten die Anwendung zu starten:
A) Start über Binary: (Empfohlen)
  Rechtklicks auf GeoDeviceWeather.nw --> öffnen mit nw.exe (rel. Pfad: ../nwjs-v0.15.4-win-ia32/nw.exe)
B) Start ueber Konsole: "<Pfad zu nw.exe>" "<Pfad zur Projekt Ordner mit package.json>"
