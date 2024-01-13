#!/usr/bin/python3
import os
ls_com = list(os.listdir()) #like "ls" of current directory
for i in ls_com :   #iterates through files and folders of directory
    if not os.path.isfile(i):
        continue
    file_extension = os.path.splitext(i)[1][1:] #get file extension
    if file_extension == '':    #if file has no extension
        file_extension = 'no_extension'
    print (i)
    print (file_extension)
    if not os.path.exists(file_extension):  #sees if folder already exists
        os.mkdir(file_extension)
    os_type = os.name   #get script to work on windows and linux
    if os_type == 'nt':
        os.system("move *."+file_extension+ " "+ file_extension)  #copy files to appropriate folders
    elif os_type == 'posix':
        os.system("mv *."+file_extension+ " "+ file_extension)	#copy files to appropriate folders
