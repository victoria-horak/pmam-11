import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../core/modules/services/auth.service';
import { UserService } from '../../core/modules/services/user.service';
import { Router } from '@angular/router';
import { RecordService } from '../../core/modules/services/record.service';
import { ExecutionResponse } from '../../core/modules/interfaces/execution-response';
import { RecordResponse } from '../../core/modules/interfaces/record-response';
import { DatePipe } from '@angular/common';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { UserProfile } from '../../core/modules/interfaces/user-profile';



@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [DatePipe],
  standalone: false
})
export class ProfileComponent implements OnInit {
  selectedRange: string = '10';
  selectedMetric: string = 'both';
  records: RecordResponse[] = [];
  reversedRecords: RecordResponse[] = [];
  userDetail: any = null;
  timeTyping: number = 0;
  wpmPoints: string = '';
  accuracyPoints: string = '';
  maxWpm: number = 100;
  maxAccuracy: number = 100;
  testsStarted: number = 0;
  testsCompleted: number = 0;
  estimatedWordsTyped: number = 0;
  highestWpm: number = 0;
  highestAccuracy: number = 0;
  highestConsistency: number = 0;

  averageRawWpm: number = 0;
  averageRawAccuracy: number = 0;
  averageRawConsistency: number = 0;

  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  heatmapData: { [month: string]: number[] } = {};

  constructor(private authService: AuthService,
    private recordService: RecordService,
    private router: Router,
    private userService: UserService) {
  }

  ngOnInit(): void {
    this.userService.getProfile(this.authService.getUserDetail()?.id).subscribe(
      (response: UserProfile) => {
        if (response) {
          this.userDetail = response;
          this.animateLevel(response.level);
        }
      },
      error => console.error('Error loading user profile', error)
    );

    this.recordService.read(this.authService.getUserDetail()?.id).subscribe(
      (response: ExecutionResponse<RecordResponse[]>) => {
        if (response.success &&response.result ) {
          this.records = response.result;
          this.reversedRecords = [...this.records].reverse();
          this.calculationTimeTyping();
          this.prepareHeatmapData();
          this.generateGraphs();
          this.processStatistics();
          this.updateLineChart();
        } else {
          console.error('Error retrieving records', response.message);
        }
      },
      (error: any) => {
        console.error('Error retrieving records', error);
      }
    );
  }

  calculationTimeTyping(): void {
    this.timeTyping = this.records.reduce((sum, record) => sum + record.matchTime, 0);
    console.log(this.timeTyping)
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/typing-game']);
  }

  prepareHeatmapData(): void {
    this.months.forEach(month => {
      this.heatmapData[month] = Array(31).fill(0);
    });

    this.records.forEach(record => {
      const date = new Date(record.dateRecord);
      const month = this.months[date.getMonth()];
      const day = date.getDate() - 1;
      this.heatmapData[month][day] += 1;
    });
  }

  initializeHeatmapLevel(val: number): string {
    return val === 1 ? 'level-1' :
      val === 2 ? 'level-2' :
        val === 3 ? 'level-3' :
          val === 4 ? 'level-4' :
            val >= 5 ? 'level-5' :
              'level-0';
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [hours, minutes, remainingSeconds]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  }

  generateGraphs(): void {
    if (!this.records.length) return;

    let recordsCopy = [...this.records].sort((a, b) =>
      new Date(b.dateRecord).getTime() - new Date(a.dateRecord).getTime()
    );

    if (this.selectedRange !== 'all') {
      const limit = parseInt(this.selectedRange, 10);
      recordsCopy = recordsCopy.slice(0, limit);
    }

    recordsCopy = recordsCopy.reverse(); // для графіку зліва направо

    const chartWidth = 600;
    const chartHeight = 200;
    const padding = 20;
    const stepX = (chartWidth - 2 * padding) / (recordsCopy.length - 1 || 1);
    this.maxWpm = Math.max(...recordsCopy.map(r => r.wpm), 1);
    this.maxAccuracy = 100;

    this.wpmPoints = recordsCopy.map((r, i) => {
      const x = padding + i * stepX;
      const y = chartHeight - (r.wpm / this.maxWpm) * (chartHeight - padding);
      return `${x},${y}`;
    }).join(' ');

    this.accuracyPoints = recordsCopy.map((r, i) => {
      const x = padding + i * stepX;
      const y = chartHeight - (r.accuracy / this.maxAccuracy) * (chartHeight - padding);
      return `${x},${y}`;
    }).join(' ');
  }

  private processStatistics(): void {
    this.testsStarted = this.records.length;
    this.testsCompleted = this.records.length;

    //доробити
    const avgWordLength = 5;
    this.estimatedWordsTyped = this.records.reduce(
      (sum, r) => sum + Math.round(r.chars / avgWordLength), 0
    );

    this.highestWpm = Math.max(...this.records.map(r => r.wpm));
    this.highestAccuracy = Math.max(...this.records.map(r => r.accuracy));
    this.highestConsistency = Math.max(...this.records.map(r => r.consistency ?? 0));

    this.averageRawWpm = Math.round(
      this.records.reduce((sum, r) => sum + r.raw, 0) / this.records.length
    );

    this.averageRawAccuracy = Math.round(
      this.records.reduce((sum, r) => sum + r.accuracy, 0) / this.records.length
    );

    this.averageRawConsistency = Math.round(
      this.records.reduce((sum, r) => sum + (r.consistency ?? 0), 0) / this.records.length
    );
  }
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'WPM',
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66,165,245,0.3)',
        tension: 0.3,
        fill: false
      },
      {
        data: [],
        label: 'Accuracy (%)',
        borderColor: '#66BB6A',
        backgroundColor: 'rgba(102,187,106,0.3)',
        tension: 0.3,
        fill: false
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#fff' }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        ticks: { color: '#fff' },
        grid: { color: '#444' }
      },
      y: {
        min: 0,
        max: 100,
        ticks: { color: '#fff' },
        grid: { color: '#444' }
      }
    }
  };

  updateLineChart(): void {
    const sorted = [...this.records].sort(
      (a, b) => new Date(a.dateRecord).getTime() - new Date(b.dateRecord).getTime()
    );

    this.lineChartData.labels = sorted.map(r =>
      new Date(r.dateRecord).toLocaleDateString());

    this.lineChartData.datasets[0].data = sorted.map(r => r.wpm);
    this.lineChartData.datasets[1].data = sorted.map(r => r.accuracy);
  }
  animateLevel(targetLevel: number) {
    let current = 0;
    const interval = setInterval(() => {
      if (current >= targetLevel) {
        clearInterval(interval);
      } else {
        current++;
        this.userDetail.displayLevel = current;
      }
    }, 50);
  }
  trackByDateRecord(index: number, record: RecordResponse): string {
    return record.dateRecord;
  }
}

