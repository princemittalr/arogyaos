import { useMemo } from 'react';
import { LabReportRecord } from '../types';

export interface BiomarkerTrendPoint {
  date: string;
  value: number;
  unit: string;
  isAbnormal: boolean;
  testName: string;
}

export function useLabTrends(reports: LabReportRecord[] | undefined, parameterName: string) {
  const trendData = useMemo(() => {
    if (!reports || !parameterName) return [];

    const points: BiomarkerTrendPoint[] = [];

    // Filter active reports first
    const activeReports = reports.filter(
      (r) => r.metadata?.status === 'ACTIVE'
    );

    for (const report of activeReports) {
      const dateStr = report.metadata?.createdAt
        ? new Date(
            (report.metadata.createdAt as { toDate?: () => Date }).toDate
              ? (report.metadata.createdAt as { toDate: () => Date }).toDate()
              : (report.metadata.createdAt as string)
          ).toLocaleDateString()
        : new Date().toLocaleDateString();

      const matchedObservation = report.observations?.find(
        (obs) => obs.parameter.toLowerCase().trim() === parameterName.toLowerCase().trim()
      );

      if (matchedObservation) {
        const numVal = parseFloat(matchedObservation.value.replace(/,/g, ''));
        if (!isNaN(numVal)) {
          points.push({
            date: dateStr,
            value: numVal,
            unit: matchedObservation.unit,
            isAbnormal: matchedObservation.isAbnormal,
            testName: report.testName,
          });
        }
      }
    }

    // Sort chronologically (oldest to newest) for chart plotting
    return points.reverse();
  }, [reports, parameterName]);

  // Extract list of all unique parameters available in reports for dropdown selection
  const uniqueParameters = useMemo(() => {
    if (!reports) return [];
    const params = new Set<string>();
    reports
      .filter((r) => r.metadata?.status === 'ACTIVE')
      .forEach((r) => {
        r.observations?.forEach((obs) => {
          if (obs.parameter) params.add(obs.parameter);
        });
      });
    return Array.from(params);
  }, [reports]);

  return {
    trendData,
    uniqueParameters,
  };
}
export default useLabTrends;
