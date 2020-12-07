import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { from, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ApiServiceService } from 'src/app/services/api-service.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import Toast from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  searchText = null;
  subject = new Subject();
  userList = null;
  taskList = null;
  taskListOrg = null;
  isLoading = false;
  createTaskForm: FormGroup;
  submitted = false;
  editMode = false;
  changeAssinMode = false;

  taskPriority = { high: [], medium: [], low: [] };

  constructor(private apiService: ApiServiceService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.getTask();
    this.getUsers();
    this.searchData();
    this.initCreatForm();
  }
  searchData(): void {
    this.subject.pipe(
      map(data => data as string),
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe(searchString => {
      const t = searchString;
      let temp;
      if (!searchString) {
        temp = this.taskListOrg;
      }
      else {
        temp = this.taskListOrg.filter(item => {
          return item.message.toLowerCase().indexOf(searchString.toLowerCase()) >= 0;
        });

      }
      this.formatTasksList(temp);
    });
  }
  getUsers() {
    this.apiService.getUserList().subscribe(data => {
      this.userList = data.users;
      console.log('geting user ', data.users);
    }, err => {
      this.userList = [];
      console.log('geting user error', err);
    });
  }
  getTask() {
    this.isLoading = true;
    this.apiService.taskList.subscribe(data => {
      this.isLoading = false;
      this.taskListOrg = data;
      this.formatTasksList(this.taskListOrg);
      console.log('geting task ', data);
    }, err => {
      this.taskList = [];
      console.log('geting task error', err);
    });
  }
  initCreatForm() {
    this.editMode = false;
    this.createTaskForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(5)]],
      due_date: ['', [Validators.required]],
      priority: ['0'],
      assigned_to: ['', [Validators.required]],
      taskid: [''],
    });
  }
  get message() {
    return this.createTaskForm.get('message');
  }
  get due_date() {
    return this.createTaskForm.get('due_date');
  }
  get priority() {
    return this.createTaskForm.get('priority');
  }
  get assigned_to() {
    return this.createTaskForm.get('assigned_to');
  }
  onSubmit() {
    console.log(this.createTaskForm.value);
    debugger;
    if (!this.createTaskForm.valid) {
      return;
    }
    this.submitted = true;
    document.getElementById('closeModal').click();
    this.isLoading = true;
    this.createTaskForm.value.due_date = moment(this.createTaskForm.value.due_date).format('yyyy-MM-DD hh:mm:ss');
    this.apiService.createUdateNewTask(this.createTaskForm.value, this.editMode).subscribe(data => {
      debugger;
      this.apiService.getTaskList();
      this.submitted = false;
      Swal.fire('Thank you...', `You task ${this.editMode ? 'updated' : 'created'} succesfully!`, 'success');

    }, err => {
      console.log('create new task error', err);
      this.submitted = false;
      Swal.fire('OPSS...', 'unable to create task!', 'error')


    });
  }

  changePrority(seldata, selpriority) {
    this.apiService.createUdateNewTask({ priority: selpriority, taskid: seldata.id }, true).subscribe(data => {
      // Swal.fire('Thank you...', 'You task moved succesfully!', 'success');
      this.showToast('You task moved succesfully', true);
    }, err => {
      console.log('create new task error', err);
      this.submitted = false;
      // Swal.fire('OPSS...', 'unable to move task!', 'error');
      this.showToast('unable to move task!', false);


    });
  }
  changeUserAssign(seldata, selpriority) {
    this.apiService.createUdateNewTask({ priority: selpriority, taskid: seldata.id }, true).subscribe(data => {
      // Swal.fire('Thank you...', 'You task moved succesfully!', 'success');
      this.showToast('You task moved succesfully', true);
    }, err => {
      console.log('create new task error', err);
      this.submitted = false;
      // Swal.fire('OPSS...', 'unable to move task!', 'error');
      this.showToast('unable to move task!', false);


    });
  }
  onDrop(event: CdkDragDrop<string[]>, priority) {
    debugger;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      this.changePrority(event.previousContainer.data[event.previousIndex], priority);
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }
  deleteTask(task) {
    if (!confirm('Are you sure to delete')) {
      return;
    }
    this.isLoading = true;
    this.apiService.deleteTask(task.id).subscribe(data => {
      debugger;
      this.apiService.getTaskList();
    }, err => {
      console.log('delete new task error', err);

    });
  }
  editForm(data) {
    if (data.due_date) {
      const dd = moment(data.created_on).format('YYYY-MM-DDTH:mm');
      data.due_date = dd;
    }
    this.editMode = true;
    this.createTaskForm.patchValue({
      message: data.message,
      due_date: data.due_date,
      priority: data.priority,
      assigned_to: data.assigned_to,
      taskid: data.id
    });
  }
  formatTasksList(filteredTask) {
    this.taskList = filteredTask.filter(data => {
      return data.priority === '0';
    });
    this.taskPriority.high = filteredTask.filter(data => {
      return data.priority === '1';
    });
    this.taskPriority.medium = filteredTask.filter(data => {
      return data.priority === '2';
    });
    this.taskPriority.low = filteredTask.filter(data => {
      return data.priority === '3';
    });
  }
  showToast(msg, success = false) {
    Toast.fire({
      icon: success ? 'success' : 'error',
      title: msg,
      toast: true,
      position: 'top-right',
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 3000
    });
  }
}
