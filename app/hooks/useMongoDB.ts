// hooks/useMongoDB.ts
import { useEffect, useState } from 'react';

interface HistoricalData {
  avgHeartRate: number;
  avgHRV: number;
}

export default function useMongoDB(subjectId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalData>({
    avgHeartRate: 0,
    avgHRV: 0,
  });
  const [lastAccess, setLastAccess] = useState<Date>();
  useEffect(() => {
    if (subjectId) {
        fetchHistoricalData(subjectId);
    }
  }, [subjectId])

  // POST: Save data to MongoDB
  // TODO: update last access date
  const pushDataToMongo = async (recordData: object) => {
    if (isUploading) return; // Prevent overlapping calls
    setIsUploading(true);
    try {
      const response = await fetch(`/api/handle-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...recordData, subjectId}),
      });
      const result = await response.json();
      if (result.success) {
        console.log('✅ Data saved:', result.data);
        try {
            fetchHistoricalData(subjectId);
    
        } catch (error: any) {
            console.error('error when fetching historical data after update: ', error);
        }
      } else {
        console.error('❌ Error:', result.error);
      }
    } catch (error) {
      console.error('🚨 Network error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // GET: Fetch historical averages
  const fetchHistoricalData = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/handle-record?subjectId=${subjectId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const recordResult = await response.json();
      if (recordResult.success) {
        setHistoricalData({
            avgHeartRate: recordResult.avgHeartRate,
            avgHRV: recordResult.avgHRV,
        });
      } else {
        console.error('❌ Error:', recordResult.error);
      }


      const lastAccessFetch = await fetch(`/api/last-access?subjectId=${subjectId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const lastAccessFetchResult = await lastAccessFetch.json();
      if (lastAccessFetchResult.success) {
        setLastAccess(new Date(lastAccessFetchResult.lastAccess));
      } else {
        console.error('❌ Error:', lastAccessFetchResult.error);
      }
    } catch (error) {
      console.error('🚨 Network error:', error);
    }
  };

  return {
    isUploading,
    pushDataToMongo,
    historicalData,
    lastAccess
  };
}
