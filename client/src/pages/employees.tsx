import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { ArrowRight, Plus, Bus, Trash2, DollarSign, Warehouse, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertEmployeeSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Employees() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      name: "",
      position: "",
      salary: "",
    },
  });

  const { data: employees, isLoading, error: employeesError } = useQuery({
    queryKey: ["/api/employees"]
  });

  if (employeesError && isUnauthorizedError(employeesError as Error)) {
    toast({
      title: "غير مصرح",
      description: "جاري إعادة تسجيل الدخول...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  const { data: stats, error: statsError } = useQuery({
    queryKey: ["/api/dashboard/stats"]
  });

  if (statsError && isUnauthorizedError(statsError as Error)) {
    toast({
      title: "غير مصرح",
      description: "جاري إعادة تسجيل الدخول...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  const addEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/employees", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الموظف بنجاح",
      });
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
        description: "فشل في إضافة الموظف",
        variant: "destructive",
      });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      return await apiRequest("DELETE", `/api/employees/${employeeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الموظف بنجاح",
      });
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
        description: "فشل في حذف الموظف",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    addEmployeeMutation.mutate(data);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
      deleteEmployeeMutation.mutate(employeeId);
    }
  };

  const getFinancialStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getFinancialStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'صحي';
      case 'warning': return 'تحذير';
      case 'critical': return 'خطر';
      default: return 'غير محدد';
    }
  };

  const getFinancialStatusGradient = (status: string) => {
    switch (status) {
      case 'healthy': return 'gradient-green';
      case 'warning': return 'gradient-orange';
      case 'critical': return 'gradient-red';
      default: return 'gradient-gray';
    }
  };

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
              <h1 className="text-3xl font-bold" data-testid="text-page-title">إدارة الموظفين</h1>
              <p className="text-gray-300" data-testid="text-page-subtitle">إدارة الموظفين والرواتب ومقارنة المخزون</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-cyan hover:scale-105 transition-transform" data-testid="button-add-employee">
                <Plus className="w-4 h-4 ml-2" />
                إضافة موظف
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md glass-card border-white/20">
              <DialogHeader>
                <DialogTitle data-testid="text-dialog-title">إضافة موظف جديد</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الموظف</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="أدخل اسم الموظف" 
                            className="glass-card border-white/20 focus:border-cyan-400"
                            data-testid="input-employee-name"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المنصب (اختياري)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="مثال: مطور، محاسب، مدير..." 
                            className="glass-card border-white/20 focus:border-cyan-400"
                            data-testid="input-employee-position"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الراتب (دينار عراقي)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="0" 
                            className="glass-card border-white/20 focus:border-cyan-400"
                            data-testid="input-employee-salary"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full gradient-cyan hover:scale-105 transition-transform"
                    disabled={addEmployeeMutation.isPending}
                    data-testid="button-submit-employee"
                  >
                    {addEmployeeMutation.isPending ? "جاري الحفظ..." : "إضافة الموظف"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Financial Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm" data-testid="text-current-inventory">المخزون الحالي</p>
                <p className="text-2xl font-bold text-green-400" data-testid="text-inventory-amount">
                  {stats ? `${stats.currentInventory} د.ع` : "..."}
                </p>
              </div>
              <div className="w-12 h-12 gradient-green rounded-full flex items-center justify-center">
                <Warehouse className="w-6 h-6" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm" data-testid="text-total-salaries">مجموع الرواتب</p>
                <p className="text-2xl font-bold" data-testid="text-salaries-amount">
                  {stats ? `${stats.totalSalaries} د.ع` : "..."}
                </p>
              </div>
              <div className="w-12 h-12 gradient-blue rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm" data-testid="text-financial-status">الحالة المالية</p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className={`w-4 h-4 rounded-full ${stats?.financialStatus === 'healthy' ? 'bg-green-500' : stats?.financialStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  <p 
                    className={`text-lg font-bold ${getFinancialStatusColor(stats?.financialStatus || 'healthy')}`}
                    data-testid="text-status-indicator"
                  >
                    {stats ? getFinancialStatusText(stats.financialStatus) : "..."}
                  </p>
                </div>
              </div>
              <div className={`w-12 h-12 ${getFinancialStatusGradient(stats?.financialStatus || 'healthy')} rounded-full flex items-center justify-center`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Employee List */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-6" data-testid="text-employee-list-title">قائمة الموظفين</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">جاري تحميل الموظفين...</p>
            </div>
          ) : employees?.length ? (
            <div className="grid gap-4">
              {employees.map((employee: any, index: number) => (
                <GlassCard 
                  key={employee.id} 
                  className="p-6"
                  data-testid={`card-employee-${index}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-12 h-12 gradient-cyan rounded-full flex items-center justify-center">
                        <Bus className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold" data-testid={`text-employee-name-${index}`}>
                          {employee.name}
                        </h3>
                        {employee.position && (
                          <p className="text-sm text-gray-400" data-testid={`text-employee-position-${index}`}>
                            {employee.position}
                          </p>
                        )}
                        <p className="text-sm text-gray-300" data-testid={`text-employee-created-${index}`}>
                          تاريخ التعيين: {new Date(employee.createdAt).toLocaleDateString('ar-IQ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="text-left">
                        <p className="text-2xl font-bold text-cyan-400" data-testid={`text-employee-salary-${index}`}>
                          {employee.salary} د.ع
                        </p>
                        <p className="text-xs text-gray-400">الراتب الشهري</p>
                      </div>
                      <Button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        disabled={deleteEmployeeMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="border-red-400 text-red-400 hover:bg-red-400/10"
                        data-testid={`button-delete-employee-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Bus className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p data-testid="text-no-employees">لا يوجد موظفين مسجلين بعد</p>
              <p className="text-sm mt-2">ابدأ بإضافة أول موظف</p>
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
}
