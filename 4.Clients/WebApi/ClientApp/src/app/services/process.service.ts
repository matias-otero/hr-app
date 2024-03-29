import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app-config/app.config';
import { BaseService } from './base.service';
import { Router } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Process } from 'src/entities/process';
import { Candidate } from 'src/entities/candidate';
import { mergeMap } from 'rxjs-compat/operator/mergeMap';

@Injectable()
export class ProcessService extends BaseService {
  constructor(router: Router, config: AppConfig, http: HttpClient) {
    super(router, config, http);
    this.candidatesUrl += this.apiUrl + 'Candidates';
    this.apiUrl += 'Process';
  }

  candidatesUrl: string = '';

  public approve(processID: number): Observable<any> {
    return this.http.post(this.apiUrl + '/Approve', processID, {
      headers: this.headersWithAuth, observe: 'response'
    })
      .pipe(
        tap(data => {}),
        catchError(this.handleErrors)
      );
  }

  public reject(processID: number, rejectionReason: string): Observable<any> {
    let rejectProcessVm = {
      id: processID,
      rejectionReason: rejectionReason
    };
    return this.http.post(this.apiUrl + '/Reject', rejectProcessVm, {
      headers: this.headersWithAuth, observe: 'response'
    })
      .pipe(
        tap(entities => {}),
        catchError(this.handleErrors)
      );
  }

  public updateProcessCandidate(processID: number, process: Process, candidateID: number, candidate: Candidate): Observable<any>{
    const processUrl = `${this.apiUrl}/${processID.toString()}`;
    const candidateUrl =  `${this.candidatesUrl}/${candidateID.toString()}`;
    
    let processCall = this.http.put(processUrl, process, {
      headers: this.headersWithAuth
    }).pipe(
      tap(_ => {}),
      catchError(this.handleErrors)
    );

    let candidateCall = this.http.put(candidateUrl, candidate, {
      headers: this.headersWithAuth
    }).pipe(
      tap(_ => {}),
      catchError(this.handleErrors)
    );

    return forkJoin([processCall, candidateCall]);
  }
}