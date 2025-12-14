import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Download, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getDonationHistory, getTransactionReceipt } from '@/services/api/donation';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Transaction {
  id: number;
  donation_type: string;
  gross_amount: string;
  stripe_fee: string;
  crwd_fee: string;
  net_amount: string;
  status: string;
  charged_at: string;
  cause_count: number;
  collective_count: number;
  causes: Array<{
    id: number;
    name: string;
    tax_id_number: string;
    image: string | null;
  }>;
  collectives: Array<{
    id: number;
    name: string;
  }>;
}

export default function TaxReceiptsPage() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Fetch transaction history
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['donationHistory'],
    queryFn: getDonationHistory,
  });

  // Get available years from transactions
  const availableYears = useMemo(() => {
    if (!historyData?.results) return [];
    const years = new Set<string>();
    historyData.results.forEach((transaction: Transaction) => {
      const year = new Date(transaction.charged_at).getFullYear().toString();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [historyData]);

  // Filter transactions by selected year and group by date
  const filteredTransactions = useMemo(() => {
    if (!historyData?.results) return [];
    return historyData.results
      .filter((transaction: Transaction) => {
        const year = new Date(transaction.charged_at).getFullYear().toString();
        return year === selectedYear && transaction.status === 'succeeded';
      })
      .sort((a: Transaction, b: Transaction) => {
        return new Date(b.charged_at).getTime() - new Date(a.charged_at).getTime();
      });
  }, [historyData, selectedYear]);

  // Calculate total donated for selected year
  const totalDonated = useMemo(() => {
    return filteredTransactions.reduce((sum: number, transaction: Transaction) => {
      return sum + parseFloat(transaction.gross_amount || '0');
    }, 0);
  }, [filteredTransactions]);

  // Generate receipt number (REC-YYYY-XXX format)
  const generateReceiptNumber = (transaction: Transaction, index: number) => {
    const year = new Date(transaction.charged_at).getFullYear();
    const paddedIndex = String(index + 1).padStart(3, '0');
    return `REC-${year}-${paddedIndex}`;
  };

  // Calculate amount per nonprofit (split equally)
  const calculateAmountPerNonprofit = (transaction: Transaction) => {
    const totalAmount = parseFloat(transaction.gross_amount || '0');
    const totalNonprofits = transaction.cause_count + transaction.collective_count;
    if (totalNonprofits === 0) return '0.00';
    return (totalAmount / totalNonprofits).toFixed(2);
  };

  // Handle download all receipts
  const handleDownloadAll = () => {
    // TODO: Implement download all receipts functionality
    console.log('Download all receipts for', selectedYear);
  };

  // Open Stripe receipt in new tab
  const openStripeReceipt = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Download receipt mutation
  const downloadReceiptMutation = useMutation({
    mutationFn: (donationId: string) => getTransactionReceipt(donationId),
    onSuccess: (response) => {
      if (response.receipt_url || response.url || response.file_url) {
        const receiptUrl = response.receipt_url || response.url || response.file_url;
        openStripeReceipt(receiptUrl);
        toast.success('Receipt opened successfully!');
      } else {
        toast.error('Failed to get receipt URL.');
      }
    },
    onError: (error) => {
      console.error('Error fetching receipt:', error);
      toast.error('Failed to fetch receipt. Please try again.');
    },
  });

  // Handle download single receipt
  const handleDownloadReceipt = (transaction: Transaction) => {
    if (transaction.id) {
      downloadReceiptMutation.mutate(transaction.id.toString());
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-xl text-foreground">Tax Receipts</h1>
        </div>

        {/* <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <Button
            onClick={handleDownloadAll}
            className="bg-[#1600ff] hover:bg-[#1400cc] text-white font-semibold rounded-lg px-4 py-2"
          >
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div> */}
      </div>

      <div className='lg:max-w-[60%] lg:mx-auto'>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Total Donated Summary */}
        <Card className="mb-6 border-1 border-gray-200 rounded-lg">
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 mb-1">Total Donateds</div>
            <div className="text-3xl font-bold text-[#1600ff]">
              ${totalDonated.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
          <p className="text-sm text-[#1600ff] leading-relaxed">
            All donations are fully tax deductible. Donations are made through CRWD Foundation INC., a 501(c)(3) organization, and disbursed to your chosen verified nonprofits. Keep these receipts for your tax records.
          </p>
        </div>

        {/* Receipts List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No receipts found for {selectedYear}</p>
            </div>
          ) : (
            filteredTransactions.map((transaction: Transaction, index: number) => {
              const receiptNumber = generateReceiptNumber(transaction, index);
              const date = new Date(transaction.charged_at);
              const formattedDate = format(date, 'MMM d, yyyy');
              const amountPerNonprofit = calculateAmountPerNonprofit(transaction);
              const allNonprofits = [
                ...transaction.causes.map(c => ({ ...c, type: 'cause' })),
                // ...transaction.collectives.map(c => ({ ...c, type: 'collective' })),
              ];
              const allCollectives = transaction.collectives.map(c => ({ ...c, type: 'collective' }));

              return (
                <Card key={transaction.id} className="border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    {/* Receipt Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-100 rounded-full p-2">
                        <FileText className="w-5 h-5 text-[#1600ff]" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-500">{formattedDate}</div>
                          {/* <div className="text-sm text-gray-500">Receipt #{receiptNumber}</div> */}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                          ${parseFloat(transaction.gross_amount).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Nonprofits Supported */}
                    <div className="mb-4">
                        {allNonprofits.length > 0 && (
                            <>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Nonprofits Supported:
                      </h3>
                      <div className="space-y-2">
                        {allNonprofits.map((nonprofit, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-700">{nonprofit.name}</span>
                            <span className="font-medium text-gray-900">
                              ${amountPerNonprofit}
                            </span>
                          </div>
                        ))}
                      </div>
                      </>
                      )}
                      {allCollectives.length > 0 && (
                        <>
                      <h3 className="text-sm font-semibold text-gray-900 my-3">
                        Collectives Supported:
                      </h3>
                      <div className="space-y-2">
                        {allCollectives.map((collective, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{collective.name}</span>
                            <span className="font-medium text-gray-900">${amountPerNonprofit}</span>
                          </div>
                        ))}
                      </div>
                      </>
                      )}
                    </div>

                    {/* Tax Deductible Tag and Download Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Tax Deductible
                      </span>
                      <Button
                        onClick={() => handleDownloadReceipt(transaction)}
                        variant="outline"
                        className="text-sm"
                        disabled={downloadReceiptMutation.isPending}
                      >
                        {downloadReceiptMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            View Receipt
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

