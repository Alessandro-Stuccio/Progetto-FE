import { Injectable } from '@angular/core';
import { AuthUser, UserRole } from '../../shared/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  isClient(user: AuthUser | null): boolean {
    return user?.role === UserRole.CLIENT;
  }

  isProfessional(user: AuthUser | null): boolean {
    const r = user?.role;
    return r === UserRole.PERSONAL_TRAINER || r === UserRole.NUTRITIONIST;
  }

  isAdmin(user: AuthUser | null): boolean {
    return user?.role === UserRole.ADMIN;
  }

  isModerator(user: AuthUser | null): boolean {
    return user?.role === UserRole.MODERATOR;
  }

  isInsuranceManager(user: AuthUser | null): boolean {
    return user?.role === UserRole.INSURANCE_MANAGER;
  }
}
