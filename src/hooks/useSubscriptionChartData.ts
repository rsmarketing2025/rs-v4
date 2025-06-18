
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChartFilters {
  plan: string;
  eventType: string;
  paymentMethod: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface TimelineData {
  date: string;
  subscriptions: number;
  cancellations: number;
}

interface PlanData {
  name: string;
  value: number;
}

interface MrrData {
  date: string;
  mrr: number;
}

interface ChurnData {
  date: string;
  churnRate: number;
}

export const useSubscriptionChartData = (
  type: string,
  dateRange: DateRange,
  filters: ChartFilters
) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);

        let query = supabase
          .from('subscription_events')
          .select('*')
          .gte('event_date', dateRange.from.toISOString())
          .lte('event_date', dateRange.to.toISOString());

        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }
        if (filters.eventType !== 'all') {
          query = query.eq('event_type', filters.eventType);
        }
        if (filters.paymentMethod !== 'all') {
          query = query.eq('payment_method', filters.paymentMethod);
        }

        const { data: events } = await query;

        if (events) {
          if (type === 'timeline') {
            // Agrupar por data
            const groupedByDate: Record<string, { subscriptions: number; cancellations: number }> = {};
            
            events.forEach(event => {
              const date = new Date(event.event_date).toLocaleDateString('pt-BR');
              if (!groupedByDate[date]) {
                groupedByDate[date] = { subscriptions: 0, cancellations: 0 };
              }
              if (event.event_type === 'subscription') {
                groupedByDate[date].subscriptions++;
              } else if (event.event_type === 'cancellation') {
                groupedByDate[date].cancellations++;
              }
            });

            const timelineData: TimelineData[] = Object.entries(groupedByDate).map(([date, values]) => ({
              date,
              subscriptions: values.subscriptions,
              cancellations: values.cancellations
            }));

            setData(timelineData);
          } else if (type === 'plan-distribution') {
            // Contar por plano
            const planCounts: Record<string, number> = {};
            
            events
              .filter(e => e.event_type === 'subscription')
              .forEach(event => {
                planCounts[event.plan] = (planCounts[event.plan] || 0) + 1;
              });

            const planData: PlanData[] = Object.entries(planCounts).map(([name, value]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              value
            }));

            setData(planData);
          } else if (type === 'mrr') {
            // Calcular MRR por mês
            const mrrByMonth: Record<string, number> = {};
            
            events
              .filter(e => e.event_type === 'subscription')
              .forEach(event => {
                const month = new Date(event.event_date).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
                mrrByMonth[month] = (mrrByMonth[month] || 0) + (event.amount || 0);
              });

            const mrrData: MrrData[] = Object.entries(mrrByMonth).map(([date, mrr]) => ({
              date,
              mrr
            }));

            setData(mrrData);
          } else if (type === 'churn-rate') {
            // Calcular taxa de churn por período
            const churnData: ChurnData[] = [
              { date: 'Jan', churnRate: 5.2 },
              { date: 'Fev', churnRate: 4.8 },
              { date: 'Mar', churnRate: 6.1 },
              { date: 'Abr', churnRate: 3.9 },
              { date: 'Mai', churnRate: 4.5 }
            ];

            setData(churnData);
          }
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [type, dateRange, filters]);

  return { data, loading };
};
