#include <iostream>
#include <stdio.h>
#include<sys/socket.h>
#include<netinet/in.h>
#include<string.h>
//#include<string.h>
//#include <stdlib.h>
//#include<sys/types.h>
//#include<netdb.h>
//#include<arpa/inet.h>
//#include<fstream>
//#include<sys/uio.h>
//#include<unistd.h>
using namespace std;

class Server
{
    int port;
    char msg[1000];
    sockaddr_in serverAddr;
    public:
    Server(int p)
    {
        port = p;
        //bzero((char*)&serverAddr, sizeof(serverAddr));
        //serverAddr = {};
        serverAddr.sin_family = AF_INET;
        serverAddr.sin_addr.s_addr = htonl(INADDR_ANY);
        serverAddr.sin_port = htons(port);
    }

    void start()
    {
        int serverSd = socket(AF_INET, SOCK_STREAM, 0);
        if(serverSd < 0)
        {
            cerr << "Error establishing server socket" << endl;
            exit(0);
        }

        int bindStatus = bind(serverSd, (struct sockaddr*) &serverAddr,
                sizeof(serverAddr));
        if(bindStatus < 0)
        {
            cerr << "Error binding socket to local address" << endl;
            exit(0);
        }
        cout << "Ready for connections, listening on port: " << port << endl;
        listen(serverSd, 5);

        sockaddr_in newAddr;
        socklen_t newSocketAddrSize = sizeof(newAddr);
        int newSd = accept(serverSd, (struct sockaddr*)&newAddr, &newSocketAddrSize);
        if(newSd < 0)
        {
            //cerr << "Error connecting with client" << endl;
            cerr << "Error accepting request from client" << endl;
            exit(0);
        }
        cout << "Connected with client" << endl;
        int bts;
        //do
        while(1)
        {
            memset(&msg, 0, sizeof(msg));
            bts = recv(newSd, (char*)&msg, sizeof(msg), 0);
            if(bts != 0)
            {
                cout << msg << endl;
                //cout << "Got message from client" << endl;
                //break;
            }
            //send(newSd, (char*)&msg, strlen(msg) 0);
        }
        //} while(bts)
    }

    void me()
    {
        cout << "I am a server, my port number is : " << port << endl;
    }
};

int main(int argc, char* argv[])
{
    if(argc != 2)
    {
        cerr << "Usage: port" << endl;
        exit(0);
    }
    int port = atoi(argv[1]);
    Server s1(port);
    //s1(321);
    //cout << "User defined server:";
    //s1.me();
    //cout << "Predefined server:";
    //s2.me();

    s1.start();
    //return 0;
}
