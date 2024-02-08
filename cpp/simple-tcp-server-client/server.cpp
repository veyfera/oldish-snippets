#include <iostream>
#include <stdio.h>
#include<sys/socket.h>
#include<netinet/in.h>
#include<string.h>
#include<unistd.h>
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

        fd_set master;
        FD_ZERO(&master);

        FD_SET(serverSd, &master);

        cout << "Before while llop" << endl;
        while(1)
        {
            fd_set copy = master;
            int socketCount = select(0, &copy, nullptr, nullptr, nullptr);
            cout << "In while loop" << endl;
            for(int i = 0; i < socketCount; i++)
            {
                cout << "Entered for loop" << endl;
                int sock = FD_ISSET(i, &copy);

                if(sock == serverSd)
                {
                    cout << "New connection incoming" << endl;
                    sockaddr_in newAddr;
                    socklen_t newSocketAddrSize = sizeof(newAddr);
                    int client = accept(serverSd, (struct sockaddr*)&newAddr,
                            &newSocketAddrSize);
                    FD_SET(client, &master);
                    cout << "New client connected" << endl;
                }
                else
                {
                    cout << "New message came" << endl;
                    memset(&msg, 0, sizeof(msg));

                    int bytesIn = recv(sock, msg, 1000, 0);
                    if (bytesIn <= 0)
                    {
                        close(sock);
                        FD_CLR(sock, &master);
                    }
                    else
                    {
                        cout << msg << endl;
                    }

                }

            }

        }
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

    s1.start();
    return 0;
}
