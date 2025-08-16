import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "wouter";
import { ArrowRight, BarChart3, Download, Calendar, FileText, DollarSign, Users, Printer } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Reports() {
  const [selectedReportType, setSelectedReportType] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      startDate: "",
      endDate: "",
      reportType: "",
    },
  });

  // Get data for summary based on date range
  const { data: incomeData, error: incomeDataError } = useQuery({
    queryKey: ["/api/income", dateRange.startDate, dateRange.endDate],
    enabled: !!(dateRange.startDate && dateRange.endDate)
  });

  if (incomeDataError && isUnauthorizedError(incomeDataError as Error)) {
    toast({
      title: "غير مصرح",
      description: "جاري إعادة تسجيل الدخول...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  const { data: expenseData, error: expenseDataError } = useQuery({
    queryKey: ["/api/expenses", dateRange.startDate, dateRange.endDate],
    enabled: !!(dateRange.startDate && dateRange.endDate)
  });

  if (expenseDataError && isUnauthorizedError(expenseDataError as Error)) {
    toast({
      title: "غير مصرح",
      description: "جاري إعادة تسجيل الدخول...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  const { data: customers, error: customersDataError } = useQuery({
    queryKey: ["/api/customers"]
  });

  if (customersDataError && isUnauthorizedError(customersDataError as Error)) {
    toast({
      title: "غير مصرح",
      description: "جاري إعادة تسجيل الدخول...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  const { data: employees, error: employeesDataError } = useQuery({
    queryKey: ["/api/employees"]
  });

  if (employeesDataError && isUnauthorizedError(employeesDataError as Error)) {
    toast({
      title: "غير مصرح",
      description: "جاري إعادة تسجيل الدخول...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  const generateReportMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/reports/generate", data);
    },
    onSuccess: (response) => {
      toast({
        title: "تم إنشاء التقرير",
        description: "تم إنشاء التقرير بنجاح ويمكن تحميله الآن",
      });
      // In a real implementation, you would handle the actual PDF download here
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "جاري إعادة تسجيل الدخول...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ",
        description: "فشل في إنشاء التقرير",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (!data.startDate || !data.endDate || !data.reportType) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى اختيار التاريخ ونوع التقرير",
        variant: "destructive",
      });
      return;
    }
    
    generateReportMutation.mutate(data);
  };

  const handleDateRangeChange = (field: string, value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
    form.setValue(field as any, value);
  };

  const reportTypes = [
    { value: "financial", label: "التقرير المالي", description: "الإيرادات والمصروفات" },
    { value: "customers", label: "تقرير العملاء", description: "حالة الاشتراكات" },
    { value: "employees", label: "تقرير الموظفين", description: "الرواتب والتكاليف" },
    { value: "prints", label: "تقرير المطبوعات", description: "إيرادات المطبوعات" },
    { value: "comprehensive", label: "التقرير الشامل", description: "جميع البيانات" },
  ];

  // Calculate summary data
  const totalIncome = incomeData?.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0) || 0;
  const totalExpenses = expenseData?.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0) || 0;
  const netProfit = totalIncome - totalExpenses;
  const printIncome = incomeData?.filter((entry: any) => entry.type === 'prints')
    .reduce((sum: number, entry: any) => sum + Number(entry.amount), 0) || 0;

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
              <h1 className="text-3xl font-bold" data-testid="text-page-title">التقارير</h1>
              <p className="text-gray-300" data-testid="text-page-subtitle">إنشاء وتصدير التقارير بصيغة PDF</p>
            </div>
          </div>
        </div>

        {/* Report Generation Form */}
        <GlassCard className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6" data-testid="text-generate-report-title">إنشاء تقرير جديد</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ البداية</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="glass-card border-white/20 focus:border-indigo-400"
                          data-testid="input-start-date"
                          onChange={(e) => {
                            field.onChange(e);
                            handleDateRangeChange('startDate', e.target.value);
                          }}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ النهاية</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="glass-card border-white/20 focus:border-indigo-400"
                          data-testid="input-end-date"
                          onChange={(e) => {
                            field.onChange(e);
                            handleDateRangeChange('endDate', e.target.value);
                          }}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع التقرير</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedReportType(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="glass-card border-white/20" data-testid="select-report-type">
                          <SelectValue placeholder="اختر نوع التقرير" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-gray-400">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full gradient-indigo hover:scale-105 transition-transform"
                disabled={generateReportMutation.isPending}
                data-testid="button-generate-report"
              >
                <Download className="w-4 h-4 ml-2" />
                {generateReportMutation.isPending ? "جاري إنشاء التقرير..." : "إنشاء وتحميل التقرير PDF"}
              </Button>
            </form>
          </Form>
        </GlassCard>

        {/* Data Summary */}
        {(dateRange.startDate && dateRange.endDate) && (
          <GlassCard className="p-6 mb-8">
            <h3 className="text-lg font-semibold mb-6" data-testid="text-summary-title">
              ملخص البيانات للفترة ({dateRange.startDate} - {dateRange.endDate})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm" data-testid="text-total-income">إجمالي الدخل</p>
                    <p className="text-xl font-bold text-green-400" data-testid="text-income-amount">
                      {totalIncome} د.ع
                    </p>
                  </div>
                  <div className="w-10 h-10 gradient-green rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm" data-testid="text-total-expenses">إجمالي المصروفات</p>
                    <p className="text-xl font-bold text-red-400" data-testid="text-expenses-amount">
                      {totalExpenses} د.ع
                    </p>
                  </div>
                  <div className="w-10 h-10 gradient-red rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm" data-testid="text-net-profit">صافي الربح</p>
                    <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} data-testid="text-profit-amount">
                      {netProfit} د.ع
                    </p>
                  </div>
                  <div className={`w-10 h-10 gradient-${netProfit >= 0 ? 'green' : 'red'} rounded-full flex items-center justify-center`}>
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm" data-testid="text-print-income">دخل المطبوعات</p>
                    <p className="text-xl font-bold text-orange-400" data-testid="text-print-amount">
                      {printIncome} د.ع
                    </p>
                  </div>
                  <div className="w-10 h-10 gradient-orange rounded-full flex items-center justify-center">
                    <Printer className="w-5 h-5" />
                  </div>
                </div>
              </GlassCard>
            </div>
          </GlassCard>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm" data-testid="text-total-customers">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-purple-400" data-testid="text-customers-count">
                  {customers?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 gradient-purple rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm" data-testid="text-total-employees">إجمالي الموظفين</p>
                <p className="text-2xl font-bold text-cyan-400" data-testid="text-employees-count">
                  {employees?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 gradient-cyan rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm" data-testid="text-available-reports">التقارير المتاحة</p>
                <p className="text-2xl font-bold text-indigo-400" data-testid="text-reports-count">
                  {reportTypes.length}
                </p>
              </div>
              <div className="w-12 h-12 gradient-indigo rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
