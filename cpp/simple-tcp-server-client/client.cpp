#include<iostream>
#include<string.h>
#include<sys/socket.h>
#include<netinet/in.h>
#include<arpa/inet.h>
#include<chrono>
#include<thread>
//#include<sys/types.h>
#include<netdb.h>


using namespace std;

class Client
{
    char name[10], msg[1000], timeString[25], serverIp[15] = "127.0.0.1";
    int port, timeInterval;
    sockaddr_in clientAddr;

    void start()
    {
        int clientSd = socket(AF_INET, SOCK_STREAM, 0);
        int status = connect(clientSd,
                (sockaddr*) &clientAddr, sizeof(clientAddr));
        if(status < 0)
        {
            cerr << "Error connecting to socket" << endl;
            exit(0);
        }
        cout << "Successfully connected to server" << endl;

        while(1)
        {
            //cout << "hello" << endl;
            updMsg();
            cout << msg << "I am " << name << endl;
            send(clientSd, (char*)&msg, sizeof(msg), 0);
            //this_thread::sleep_for(5000ms);
            this_thread::sleep_for(chrono::milliseconds(timeInterval*1000));
            //send(clientSd, (char*)&msg, sizeof(msg), 0);
            //break;
        }
    }

    void currentTime()
    {
        time_t now =time(0);
        strftime(timeString, sizeof(timeString), "[%F %T]", gmtime(&now));
    }
    
    void updMsg()
    {
        currentTime();
        strcpy(msg, timeString);
        strcat(msg, " ");
        strcat(msg, name);
    }

    public:
        Client(char* n, int p, int t)
        {
            strcpy(name, n);
            port = p; timeInterval = t;
            //strcpy(msg, "Hello, work! It works...");
            //currentTime();
            //cout << timeString << endl;

            struct hostent* host = gethostbyname(serverIp);
            //char* localIp = inet_ntoa(*(struct in_addr*))

            clientAddr.sin_family = AF_INET;
            clientAddr.sin_addr.s_addr =
                inet_addr(inet_ntoa(*(struct in_addr*)*host->h_addr_list));
            //clientAddr.sin_addr.s_addr = htonl(INADDR_ANY);
            //clientAddr.sin_addr.s_addr = inet_addr(localIP);
            clientAddr.sin_port = htons(port);
            start();
        }
};

int main(int argc, char* argv[])
{
    if(argc != 4)
    {
        cerr << "Invalid parameters\nUsage: >client <name> <port> <interval>" << endl;
        exit(0);
    }

    //char name[100] = "Debian";
    char *name = argv[1];
    int port = atoi(argv[2]);
    int timeInterval = atoi(argv[3]);
    //Client c1("Debian", 12345, 1);
    Client c1(name, port, timeInterval);
    return 0;
}
