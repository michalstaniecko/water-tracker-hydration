/**
 * PDF Export Utility
 * 
 * Provides PDF generation for reports and statistics.
 * Uses expo-print for cross-platform PDF creation.
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import dayjs from '@/plugins/dayjs';
import { PeriodStats, DailyStats } from '@/stores/statistics';
import { logError } from './errorLogging';
import { trackDataExport } from './analytics';

export type ReportType = 'weekly' | 'monthly' | 'custom';

export type ReportData = {
  type: ReportType;
  period: string;
  stats: PeriodStats;
  generatedDate: string;
  minimumWater: number;
};

/**
 * Generates HTML content for PDF report
 */
function generateReportHTML(data: ReportData): string {
  const { type, period, stats, generatedDate, minimumWater } = data;

  // Create chart data visualization (simple bar representation)
  const chartBars = stats.dailyData
    .map((day: DailyStats) => {
      const height = Math.min((day.percentage / 100) * 150, 150);
      const color = day.percentage >= 100 ? '#10b981' : '#3b82f6';
      return `
        <div style="display: inline-block; margin: 0 4px; vertical-align: bottom;">
          <div style="width: 20px; height: ${height}px; background-color: ${color}; border-radius: 2px;"></div>
          <div style="font-size: 8px; text-align: center; margin-top: 4px;">${dayjs(day.date).format('DD/MM')}</div>
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #1f2937;
          }
          h1 {
            color: #1e40af;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 10px;
            margin-bottom: 30px;
          }
          h2 {
            color: #374151;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          .header {
            margin-bottom: 40px;
          }
          .info {
            color: #6b7280;
            font-size: 14px;
            margin: 5px 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .stat-card {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            background-color: #f9fafb;
          }
          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
          }
          .stat-label {
            color: #6b7280;
            font-size: 14px;
          }
          .chart-container {
            margin: 30px 0;
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 8px;
            text-align: center;
          }
          .chart {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            align-items: flex-end;
            height: 180px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Water Intake Report</h1>
          <div class="info">Report Type: ${type.charAt(0).toUpperCase() + type.slice(1)}</div>
          <div class="info">Period: ${period}</div>
          <div class="info">Generated: ${dayjs(generatedDate).format('DD/MM/YYYY HH:mm')}</div>
          <div class="info">Daily Goal: ${minimumWater}ml</div>
        </div>

        <h2>Summary Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.average}ml</div>
            <div class="stat-label">Average Daily Intake</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.total}ml</div>
            <div class="stat-label">Total Intake</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.daysTracked}</div>
            <div class="stat-label">Days Tracked</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.goalMetPercentage}%</div>
            <div class="stat-label">Goal Achievement Rate</div>
          </div>
        </div>

        <h2>Daily Intake Chart</h2>
        <div class="chart-container">
          <div class="chart">
            ${chartBars}
          </div>
        </div>

        <div class="footer">
          <p>Water Tracker - Hydration Monitoring Report</p>
          <p>This report is generated automatically based on your water intake data.</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Exports a report as PDF
 * @param data - Report data to export
 * @returns Promise<boolean> - Success status
 */
export async function exportReportToPDF(data: ReportData): Promise<boolean> {
  const startTime = Date.now();
  
  try {
    // Generate HTML content
    const html = generateReportHTML(data);

    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Share the PDF
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Export Water Intake Report',
        UTI: 'com.adobe.pdf',
      });
    }

    const duration = Date.now() - startTime;
    trackDataExport('pdf', true);
    
    return true;
  } catch (error) {
    logError(error, {
      operation: 'exportReportToPDF',
      component: 'PDFExport',
      data: { reportType: data.type },
    });
    
    trackDataExport('pdf', false);
    return false;
  }
}

/**
 * Creates a detailed monthly report with trend analysis
 */
export async function exportMonthlyReport(
  stats: PeriodStats,
  minimumWater: number
): Promise<boolean> {
  const reportData: ReportData = {
    type: 'monthly',
    period: `${dayjs().subtract(29, 'days').format('DD/MM/YYYY')} - ${dayjs().format('DD/MM/YYYY')}`,
    stats,
    generatedDate: new Date().toISOString(),
    minimumWater,
  };

  return exportReportToPDF(reportData);
}

/**
 * Creates a weekly report
 */
export async function exportWeeklyReport(
  stats: PeriodStats,
  minimumWater: number
): Promise<boolean> {
  const reportData: ReportData = {
    type: 'weekly',
    period: `${dayjs().subtract(6, 'days').format('DD/MM/YYYY')} - ${dayjs().format('DD/MM/YYYY')}`,
    stats,
    generatedDate: new Date().toISOString(),
    minimumWater,
  };

  return exportReportToPDF(reportData);
}
