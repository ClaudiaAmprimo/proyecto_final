import { Component, OnInit } from '@angular/core';
import { CurrentTripService } from '../../services/current-trip.service';
import { CostService } from '../../services/cost.service';

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

  constructor(
    private currentTripService: CurrentTripService,
    private costService: CostService
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit: Subscribing to currentTripId$');
    console.log('currentTripId from localStorage:', localStorage.getItem('currentViajeId'));

    this.currentTripService.currentTripId$.subscribe((id: number | null) => {
      console.log('Subscription to currentTripId$: received id:', id);

      this.viajeId = id;
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.userId = user?.id_user || null;

      if (this.viajeId) {
        console.log('viajeId found, loading cost distributions for viajeId:', this.viajeId);
        this.loadCostDistributions(this.viajeId);
        this.loadTotalPaidByUsers(this.viajeId);
        this.loadSumCostDistributionsByUser(this.viajeId);
        this.loadUserBalances(this.viajeId);

        if (this.userId) {
          this.loadUserBalanceByUser(this.viajeId, this.userId);
        }
      } else {
        console.warn('No hay viaje seleccionado');
      }
    });
  }

  loadCostDistributions(viajeId: number) {
    console.log('Cargando distribuciones de costos para el viajeId:', viajeId);

    this.costService.getCostDistributionsByViajeId(viajeId).subscribe({
      next: (response) => {
        this.costDistributions = response.data;
        console.log('Distribuciones de costos recibidas:', this.costDistributions);
      },
      error: (error) => {
        console.error('Error al obtener las distribuciones de costos:', error);
      }
    });
  }

  loadTotalPaidByUsers(viajeId: number) {
    this.costService.getTotalPaidByUsers(viajeId).subscribe({
      next: (response) => {
        this.userPaidBalances = response.data;
        console.log('Total pagado por usuarios:', this.userPaidBalances);
      },
      error: (error) => {
        console.error('Error al obtener el total pagado por usuarios:', error);
      }
    });
  }

  loadSumCostDistributionsByUser(viajeId: number) {
    this.costService.getSumCostDistributionsByUser(viajeId).subscribe({
      next: (response) => {
        this.userCostSums = response.data;
        console.log('Suma de distribuciones de costos por usuario:', this.userCostSums);
      },
      error: (error) => {
        console.error('Error al obtener la suma de las distribuciones de costos:', error);
      }
    });
  }

  loadUserBalances(viajeId: number) {
    this.costService.getUserBalanceByTrip(viajeId).subscribe({
      next: (response) => {
        console.log('Datos recibidos para balances:', response.data);
        this.userBalances = response.data;
        this.simplifiedBalances = this.simplifyBalances(this.userBalances);
        console.log('Balances por usuario simplificados:', this.simplifiedBalances);
      },
      error: (error) => {
        console.error('Error al obtener los balances por usuario:', error);
      }
    });
  }

  loadUserBalanceByUser(viajeId: number, userId: number) {
    this.costService.getUserBalanceByUser(viajeId, userId).subscribe({
      next: (response) => {
        if (response.data.length > 0) {
          this.userBalance = response.data;
          console.log('Balance específico del usuario:', this.userBalance);
          this.simplifiedBalances = this.simplifyBalances(this.userBalance);
          console.log('Simplified balances:', this.simplifiedBalances);
        } else {
          console.log('No hay deudas o acreencias para este usuario.');
          this.userBalance = [];
        }
      },
      error: (error) => {
        if (error.status === 404) {
          console.warn('El usuario no tiene deudas ni acreencias.');
          this.userBalance = [];
        } else {
          console.error('Error al obtener el balance específico del usuario:', error);
        }
      }
    });
  }

  simplifyBalances(balances: any[]): any[] {
    const simplified: any[] = [];
    const balanceMap = new Map<string, { deudor_name: string, acreedor_name: string, net_balance: number }>();

    console.log('Balances antes de simplificar:', balances);

    for (const balance of balances) {
      const key = `${balance.deudor_id}-${balance.acreedor_id}`;
      const reverseKey = `${balance.acreedor_id}-${balance.deudor_id}`;

      if (balance.deudor_id === balance.acreedor_id) {
        console.log('Omitiendo balance donde el usuario se debe a sí mismo:', balance);
        continue;
      }

      if (balanceMap.has(reverseKey)) {
        const reverseBalance = balanceMap.get(reverseKey)!;
        const newBalance = reverseBalance.net_balance - balance.net_balance;

        if (newBalance === 0) {
          console.log('Eliminando deuda por saldo cero:', reverseKey);
          balanceMap.delete(reverseKey);
        } else {
          console.log('Actualizando balance inverso:', reverseKey, 'Nuevo balance:', newBalance);
          reverseBalance.net_balance = newBalance;
          balanceMap.set(reverseKey, reverseBalance);
        }
      } else {
        console.log('Agregando nuevo balance:', key, balance);
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

    console.log('Balances simplificados:', simplified);
    return simplified;
  }
}
