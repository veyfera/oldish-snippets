import React, {useEffect, useState} from 'react';
import './styles/main.sass';
import Aside from './components/Aside';
import Main from './components/Main';
import Footer from './components/Footer';
import {AuthContext} from './context/AuthContext';
import {CompanyInterface} from './types';

function App() {

    const [authToken, setAuthToken] = useState<string>()

    const getAuthToken = async () => {
        let savedToken = localStorage.getItem('token')
        if (savedToken) {
            setAuthToken(savedToken)
            console.log('used saved token: ', savedToken)
            return
        }

        let res = await fetch('/auth?user=USERNAME');
        let token = res.headers.get("Authorization")
        if (token){
            setAuthToken(token);
            localStorage.setItem('token', token)
            console.log('got new token: ', token)
        }
    }
    useEffect(() => {
        getAuthToken()
    }, [])

  return (
    <>
        <AuthContext.Provider value={authToken!}>
            <Aside />
            <Main />
            <Footer />
        </AuthContext.Provider>
    </>
  );
}

export default App;
