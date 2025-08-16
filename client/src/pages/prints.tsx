import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Printer, DollarSign } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Prints() {
  const { toast } = useToast();

  const { data: printEntries, isLoading, error: printError } = useQuery({
    queryKey: ["/api/income/prints"]
  });

  if (printError && isUnauthorizedError(printError as Error)) {
    toast({
      title: "غير مصرح",
      description: "جاري إعادة تسجيل الدخول...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  // Calculate total prints revenue
  const totalRevenue = printEntries?.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0) || 0;

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-page-title">قسم المطبوعات</h1>
              <p className="text-gray-300" data-testid="text-page-subtitle">عرض جميع المطبوعات والإيرادات المحققة</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm" data-testid="text-total-orders">إجمالي الطلبات</p>
                <p className="text-2xl font-bold" data-testid="text-total-orders-count">
                  {isLoading ? "..." : printEntries?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 gradient-orange rounded-full flex items-center justify-center">
                <Printer className="w-6 h-6" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm" data-testid="text-total-revenue">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-400" data-testid="text-total-revenue-amount">
                  {isLoading ? "..." : `${totalRevenue} د.ع`}
                </p>
              </div>
              <div className="w-12 h-12 gradient-green rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm" data-testid="text-average-order">متوسط الطلب</p>
                <p className="text-2xl font-bold text-blue-400" data-testid="text-average-order-amount">
                  {isLoading ? "..." : printEntries?.length ? `${Math.round(totalRevenue / printEntries.length)} د.ع` : "0 د.ع"}
                </p>
              </div>
              <div className="w-12 h-12 gradient-blue rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Print Entries List */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-6" data-testid="text-prints-list-title">قائمة المطبوعات</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">جاري تحميل المطبوعات...</p>
            </div>
          ) : printEntries?.length ? (
            <div className="grid gap-4">
              {printEntries.map((entry: any, index: number) => (
                <GlassCard 
                  key={entry.id} 
                  className="p-6"
                  data-testid={`card-print-${index}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-12 h-12 gradient-orange rounded-full flex items-center justify-center">
                        <Printer className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold" data-testid={`text-print-type-${index}`}>
                          {entry.printType || "مطبوع"}
                        </h3>
                        <p className="text-2xl font-bold text-green-400" data-testid={`text-print-amount-${index}`}>
                          {entry.amount} د.ع
                        </p>
                        <p className="text-sm text-gray-400" data-testid={`text-print-date-${index}`}>
                          {new Date(entry.createdAt).toLocaleDateString('ar-IQ')} - {new Date(entry.createdAt).toLocaleTimeString('ar-IQ')}
                        </p>
                        {entry.description && (
                          <p className="text-sm text-gray-300 mt-1" data-testid={`text-print-description-${index}`}>
                            {entry.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-left">
                      {entry.receiptUrl && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="border-blue-400 text-blue-400 hover:bg-blue-400/10"
                          data-testid={`button-view-receipt-${index}`}
                        >
                          <a 
                            href={entry.receiptUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            عرض الفيش
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Printer className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p data-testid="text-no-prints">لا توجد مطبوعات مسجلة بعد</p>
              <p className="text-sm mt-2">ستظهر هنا جميع الطلبات المطبوعة</p>
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
}
