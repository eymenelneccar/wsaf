import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { ArrowRight, Plus, DollarSign, Upload } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { insertIncomeEntrySchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Income() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [incomeType, setIncomeType] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertIncomeEntrySchema.extend({
      customerId: insertIncomeEntrySchema.shape.customerId.optional(),
    })),
    defaultValues: {
      type: "",
      printType: "",
      amount: "",
      customerId: "",
      description: "",
    },
  });

  const { data: incomeEntries, isLoading, error: incomeError } = useQuery({
    queryKey: ["/api/income"]
  });

  if (incomeError && isUnauthorizedError(incomeError as Error)) {
    toast({
      title: "غير مصرح",
      description: "جاري إعادة تسجيل الدخول...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  const { data: customers, error: customersFetchError } = useQuery({
    queryKey: ["/api/customers"]
  });

  if (customersFetchError && isUnauthorizedError(customersFetchError as Error)) {
    toast({
      title: "غير مصرح",
      description: "جاري إعادة تسجيل الدخول...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  const addIncomeMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });
      
      if (selectedFile) {
        formData.append('receipt', selectedFile);
      }

      return await fetch("/api/income", {
        method: "POST",
        body: formData,
        credentials: "include",
      }).then(async res => {
        if (!res.ok) {
          throw new Error(`${res.status}: ${await res.text()}`);
        }
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsAddDialogOpen(false);
      form.reset();
      setSelectedFile(null);
      setIncomeType("");
      toast({
        title: "تم بنجاح",
        description: "تم تسجيل الإدخال بنجاح",
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
        description: "فشل في تسجيل الإدخال",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    addIncomeMutation.mutate(data);
  };

  const handleTypeChange = (value: string) => {
    setIncomeType(value);
    form.setValue("type", value);
    if (value !== "prints") {
      form.setValue("printType", "");
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
              <h1 className="text-3xl font-bold" data-testid="text-page-title">إدارة الإدخالات</h1>
              <p className="text-gray-300" data-testid="text-page-subtitle">تسجيل الحوالات والمطبوعات</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-green hover:scale-105 transition-transform" data-testid="button-add-income">
                <Plus className="w-4 h-4 ml-2" />
                إضافة إدخال
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg glass-card border-white/20">
              <DialogHeader>
                <DialogTitle data-testid="text-dialog-title">إضافة إدخال جديد</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الحوالة</FormLabel>
                        <Select onValueChange={handleTypeChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20" data-testid="select-income-type">
                              <SelectValue placeholder="اختر نوع الحوالة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="prints">مطبوعات</SelectItem>
                            <SelectItem value="subscription">اشتراك</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {incomeType === "prints" && (
                    <FormField
                      control={form.control}
                      name="printType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع المطبوع</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="أدخل نوع المطبوع" 
                              className="glass-card border-white/20 focus:border-green-400"
                              data-testid="input-print-type"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المبلغ (دينار عراقي)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="0" 
                            className="glass-card border-white/20 focus:border-green-400"
                            data-testid="input-amount"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العميل</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20" data-testid="select-customer">
                              <SelectValue placeholder="اختر العميل" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers?.map((customer: any) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">رفع الفيش الإلكتروني</Label>
                    <FileUpload 
                      onFileSelect={setSelectedFile}
                      accept="image/*,application/pdf"
                      data-testid="file-upload-receipt"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full gradient-green hover:scale-105 transition-transform"
                    disabled={addIncomeMutation.isPending}
                    data-testid="button-submit-income"
                  >
                    {addIncomeMutation.isPending ? "جاري الحفظ..." : "تسجيل الإدخال"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Income Entries List */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-6" data-testid="text-income-list-title">قائمة الإدخالات</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">جاري تحميل الإدخالات...</p>
            </div>
          ) : incomeEntries?.length ? (
            <div className="grid gap-4">
              {incomeEntries.map((entry: any, index: number) => (
                <GlassCard 
                  key={entry.id} 
                  className="p-6"
                  data-testid={`card-income-${index}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className={`w-12 h-12 gradient-${entry.type === 'prints' ? 'orange' : 'blue'} rounded-full flex items-center justify-center`}>
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold" data-testid={`text-income-type-${index}`}>
                          {entry.type === 'prints' ? 'مطبوعات' : 'اشتراك'}
                          {entry.printType && ` - ${entry.printType}`}
                        </h3>
                        <p className="text-2xl font-bold text-green-400" data-testid={`text-income-amount-${index}`}>
                          {entry.amount} د.ع
                        </p>
                        <p className="text-sm text-gray-400" data-testid={`text-income-date-${index}`}>
                          {new Date(entry.createdAt).toLocaleDateString('ar-IQ')}
                        </p>
                        {entry.description && (
                          <p className="text-sm text-gray-300" data-testid={`text-income-description-${index}`}>
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
                          className="border-blue-400 text-blue-400 hover:bg-blue-400/10 mb-2"
                          data-testid={`button-view-receipt-${index}`}
                        >
                          <a 
                            href={entry.receiptUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Upload className="w-4 h-4 ml-1" />
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
              <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p data-testid="text-no-income">لا توجد إدخالات مسجلة بعد</p>
              <p className="text-sm mt-2">ابدأ بتسجيل أول إدخال</p>
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
}
