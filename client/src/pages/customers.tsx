import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { ArrowRight, Plus, RotateCcw, ExternalLink, Calendar, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertCustomerSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Customers() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [renewingCustomerId, setRenewingCustomerId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      menuUrl: "",
      joinDate: new Date().toISOString().split('T')[0],
      subscriptionType: "annual",
    },
  });

  const { data: customers, isLoading, error: customersError } = useQuery({
    queryKey: ["/api/customers"]
  });

  if (customersError && isUnauthorizedError(customersError as Error)) {
    toast({
      title: "غير مصرح",
      description: "جاري إعادة تسجيل الدخول...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  const addCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/customers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "تم بنجاح",
        description: "تم إضافة العميل بنجاح",
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
        description: "فشل في إضافة العميل",
        variant: "destructive",
      });
    },
  });

  const renewSubscriptionMutation = useMutation({
    mutationFn: async (customerId: string) => {
      return await apiRequest("PATCH", `/api/customers/${customerId}/renew`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "تم التجديد",
        description: "تم تجديد الاشتراك لسنة إضافية",
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
        description: "فشل في تجديد الاشتراك",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    addCustomerMutation.mutate(data);
  };

  const handleRenewSubscription = (customerId: string) => {
    renewSubscriptionMutation.mutate(customerId);
    setRenewingCustomerId(null);
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
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
              <h1 className="text-3xl font-bold" data-testid="text-page-title">إدارة العملاء</h1>
              <p className="text-gray-300" data-testid="text-page-subtitle">إضافة وإدارة عملاء النظام</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-purple hover:scale-105 transition-transform" data-testid="button-add-customer">
                <Plus className="w-4 h-4 ml-2" />
                إضافة عميل
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md glass-card border-white/20">
              <DialogHeader>
                <DialogTitle data-testid="text-dialog-title">إضافة عميل جديد</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم العميل</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="أدخل اسم العميل" 
                            className="glass-card border-white/20 focus:border-purple-400"
                            data-testid="input-customer-name"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="menuUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رابط المنيو</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/menu" 
                            className="glass-card border-white/20 focus:border-purple-400"
                            data-testid="input-menu-url"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="joinDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الانضمام</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="glass-card border-white/20 focus:border-purple-400"
                            data-testid="input-join-date"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subscriptionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الاشتراك</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20" data-testid="select-subscription-type">
                              <SelectValue placeholder="اختر نوع الاشتراك" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="annual">سنوي</SelectItem>
                            <SelectItem value="semi-annual">نصف سنوي</SelectItem>
                            <SelectItem value="quarterly">ربع سنوي</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full gradient-purple hover:scale-105 transition-transform"
                    disabled={addCustomerMutation.isPending}
                    data-testid="button-submit-customer"
                  >
                    {addCustomerMutation.isPending ? "جاري الحفظ..." : "إضافة العميل"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Customer List */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-6" data-testid="text-customer-list-title">قائمة العملاء</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">جاري تحميل العملاء...</p>
            </div>
          ) : customers?.length ? (
            <div className="grid gap-4">
              {customers.map((customer: any, index: number) => (
                <GlassCard 
                  key={customer.id} 
                  className="p-6"
                  data-testid={`card-customer-${index}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className={`w-12 h-12 gradient-purple rounded-full flex items-center justify-center`}>
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold flex items-center space-x-2 space-x-reverse">
                          <span data-testid={`text-customer-name-${index}`}>{customer.name}</span>
                          {isExpired(customer.expiryDate) && (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                          {isExpiringSoon(customer.expiryDate) && (
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-400" data-testid={`text-customer-join-date-${index}`}>
                          تاريخ الانضمام: {new Date(customer.joinDate).toLocaleDateString('ar-IQ')}
                        </p>
                        <p 
                          className={`text-sm ${isExpired(customer.expiryDate) ? 'text-red-400' : isExpiringSoon(customer.expiryDate) ? 'text-yellow-400' : 'text-gray-300'}`}
                          data-testid={`text-customer-expiry-date-${index}`}
                        >
                          ينتهي في: {new Date(customer.expiryDate).toLocaleDateString('ar-IQ')}
                        </p>
                        <p className="text-xs text-gray-500" data-testid={`text-customer-subscription-type-${index}`}>
                          نوع الاشتراك: {customer.subscriptionType === 'annual' ? 'سنوي' : customer.subscriptionType === 'semi-annual' ? 'نصف سنوي' : 'ربع سنوي'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 space-x-reverse">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            disabled={renewSubscriptionMutation.isPending}
                            className="gradient-green hover:scale-105 transition-transform"
                            data-testid={`button-renew-${index}`}
                          >
                            <RotateCcw className="w-4 h-4 ml-1" />
                            تجديد
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card border-white/20">
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد التجديد</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من أنك تريد تجديد اشتراك العميل "{customer.name}" لسنة إضافية؟
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-row-reverse">
                            <AlertDialogAction 
                              onClick={() => handleRenewSubscription(customer.id)}
                              className="gradient-green"
                            >
                              تأكيد التجديد
                            </AlertDialogAction>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      {customer.menuUrl && (
                        <Button
                          asChild
                          variant="outline"
                          className="border-blue-400 text-blue-400 hover:bg-blue-400/10"
                          data-testid={`button-view-menu-${index}`}
                        >
                          <a 
                            href={customer.menuUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 ml-1" />
                            المنيو
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
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p data-testid="text-no-customers">لا يوجد عملاء مسجلين بعد</p>
              <p className="text-sm mt-2">ابدأ بإضافة أول عميل لك</p>
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
}
