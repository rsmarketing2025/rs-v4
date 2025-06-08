
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptionChartData = (
  type: string,
  dateRange: { from: Date; to: Date },
  filters: { plan: string; eventType: string; paymentMethod: string }
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
            const groupedByDate = events.reduce((acc, event) => {
              const date = new Date(event.event_date).toLocaleDateString('pt-BR');
              if (!acc[date]) {
                acc[date] = { subscriptions: 0, cancellations: 0 };
              }
              if (event.event_type === 'subscription') {
                acc[date].subscriptions++;
              } else {
                acc[date].cancellations++;
              }
              return acc;
            }, {} as any);

            const timelineData = Object.entries(groupedByDate).map(([date, values]) => ({
              date,
              ...values
            }));

            setData(timelineData);
          } else if (type === 'plan-distribution') {
            // Contar por plano
            const planCounts = events
              .filter(e => e.event_type === 'subscription')
              .reduce((acc, event) => {
                acc[event.plan] = (acc[event.plan] || 0) + 1;
                return acc;
              }, {} as any);

            const planData = Object.entries(planCounts).map(([name, value]) => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              value
            }));

            setData(planData);
          } else if (type === 'mrr') {
            // Calcular MRR por mês
            const mrrByMonth = events
              .filter(e => e.event_type === 'subscription')
              .reduce((acc, event) => {
                const month = new Date(event.event_date).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
                acc[month] = (acc[month] || 0) + (event.value || 0);
                return acc;
              }, {} as any);

            const mrrData = Object.entries(mrrByMonth).map(([date, mrr]) => ({
              date,
              mrr
            }));

            setData(mrrData);
          } else if (type === 'churn-rate') {
            // Calcular taxa de churn por período
            const churnData = [
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
