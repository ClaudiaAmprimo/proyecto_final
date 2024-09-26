import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CurrentTripService } from '../../services/current-trip.service';
import { CostService } from '../../services/cost.service';
import { EventService } from '../../services/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './graficos.component.html',
  styleUrl: './graficos.component.scss'
})
export class GraficosComponent implements OnInit {
  @ViewChild('costChart', { static: false }) costChart!: ElementRef;
  chart: any;
  viajeId: number | null = null;
  userId: number | null = null;
  costDistributions: any[] = [];
  userPaidBalances: any[] = [];
  userCostSums: any[] = [];
  userBalances: any[] = [];
  userBalance: any[] = [];

  generalSimplifiedBalances: any[] = [];
  userSimplifiedBalances: any[] = [];

  isLoading = true;

  constructor(
    private currentTripService: CurrentTripService,
    private costService: CostService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
  ) {
    Chart.register(...registerables);
    Chart.register(ChartDataLabels);
  }

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

          if (this.userCostSums.length > 0) {
            console.log('Datos para la gráfica:', this.userCostSums);
            this.generateCostDistributionChart();
          } else {
            console.error('No hay datos suficientes para generar el gráfico');
          }
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
          this.userBalances = response.data.map((balance: any) => ({
            ...balance,
            net_balance: Number(balance.net_balance),
            paid_amount: Number(balance.paid_amount),
            cost_distribution_id: Number(balance.cost_distribution_id)
          }));
          console.log('Balances por usuario:', this.userBalances);

          this.generalSimplifiedBalances = this.simplifyBalances(this.userBalances);
          console.log('Balances simplificados generales:', this.generalSimplifiedBalances);
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
            this.userBalance = response.data.map((balance: any) => ({
              ...balance,
              net_balance: Number(balance.net_balance),
              paid_amount: Number(balance.paid_amount)
            }));
            console.log('Converted userBalance:', this.userBalance);
            this.userSimplifiedBalances = this.simplifyBalances(this.userBalance);
            console.log('Simplified balances del usuario:', this.userSimplifiedBalances);
          } else {
            this.userBalance = [];
            this.userSimplifiedBalances = [];
          }
          resolve();
        },
        error: (error) => {
          if (error.status === 404) {
            this.userBalance = [];
            this.userSimplifiedBalances = [];
          } else {
            console.error('Error al obtener el balance específico del usuario:', error);
          }
          reject(error);
        }
      });
    });
  }

  generateCostDistributionChart() {

    if (!this.costChart) {
      console.error('CostChart element not available');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const userNames = this.userCostSums.map(sum => `${sum.name} ${sum.surname}`);
    const totalAmounts = this.userCostSums.map(sum => sum.total_amount);

    if (userNames.length === 0 || totalAmounts.length === 0) {
      console.error('No hay datos suficientes para generar el gráfico');
      return;
    }

    const data = {
      labels: userNames,
      datasets: [{
        label: 'Distribución de Costos por Usuario (€)',
        data: totalAmounts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1
      }]
    };

    this.chart = new Chart(this.costChart.nativeElement, {
      type: 'bar',
      data: data,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          datalabels: {
            color: '#000',
            anchor: 'end',
            align: 'top',
            formatter: (value: any) => {
              return typeof value === 'number' ? `€${value.toFixed(2)}` : '€0.00';
            }
          }
        },
        responsive: true
      }
    });
  }

  simplifyBalances(balances: any[]): any[] {
    const balanceMap = new Map<string, {
      deudor_name: string,
      deudor_surname: string,
      acreedor_name: string,
      acreedor_surname: string,
      net_balance: number,
      cost_distributions: {
        id: number,
        amount: number,
        paid_amount: number
      }[]
    }>();

    balances.forEach(balance => {
      if (balance.deudor_id === balance.acreedor_id) {
        console.log(`Excluyendo deuda donde deudor_id (${balance.deudor_id}) == acreedor_id (${balance.acreedor_id})`);
        return;
      }

      const key = `${balance.deudor_id}-${balance.acreedor_id}`;

      if (balanceMap.has(key)) {
        const existing = balanceMap.get(key)!;
        existing.net_balance += (balance.amount - balance.paid_amount);
        existing.cost_distributions.push({
          id: balance.cost_distribution_id,
          amount: balance.amount,
          paid_amount: balance.paid_amount
        });
        balanceMap.set(key, existing);
      } else {
        balanceMap.set(key, {
          deudor_name: balance.deudor_name,
          deudor_surname: balance.deudor_surname,
          acreedor_name: balance.acreedor_name,
          acreedor_surname: balance.acreedor_surname,
          net_balance: balance.amount - balance.paid_amount,
          cost_distributions: [{
            id: balance.cost_distribution_id,
            amount: balance.amount,
            paid_amount: balance.paid_amount
          }]
        });
      }
    });

    const simplified: any[] = [];

    balanceMap.forEach((value, key) => {
      if (value.net_balance > 0) {
        simplified.push({
          deudor_name: value.deudor_name,
          deudor_surname: value.deudor_surname,
          acreedor_name: value.acreedor_name,
          acreedor_surname: value.acreedor_surname,
          net_balance: value.net_balance,
          cost_distributions: value.cost_distributions
        });
      }
    });
    console.log('Balances simplificados:', simplified);
    return simplified;
  }

  pagarDeuda(balance: any) {
    const paymentAmount = balance.net_balance;
    if (paymentAmount > 0) {
      let remainingAmount = paymentAmount;
      const totalDeudaPendiente = balance.cost_distributions.reduce((sum: number, dist: any) => sum + (dist.amount - dist.paid_amount), 0);

      balance.cost_distributions.forEach((distribution: { id: number; amount: number; paid_amount: number }) => {
        if (remainingAmount <= 0) return;

        const deudaPendiente = distribution.amount - distribution.paid_amount;
        const proportion = deudaPendiente / totalDeudaPendiente;
        const payment = Math.min(remainingAmount, paymentAmount * proportion);

        if (payment > 0) {
          this.costService.payDebt(distribution.id, payment).subscribe({
            next: (response) => {
              console.log(`Pago realizado con éxito para distribución ID ${distribution.id}:`, response);
              if (this.viajeId !== null) {
                this.loadUserBalances(this.viajeId).then(() => {
                  this.changeDetector.detectChanges();
                  console.log('Balances generales actualizados después del pago.');
                }).catch(error => {
                  console.error('Error al actualizar los balances generales después del pago:', error);
                });

                this.loadUserBalanceByUser(this.viajeId, this.userId!).then(() => {
                  this.changeDetector.detectChanges();
                  console.log('Balances específicos del usuario actualizados después del pago.');
                }).catch(error => {
                  console.error('Error al actualizar los balances específicos del usuario después del pago:', error);
                });
              } else {
                console.warn('El viajeId es null. No se puede cargar los balances.');
              }
            },
            error: (error) => {
              console.error(`Error al procesar el pago para distribución ID ${distribution.id}:`, error);
            }
          });

          remainingAmount -= payment;
        }
      });
    } else {
      console.warn('No hay deuda pendiente para pagar.');
    }
  }
}
