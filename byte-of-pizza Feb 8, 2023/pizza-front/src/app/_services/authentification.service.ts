import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../utils/types';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
    private currentUserSubject!: BehaviorSubject<User>;
    public currentUser: Observable<User> = new Observable<User>;
    private apiUrl = '/api/user/login';
    //private apiUrl = '/api/user/signup';

    constructor(private http: HttpClient) {
        const oldToken = localStorage.getItem('currentUser');
        if (oldToken) {
            this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(oldToken));
        } else {
            this.currentUserSubject = new BehaviorSubject<User>({id:'', username:'', token:''})
        }
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${this.apiUrl}`, { username, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next({id:'', username:'', token:''});
    }
}
