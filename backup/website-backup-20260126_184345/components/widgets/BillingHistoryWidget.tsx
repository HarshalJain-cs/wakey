'use client';

import { useState, useEffect } from 'react';
import { Receipt, Download, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import WidgetCard from './WidgetCard';

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  invoiceUrl?: string;
}

export default function BillingHistoryWidget() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/billing/invoices');
      if (!res.ok) {
        if (res.status === 404) {
          setInvoices([]);
        } else {
          throw new Error('Failed to fetch billing history');
        }
      } else {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <WidgetCard title="Billing History" icon={<Receipt className="w-5 h-5" />}>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-dark-900/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-dark-700 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-dark-700 rounded" />
                  <div className="h-3 w-16 bg-dark-700 rounded" />
                </div>
              </div>
              <div className="h-4 w-12 bg-dark-700 rounded" />
            </div>
          ))}
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title="Billing History" icon={<Receipt className="w-5 h-5" />}>
        <div className="text-center py-6">
          <p className="text-red-400 mb-2">{error}</p>
          <button
            onClick={fetchInvoices}
            className="text-teal-400 hover:text-teal-300 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </WidgetCard>
    );
  }

  if (invoices.length === 0) {
    return (
      <WidgetCard title="Billing History" icon={<Receipt className="w-5 h-5" />}>
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-dark-700/50 rounded-full flex items-center justify-center">
            <Receipt className="w-8 h-8 text-dark-500" />
          </div>
          <p className="text-dark-400">No billing history yet</p>
          <p className="text-dark-500 text-sm mt-1">Invoices will appear here after your first payment</p>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Billing History"
      icon={<Receipt className="w-5 h-5" />}
      action={
        <button
          onClick={fetchInvoices}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      <div className="space-y-2">
        {invoices.slice(0, 5).map((invoice) => (
          <div
            key={invoice.id}
            className="flex items-center justify-between p-3 bg-dark-900/50 rounded-xl hover:bg-dark-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(invoice.status)}
              <div>
                <p className="text-sm font-medium text-white">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </p>
                <p className="text-xs text-dark-500">
                  {new Date(invoice.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            {invoice.invoiceUrl && (
              <a
                href={invoice.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-dark-400 hover:text-teal-400 hover:bg-dark-700 rounded-lg transition-colors"
                title="Download invoice"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        ))}
      </div>

      {invoices.length > 5 && (
        <button className="w-full mt-3 py-2 text-sm text-dark-400 hover:text-teal-400 transition-colors">
          View all {invoices.length} invoices
        </button>
      )}
    </WidgetCard>
  );
}
