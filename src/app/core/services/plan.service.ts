import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Plan } from '../../shared/models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Piani visibili a clienti e pubblico (solo quelli attivi).
  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/api/plans`);
  }

  // Vista admin: ci sono anche i piani disabilitati.
  getAdminPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/api/admin/plans`);
  }

  createPlan(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/admin/plans`, data);
  }

  // Disabilita un piano senza cancellarlo: resta in DB, sparisce solo dal pubblico.
  disablePlan(planId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/api/admin/plans/${planId}/disable`, {});
  }

  enablePlan(planId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/api/admin/plans/${planId}/enable`, {});
  }

  updatePlan(planId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/admin/plans/${planId}`, data);
  }
}

