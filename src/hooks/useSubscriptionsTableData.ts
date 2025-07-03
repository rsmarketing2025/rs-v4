
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionTableData {
  id: string;
  subscription_id: string;
  customer_name: string;
  customer_email: string;
  plan: string;
  amount: number;
  subscription_status: string;
  created_at: string;
  updated_at: string;
  subscription_number: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

export const useSubscriptionsTableData = (
  dateRange: DateRange,
  statusFilter: string,
  page: number,
  pageSize: number
) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching subscriptions table data...');

        // Build base query
        let query = supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        // Apply status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'active') {
            query = query.in('subscription_status', ['active', 'ativo', 'Active', 'Ativo']);
          } else if (statusFilter === 'canceled') {
            query = query.in('subscription_status', ['canceled', 'cancelled', 'Canceled', 'Cancelled', 'cancelado']);
          }
        }

        // Apply pagination (only if pageSize is not "all")
        if (pageSize !== -1) {
          query = query.range((page - 1) * pageSize, page * pageSize - 1);
        }

        const { data, error, count } = await query;

        if (error) {
          console.error('❌ Error fetching subscriptions table:', error);
          return;
        }

        setSubscriptions(data || []);
        setTotalCount(count || 0);

        console.log('✅ Subscriptions table data loaded:', {
          count: data?.length || 0,
          totalCount: count || 0,
          page,
          pageSize,
          statusFilter
        });

      } catch (error) {
        console.error('❌ Error fetching subscriptions table data:', error);
        setSubscriptions([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [dateRange, statusFilter, page, pageSize]);

  const exportToCSV = async () => {
    try {
      console.log('📥 Exporting subscriptions to CSV...');
      
      // Fetch all data for export (without pagination)
      let exportQuery = supabase
        .from('subscription_status')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply the same status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          exportQuery = exportQuery.in('subscription_status', ['active', 'ativo', 'Active', 'Ativo']);
        } else if (statusFilter === 'canceled') {
          exportQuery = exportQuery.in('subscription_status', ['canceled', 'cancelled', 'Canceled', 'Cancelled', 'cancelado']);
        }
      }

      const { data, error } = await exportQuery;

      if (error) {
        console.error('❌ Error fetching data for export:', error);
        return;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No data to export');
        return;
      }

      // Convert to CSV
      const headers = [
        'ID da Assinatura',
        'Cliente',
        'Email',
        'Plano',
        'Valor',
        'Status',
        'Data de Criação',
        'Número da Assinatura'
      ];

      const csvContent = [
        headers.join(','),
        ...data.map(subscription => [
          subscription.subscription_id || '',
          `"${subscription.customer_name || ''}"`,
          subscription.customer_email || '',
          subscription.plan || '',
          subscription.amount || 0,
          subscription.subscription_status || '',
          new Date(subscription.created_at).toLocaleDateString('pt-BR'),
          subscription.subscription_number || ''
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `assinaturas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ CSV export completed');
    } catch (error) {
      console.error('❌ Error exporting CSV:', error);
    }
  };

  return { subscriptions, loading, totalCount, exportToCSV };
};
