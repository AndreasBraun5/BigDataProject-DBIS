"""http://pythonforengineers.com/your-first-gui-app-with-python-and-pyqt/"""
import sys
from PyQt5 import QtCore, QtGui, uic
from PyQt5.QtGui import QPixmap
from PyQt5.QtWidgets import QMainWindow, QApplication

# Enter file here.
qtCreatorFile = "C:\GitHub\BigDataProjectDBIS\importer\GUI\\bigdata2gui.ui"
Ui_MainWindow, QtBaseClass = uic.loadUiType(qtCreatorFile)



class MyApp(QMainWindow, Ui_MainWindow):
    def __init__(self):
        QMainWindow.__init__(self)
        Ui_MainWindow.__init__(self)
        self.setupUi(self)
        pixmap = QPixmap("F:\Drive\AngewandteInformatik\DBIS-Bachelor-Projekt\BlankMap-World-noborders.png")
        self.label_4.setPixmap(pixmap)
        #self.label_4.



if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MyApp()
    window.show()
    sys.exit(app.exec_())


