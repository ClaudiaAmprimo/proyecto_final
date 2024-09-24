import { Component, OnInit } from '@angular/core';
import { CurrentTripService } from '../../services/current-trip.service';
import { CostService } from '../../services/cost.service';
import { EventService } from '../../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [],
  templateUrl: './graficos.component.html',
  styleUrl: './graficos.component.scss'
})
export class GraficosComponent implements OnInit {
  viajeId: number | null = null;
  userId: number | null = null;
  costDistributions: any[] = [];
  userPaidBalances: any[] = [];
  userCostSums: any[] = [];
  userBalances: any[] = [];
  userBalance: any[] = [];
  simplifiedBalances: any[] = [];
  isLoading = true;

  constructor(
    private currentTripService: CurrentTripService,
    private costService: CostService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit: Subscribing to currentTripId$');
    console.log('currentTripId from localStorage:', localStorage.getItem('currentViajeId'));

    this.route.paramMap.subscribe(params => {
      this.viajeId = Number(params.get('id_viaje'));
      this.loadDataForTrip();
    });

    this.eventService.eventChanges$.subscribe(() => {
      this.loadDataForTrip();
    });
  }

  loadDataForTrip() {
    if (this.viajeId) {
      this.isLoading = true;
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.userId = user?.id_user || null;
      console.log('viajeId found, loading cost distributions for viajeId:', this.viajeId);

      Promise.all([
        this.loadCostDistributions(this.viajeId),
        this.loadTotalPaidByUsers(this.viajeId),
        this.loadSumCostDistributionsByUser(this.viajeId),
        this.loadUserBalances(this.viajeId)
      ]).then(() => {
        if (this.viajeId && this.userId) {
          return this.loadUserBalanceByUser(this.viajeId, this.userId);
        } else {
          return Promise.resolve();
        }
      }).then(() => {
        this.isLoading = false;
      }).catch(error => {
        console.error('Error al cargar datos del viaje:', error);
        this.isLoading = false;
      });
    } else {
      console.warn('No hay viaje seleccionado');
    }
  }

  loadCostDistributions(viajeId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.costService.getCostDistributionsByViajeId(viajeId).subscribe({
        next: (response) => {
          this.costDistributions = response.data;
          console.log('Distribuciones de costos recibidas:', this.costDistributions);
          resolve();
        },
        error: (error) => {
          console.error('Error al obtener las distribuciones de costos:', error);
          reject(error);
        }
      });
    });
  }

  loadTotalPaidByUsers(viajeId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.costService.getTotalPaidByUsers(viajeId).subscribe({
        next: (response) => {
          this.userPaidBalances = response.data;
          console.log('Total pagado por usuarios:', this.userPaidBalances);
          resolve();
        },
        error: (error) => {
          console.error('Error al obtener el total pagado por usuarios:', error);
          reject(error);
        }
      });
    });
  }

  loadSumCostDistributionsByUser(viajeId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.costService.getSumCostDistributionsByUser(viajeId).subscribe({
        next: (response) => {
          this.userCostSums = response.data;
          console.log('Suma de distribuciones de costos por usuario:', this.userCostSums);
          resolve();
        },
        error: (error) => {
          console.error('Error al obtener la suma de las distribuciones de costos:', error);
          reject(error);
        }
      });
    });
  }

  loadUserBalances(viajeId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.costService.getUserBalanceByTrip(viajeId).subscribe({
        next: (response) => {
          this.userBalances = response.data;
          this.simplifiedBalances = this.simplifyBalances(this.userBalances);
          console.log('Balances por usuario simplificados:', this.simplifiedBalances);
          resolve();
        },
        error: (error) => {
          console.error('Error al obtener los balances por usuario:', error);
          reject(error);
        }
      });
    });
  }

  loadUserBalanceByUser(viajeId: number, userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.costService.getUserBalanceByUser(viajeId, userId).subscribe({
        next: (response) => {
          if (response.data.length > 0) {
            this.userBalance = response.data;
            this.simplifiedBalances = this.simplifyBalances(this.userBalance);
            console.log('Simplified balances:', this.simplifiedBalances);
          } else {
            this.userBalance = [];
          }
          resolve();
        },
        error: (error) => {
          if (error.status === 404) {
            this.userBalance = [];
          } else {
            console.error('Error al obtener el balance específico del usuario:', error);
          }
          reject(error);  
        }
      });
    });
  }


  simplifyBalances(balances: any[]): any[] {
    const simplified: any[] = [];
    const balanceMap = new Map<string, { deudor_name: string, acreedor_name: string, net_balance: number }>();

    for (const balance of balances) {
      const key = `${balance.deudor_id}-${balance.acreedor_id}`;
      const reverseKey = `${balance.acreedor_id}-${balance.deudor_id}`;

      if (balance.deudor_id === balance.acreedor_id) {
        continue;
      }

      if (balanceMap.has(reverseKey)) {
        const reverseBalance = balanceMap.get(reverseKey)!;
        const newBalance = reverseBalance.net_balance - balance.net_balance;

        if (newBalance === 0) {
          balanceMap.delete(reverseKey);
        } else {
          reverseBalance.net_balance = newBalance;
          balanceMap.set(reverseKey, reverseBalance);
        }
      } else {
        balanceMap.set(key, {
          deudor_name: balance.deudor_name,
          acreedor_name: balance.acreedor_name,
          net_balance: balance.net_balance
        });
      }
    }

    balanceMap.forEach((value) => {
      simplified.push({
        deudor_name: value.deudor_name,
        acreedor_name: value.acreedor_name,
        net_balance: value.net_balance
      });
    });

    return simplified;
  }
}
