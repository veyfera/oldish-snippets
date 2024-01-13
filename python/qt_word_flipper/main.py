import sys
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.Qt import QApplication
from gui import Ui_MainWindow

app = QtWidgets.QApplication(sys.argv)
MainWindow = QtWidgets.QMainWindow()
ui = Ui_MainWindow()
ui.setupUi(MainWindow)
MainWindow.show()

def get_input_from_user():    #gets plain text from Plain Text Edit widget
    text = ui.plainTextEdit.toPlainText()
    return text

def paste_input():
    cp = QApplication.clipboard()
    text = cp.text()
    ui.plainTextEdit.setPlainText(text)

def move_text_to_clipboard():    #moves output of program to system clipboard
    cp = QApplication.clipboard()
    cp.setText(flipped_text)

def flip_text(text:str):    #flips the input
    text_list = list(text)
    flipped_text = ''
    while len(text_list) != 0:
        flipped_text += text_list.pop()
    return flipped_text

def print_output(text:str):    #shows input in Label widget
    ui.label.setText(text)

def clear():
    ui.label.setText('')
    ui.plainTextEdit.setPlainText('')

def launch_conversion():
    text = get_input_from_user()
    global flipped_text
    flipped_text = flip_text(text)
    print_output(flipped_text)

#connecting to gui

ui.pasteInputButton.clicked.connect(paste_input)
ui.convertButton.clicked.connect(launch_conversion)
ui.copyOutputButton.clicked.connect(move_text_to_clipboard)
ui.clearButton.clicked.connect(clear)


sys.exit(app.exec_())
