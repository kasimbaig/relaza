import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-maintop-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './maintop-dashboard.component.html',
  styleUrls: ['./maintop-dashboard.component.css'],
})
export class MaintopDashboardComponent implements OnInit, AfterViewInit {

  // Chart references
  @ViewChild('taskStatusChart', { static: false }) taskStatusChartRef!: ElementRef;
  @ViewChild('monthlyTrendChart', { static: false }) monthlyTrendChartRef!: ElementRef;
  @ViewChild('acquaintsChart', { static: false }) acquaintsChartRef!: ElementRef;
  @ViewChild('sparesChart', { static: false }) sparesChartRef!: ElementRef;
  @ViewChild('oemEfficiencyChart', { static: false }) oemEfficiencyChartRef!: ElementRef;

  // Chart instances
  private taskStatusChart: Chart | null = null;
  private monthlyTrendChart: Chart | null = null;
  private acquaintsChart: Chart | null = null;
  private sparesChart: Chart | null = null;
  private oemEfficiencyChart: Chart | null = null;

  // --- Filter Properties ---
  // Dropdown 1: Organizational Level (INSMAT, NHQ)
  organizationalFilterOptions: { label: string, value: string }[] = [
    { label: 'Overall (INSMAT)', value: 'INSMAT' },
    { label: 'Naval Headquarters (NHQ)', value: 'NHQ' }
  ];
  selectedOrganizationalFilter: string = 'INSMAT'; // Default value: Overall INSMAT

  // Dropdown 2: Command
  commandOptions: { label: string, value: string }[] = [];
  selectedCommand: string | null = null; // Specific command (e.g., Eastern, Western)

  // Dropdown 3: Ship
  shipOptions: { label: string, value: string }[] = [];
  selectedShip: string | null = null; // Specific ship name (e.g., INS Vikrant)

  // --- KPI Card Data ---
  kpiMetrics = [
    {
      title: 'Total Active Tasks',
      value: 0,
      description: 'Tasks currently in progress or assigned.',
      iconClass: 'pi pi-list',
      type: 'ACTIVE_TASKS',
      color: '#1e40af'
    },
    {
      title: 'Overdue Tasks',
      value: 0,
      description: 'Tasks past their scheduled completion date.',
      iconClass: 'pi pi-clock',
      type: 'OVERDUE_TASKS',
      color: '#dc2626'
    },
    {
      title: 'Monthly Completion Rate',
      value: '0%',
      description: 'Percentage of planned tasks completed this month.',
      iconClass: 'pi pi-chart-bar',
      type: 'MONTHLY_COMPLETION',
      color: '#16a34a'
    },
    {
      title: 'OEM Routine Optimizations',
      value: '0 New',
      description: 'New optimized routines identified from OEM comparisons.',
      iconClass: 'pi pi-compass',
      type: 'OEM_OPTIMIZATIONS',
      color: '#2563eb'
    },
  ];

  // --- Drill-down Dialog Properties ---
  displayDrilldownDialog: boolean = false;
  drilldownDialogTitle: string = '';
  drilldownTableData: any[] = [];
  drilldownTableCols: any[] = [];

  exportOptions: MenuItem[] = [];

  // --- Mock Data Store (Expanded for granularity) ---
  private mockDatabase = {
    tasks: [
      { id: 1, title: 'Engine Maintenance', status: 'Active', command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP', dueDate: '2024-01-15', completionDate: null },
      { id: 2, title: 'Navigation System Check', status: 'Completed', command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP', dueDate: '2024-01-10', completionDate: '2024-01-08' },
      { id: 3, title: 'Hull Inspection', status: 'Overdue', command: 'Western', ship: 'INS Delhi', scope: 'SHIP', dueDate: '2024-01-05', completionDate: null },
      { id: 4, title: 'Communication Equipment', status: 'Pending Approval', command: 'Western', ship: 'INS Delhi', scope: 'SHIP', dueDate: '2024-01-20', completionDate: null },
      { id: 5, title: 'Propulsion System', status: 'Active', command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP', dueDate: '2024-01-25', completionDate: null },
      { id: 6, title: 'Safety Equipment Check', status: 'Completed', command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP', dueDate: '2024-01-12', completionDate: '2024-01-10' },
      { id: 7, title: 'Electrical Systems', status: 'Active', command: 'Western', ship: 'INS Delhi', scope: 'SHIP', dueDate: '2024-01-30', completionDate: null },
      { id: 8, title: 'Weapon Systems', status: 'Overdue', command: 'Western', ship: 'INS Delhi', scope: 'SHIP', dueDate: '2024-01-03', completionDate: null },
      { id: 9, title: 'Life Support Systems', status: 'Completed', command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP', dueDate: '2024-01-18', completionDate: '2024-01-15' },
      { id: 10, title: 'Radar Systems', status: 'Active', command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP', dueDate: '2024-02-05', completionDate: null }
    ],
    acquaints: [
      { id: 1, reason: 'Equipment Failure', command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP' },
      { id: 2, reason: 'Routine Anomaly', command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP' },
      { id: 3, reason: 'Tool Issue', command: 'Western', ship: 'INS Delhi', scope: 'SHIP' },
      { id: 4, reason: 'Spares Defect', command: 'Western', ship: 'INS Delhi', scope: 'SHIP' },
      { id: 5, reason: 'Operational Feedback', command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP' },
      { id: 6, reason: 'Equipment Failure', command: 'Western', ship: 'INS Delhi', scope: 'SHIP' },
      { id: 7, reason: 'Routine Anomaly', command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP' }
    ],
    spares: [
      { id: 1, category: 'Mechanical', quantity: 15, command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP' },
      { id: 2, category: 'Electrical', quantity: 8, command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP' },
      { id: 3, category: 'Hydraulic', quantity: 12, command: 'Western', ship: 'INS Delhi', scope: 'SHIP' },
      { id: 4, category: 'Consumables', quantity: 25, command: 'Western', ship: 'INS Delhi', scope: 'SHIP' },
      { id: 5, category: 'Specialized', quantity: 6, command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP' },
      { id: 6, category: 'Mechanical', quantity: 10, command: 'Western', ship: 'INS Delhi', scope: 'SHIP' },
      { id: 7, category: 'Electrical', quantity: 12, command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP' }
    ],
    oem: [
      { id: 1, oem: 'Bharat Electronics', efficiencyScore: 4.2, command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP' },
      { id: 2, oem: 'Hindustan Aeronautics', efficiencyScore: 3.8, command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP' },
      { id: 3, oem: 'Mazagon Dock', efficiencyScore: 5.1, command: 'Western', ship: 'INS Delhi', scope: 'SHIP' },
      { id: 4, oem: 'Garden Reach Shipbuilders', efficiencyScore: 4.7, command: 'Western', ship: 'INS Delhi', scope: 'SHIP' },
      { id: 5, oem: 'Cochin Shipyard', efficiencyScore: 3.9, command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP' },
      { id: 6, oem: 'Bharat Heavy Electricals', efficiencyScore: 4.5, command: 'Western', ship: 'INS Delhi', scope: 'SHIP' },
      { id: 7, oem: 'Bharat Dynamics', efficiencyScore: 4.0, command: 'Eastern', ship: 'INS Vikrant', scope: 'SHIP' }
    ]
  };

  constructor(private location: Location) {}

  ngOnInit(): void {
    this.initializeData();
    this.initializeExportOptions();
  }

  ngAfterViewInit(): void {
    // Wait for view to be ready before initializing charts
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  private initializeData(): void {
    this.populateCommandOptions();
    this.populateShipOptions(); // Populate ships with all available ships by default
    this.applyFilter();
  }

  private populateCommandOptions(): void {
    const commands = [...new Set(this.mockDatabase.tasks.map(task => task.command))];
    this.commandOptions = [{ label: 'All Commands', value: 'ALL_COMMANDS' }, ...commands.map(cmd => ({ label: cmd, value: cmd }))];
    this.selectedCommand = 'ALL_COMMANDS';
  }

  private populateShipOptions(command: string | null = null): void {
    let ships: string[] = [];
    
    if (command && command !== 'ALL_COMMANDS') {
      // If specific command is selected, show only ships for that command
      ships = [...new Set(this.mockDatabase.tasks
        .filter(task => task.scope === 'SHIP' && task.command === command)
        .map(task => task.ship)
        .filter(ship => ship !== null))] as string[];
    } else {
      // If no command selected or ALL_COMMANDS, show all ships
      ships = [...new Set(this.mockDatabase.tasks
        .filter(task => task.scope === 'SHIP')
        .map(task => task.ship)
        .filter(ship => ship !== null))] as string[];
    }

    this.shipOptions = [{ label: 'All Ships', value: 'ALL_SHIPS' }, ...ships.map(ship => ({ label: ship, value: ship }))];
    
    // Set default ship selection to 'ALL_SHIPS' if not already set
    if (!this.selectedShip) {
      this.selectedShip = 'ALL_SHIPS';
    }
  }

  onOrganizationalFilterChange(event: any): void {
    this.selectedOrganizationalFilter = event.target.value;
    this.applyFilter();
  }

  onCommandChange(event: any): void {
    this.selectedCommand = event.target.value;
    this.populateShipOptions(this.selectedCommand);
    this.selectedShip = 'ALL_SHIPS';
    this.applyFilter();
  }

  onShipChange(event: any): void {
    this.selectedShip = event.target.value;
    this.applyFilter();
  }

  applyFilter(): void {
    console.log(`Applying filter: OrgFilter=${this.selectedOrganizationalFilter}, Command=${this.selectedCommand}, Ship=${this.selectedShip}`);
    this.initializeKpiData();
    this.updateCharts();
  }

  private initializeKpiData(): void {
    const filteredTasks = this.getFilteredData('tasks');
    const filteredAcquaints = this.getFilteredData('acquaints');
    const filteredOem = this.getFilteredData('oem');

    // Total Active Tasks
    this.kpiMetrics[0].value = filteredTasks.filter((t:any) => t.status === 'Active').length;
    // Overdue Tasks
    this.kpiMetrics[1].value = filteredTasks.filter((t:any) => t.status === 'Overdue').length;
    // Monthly Completion Rate
    const completedThisMonth = filteredTasks.filter((t:any) => t.status === 'Completed' && t.completionDate && new Date(t.completionDate).getMonth() === new Date().getMonth()).length;
    const totalPlannedThisMonth = filteredTasks.length;
    this.kpiMetrics[2].value = totalPlannedThisMonth > 0 ? `${((completedThisMonth / totalPlannedThisMonth) * 100).toFixed(0)}%` : '0%';
    // OEM Routine Optimizations
    this.kpiMetrics[3].value = filteredOem.filter((o:any) => o.efficiencyScore < 6).length + ' New';
  }

  private initializeCharts(): void {
    this.createTaskStatusChart();
    this.createMonthlyTrendChart();
    this.createAcquaintsChart();
    this.createSparesChart();
    this.createOemEfficiencyChart();
  }

  private createTaskStatusChart(): void {
    const ctx = this.taskStatusChartRef.nativeElement.getContext('2d');
    const filteredTasks = this.getFilteredData('tasks');
    
    const activeCount = filteredTasks.filter((t:any) => t.status === 'Active').length;
    const completedCount = filteredTasks.filter((t:any) => t.status === 'Completed').length;
    const overdueCount = filteredTasks.filter((t:any) => t.status === 'Overdue').length;
    const pendingCount = filteredTasks.filter((t:any) => t.status === 'Pending Approval').length;

    this.taskStatusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Completed', 'Overdue', 'Pending Approval'],
        datasets: [{
          data: [activeCount, completedCount, overdueCount, pendingCount],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',   // Blue
            'rgba(34, 197, 94, 0.8)',    // Green
            'rgba(239, 68, 68, 0.8)',    // Red
            'rgba(245, 158, 11, 0.8)'    // Yellow
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)'
          ],
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  private createMonthlyTrendChart(): void {
    const ctx = this.monthlyTrendChartRef.nativeElement.getContext('2d');
    const filteredTasks = this.getFilteredData('tasks');
    
    const monthlyCompleted: number[] = Array(6).fill(0);
    const monthlyPlanned: number[] = Array(6).fill(0);
    
    filteredTasks.forEach((task:any) => {
      if (task.completionDate) {
        const monthIndex = new Date(task.completionDate).getMonth();
        if (monthIndex >= 0 && monthIndex < 6) {
          if (task.status === 'Completed') monthlyCompleted[monthIndex]++;
        }
      }
      if (task.dueDate) {
        const monthIndex = new Date(task.dueDate).getMonth();
        if (monthIndex >= 0 && monthIndex < 6) {
          monthlyPlanned[monthIndex]++;
        }
      }
    });

    this.monthlyTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Tasks Completed',
            data: monthlyCompleted,
            borderColor: '#10B981', // Beautiful emerald green
            backgroundColor: 'rgba(16, 185, 129, 0.15)', // Light emerald with transparency
            borderWidth: 4,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#10B981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 3,
            pointRadius: 8,
            pointHoverRadius: 12,
            pointHoverBackgroundColor: '#059669',
            pointHoverBorderColor: '#ffffff'
          },
          {
            label: 'Planned Tasks',
            data: monthlyPlanned,
            borderColor: '#3B82F6', // Beautiful blue
            backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue with transparency
            borderWidth: 3,
            borderDash: [8, 4],
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 10,
            pointHoverBackgroundColor: '#2563EB',
            pointHoverBorderColor: '#ffffff'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              font: { size: 13, weight: 'bold' },
              color: '#374151',
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#F9FAFB',
            bodyColor: '#E5E7EB',
            borderColor: '#10B981',
            borderWidth: 2,
            cornerRadius: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y + ' tasks';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(156, 163, 175, 0.2)',
              lineWidth: 1
            },
            ticks: {
              color: '#6B7280',
              font: { size: 12, weight: 'normal' }
            }
          },
          x: {
            grid: {
              color: 'rgba(156, 163, 175, 0.2)',
              lineWidth: 1
            },
            ticks: {
              color: '#6B7280',
              font: { size: 12, weight: 'normal' }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            hoverBackgroundColor: '#ffffff',
            hoverBorderWidth: 3
          }
        }
      }
    });
  }

  private createAcquaintsChart(): void {
    const ctx = this.acquaintsChartRef.nativeElement.getContext('2d');
    const filteredAcquaints = this.getFilteredData('acquaints');
    
    const acquaintReasons = ['Equipment Failure', 'Routine Anomaly', 'Tool Issue', 'Spares Defect', 'Operational Feedback'];
    const acquaintsCounts = acquaintReasons.map(reason => 
      filteredAcquaints.filter((acq:any) => acq.reason === reason).length
    );

    this.acquaintsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: acquaintReasons,
        datasets: [{
          label: 'Number of Acquaints',
          data: acquaintsCounts,
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(139, 92, 246, 1)'
          ],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(156, 163, 175, 0.2)'
            }
          },
          x: {
            grid: {
              color: 'rgba(156, 163, 175, 0.2)'
            }
          }
        }
      }
    });
  }

  private createSparesChart(): void {
    const ctx = this.sparesChartRef.nativeElement.getContext('2d');
    const filteredSpares = this.getFilteredData('spares');
    
    const spareCategories = ['Mechanical', 'Electrical', 'Hydraulic', 'Consumables', 'Specialized'];
    const sparesCounts = spareCategories.map(cat => 
      filteredSpares.filter((spare:any) => spare.category === cat)
        .reduce((sum: number, current: any) => sum + current.quantity, 0)
    );

    this.sparesChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: spareCategories,
        datasets: [{
          data: sparesCounts,
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(139, 92, 246, 1)'
          ],
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} Units (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  private createOemEfficiencyChart(): void {
    const ctx = this.oemEfficiencyChartRef.nativeElement.getContext('2d');
    const filteredOem = this.getFilteredData('oem');
    
    const oemLabels = [...new Set(filteredOem.map((o:any) => o.oem))];
    const oemEfficiencyScores = oemLabels.map(oem => {
      const oemItems = filteredOem.filter((o:any) => o.oem === oem);
      const totalScore = oemItems.reduce((sum: number, current: any) => sum + current.efficiencyScore, 0);
      return oemItems.length > 0 ? parseFloat((totalScore / oemItems.length).toFixed(1)) : 0;
    });

    this.oemEfficiencyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: oemLabels,
        datasets: [{
          label: 'Avg. Efficiency Score (Lower is Better)',
          data: oemEfficiencyScores,
          backgroundColor: [
            'rgba(249, 115, 22, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)'
          ],
          borderColor: [
            'rgba(249, 115, 22, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(59, 130, 246, 1)'
          ],
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: 'rgba(156, 163, 175, 0.2)'
            }
          },
          y: {
            grid: {
              color: 'rgba(156, 163, 175, 0.2)'
            }
          }
        }
      }
    });
  }

  private updateCharts(): void {
    if (this.taskStatusChart) {
      this.taskStatusChart.destroy();
    }
    if (this.monthlyTrendChart) {
      this.monthlyTrendChart.destroy();
    }
    if (this.acquaintsChart) {
      this.acquaintsChart.destroy();
    }
    if (this.sparesChart) {
      this.sparesChart.destroy();
    }
    if (this.oemEfficiencyChart) {
      this.oemEfficiencyChart.destroy();
    }
    
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  private getFilteredData(dataType: string): any[] {
    let data: any[] = [];
    
    switch (dataType) {
      case 'tasks':
        data = [...this.mockDatabase.tasks];
        break;
      case 'acquaints':
        data = [...this.mockDatabase.acquaints];
        break;
      case 'spares':
        data = [...this.mockDatabase.spares];
        break;
      case 'oem':
        data = [...this.mockDatabase.oem];
        break;
      default:
        return [];
    }
    
    if (this.selectedCommand && this.selectedCommand !== 'ALL_COMMANDS') {
      data = data.filter((item: any) => item.command === this.selectedCommand);
    }
    
    if (this.selectedShip && this.selectedShip !== 'ALL_SHIPS') {
      data = data.filter((item: any) => item.ship === this.selectedShip);
    }
    
    return data;
  }

  private initializeExportOptions(): void {
    this.exportOptions = [
      {
        label: 'Export Dashboard Summary (PDF)',
        icon: 'pi pi-file-pdf',
        command: () => this.exportPDF(),
      },
      {
        label: 'Export Dashboard Data (Excel)',
        icon: 'pi pi-file-excel',
        command: () => this.exportExcel(),
      },
    ];
  }

  // --- Drill Down Logic for Charts and Cards ---
  drillDown(event: any, type: string): void {
    let drilldownData: any[] = [];
    let drilldownColumns: any[] = [];
    let dialogTitle = '';

    console.log(`Drill down event received for type: ${type}`);

    const currentFilteredTasks = this.getFilteredData('tasks');
    const currentFilteredAcquaints = this.getFilteredData('acquaints');
    const currentFilteredSpares = this.getFilteredData('spares');
    const currentFilteredOem = this.getFilteredData('oem');

    switch (type) {
      case 'TASK_STATUS':
        dialogTitle = 'Task Status Details';
        drilldownColumns = [
          { field: 'title', header: 'Task Title' },
          { field: 'status', header: 'Status' },
          { field: 'command', header: 'Command' },
          { field: 'ship', header: 'Ship' },
          { field: 'dueDate', header: 'Due Date' }
        ];
        drilldownData = currentFilteredTasks;
        break;

      case 'MONTHLY_TREND':
        dialogTitle = 'Monthly Task Completion Details';
        drilldownColumns = [
          { field: 'title', header: 'Task Title' },
          { field: 'status', header: 'Status' },
          { field: 'completionDate', header: 'Completion Date' },
          { field: 'command', header: 'Command' },
          { field: 'ship', header: 'Ship' }
        ];
        drilldownData = currentFilteredTasks.filter((t: any) => t.status === 'Completed');
        break;

      case 'ACQUAINTS_REASON':
        dialogTitle = 'Acquaints Details';
        drilldownColumns = [
          { field: 'reason', header: 'Reason' },
          { field: 'command', header: 'Command' },
          { field: 'ship', header: 'Ship' }
        ];
        drilldownData = currentFilteredAcquaints;
        break;

      case 'SPARES_CONSUMPTION':
        dialogTitle = 'Spares Consumption Details';
        drilldownColumns = [
          { field: 'category', header: 'Category' },
          { field: 'quantity', header: 'Quantity' },
          { field: 'command', header: 'Command' },
          { field: 'ship', header: 'Ship' }
        ];
        drilldownData = currentFilteredSpares;
        break;

      case 'OEM_EFFICIENCY':
        dialogTitle = 'OEM Efficiency Details';
        drilldownColumns = [
          { field: 'oem', header: 'OEM' },
          { field: 'efficiencyScore', header: 'Efficiency Score' },
          { field: 'command', header: 'Command' },
          { field: 'ship', header: 'Ship' }
        ];
        drilldownData = currentFilteredOem;
        break;

      case 'ACTIVE_TASKS':
        dialogTitle = 'Active Tasks Details';
        drilldownColumns = [
          { field: 'title', header: 'Task Title' },
          { field: 'command', header: 'Command' },
          { field: 'ship', header: 'Ship' },
          { field: 'dueDate', header: 'Due Date' }
        ];
        drilldownData = currentFilteredTasks.filter((t: any) => t.status === 'Active');
        break;

      case 'OVERDUE_TASKS':
        dialogTitle = 'Overdue Tasks Details';
        drilldownColumns = [
          { field: 'title', header: 'Task Title' },
          { field: 'command', header: 'Command' },
          { field: 'ship', header: 'Ship' },
          { field: 'dueDate', header: 'Due Date' }
        ];
        drilldownData = currentFilteredTasks.filter((t: any) => t.status === 'Overdue');
        break;

      case 'MONTHLY_COMPLETION':
        dialogTitle = 'Monthly Completion Details';
        drilldownColumns = [
          { field: 'title', header: 'Task Title' },
          { field: 'completionDate', header: 'Completion Date' },
          { field: 'command', header: 'Command' },
          { field: 'ship', header: 'Ship' }
        ];
        drilldownData = currentFilteredTasks.filter((t: any) => t.status === 'Completed');
        break;

      case 'OEM_OPTIMIZATIONS':
        dialogTitle = 'OEM Optimizations Details';
        drilldownColumns = [
          { field: 'oem', header: 'OEM' },
          { field: 'efficiencyScore', header: 'Efficiency Score' },
          { field: 'command', header: 'Command' },
          { field: 'ship', header: 'Ship' }
        ];
        drilldownData = currentFilteredOem.filter((o: any) => o.efficiencyScore < 6);
        break;

      default:
        console.warn(`Unknown drill down type: ${type}`);
        return;
    }

    this.drilldownDialogTitle = dialogTitle;
    this.drilldownTableData = drilldownData;
    this.drilldownTableCols = drilldownColumns;
    this.displayDrilldownDialog = true;
  }

  onHideDrilldownDialog(): void {
    this.displayDrilldownDialog = false;
  }

  // --- Export Functions ---
  exportPDF(): void {
    console.log('Exporting to PDF...');
    // Implementation for PDF export
  }

  exportExcel(): void {
    console.log('Exporting to Excel...');
    // Implementation for Excel export
  }
}