import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {
  baseUrl = 'https://devza.com';
  taskList = new Subject();
  constructor(private http: HttpClient) {
    this.getTaskList();
  }

  getUserList(): Observable<any> {
    return this.http.get<any>(this.baseUrl + '/tests/tasks/listusers');
  }
  getTaskList() {
    this.http.get<any>(this.baseUrl + '/tests/tasks/list').subscribe(data => {
      this.taskList.next(data.tasks);
    }, err => {
      console.log('task list api error', err);

    });
  }
  createUdateNewTask(jsonData, editMode = false): Observable<any> {
    const formData = new FormData();
    Object.keys(jsonData).forEach((key) => { formData.append(key, jsonData[key]); });
    if (editMode) {
      return this.http.post<any>(this.baseUrl + '/tests/tasks/update', formData);
    } else {

      return this.http.post<any>(this.baseUrl + '/tests/tasks/create', formData);
    }
  }
  deleteTask(id): Observable<any> {
    const formData = new FormData();
    formData.append('taskid', id);
    return this.http.post<any>(this.baseUrl + '/tests/tasks/delete', formData);
  }
}
