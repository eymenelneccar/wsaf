import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "wouter";
import { ArrowRight, UserPlus, Shield, Eye, Edit, Users, Crown } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertManualUserSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function UserManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const form = useForm({
    resolver: zodResolver(insertManualUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "viewer",
    },
  });

  const { data: users = [], isLoading, error: usersError } = useQuery({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء المستخدم بنجاح",
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
        description: error.message || "فشل في إنشاء المستخدم",
        variant: "destructive",
      });
    },
  });

  if (usersError && isUnauthorizedError(usersError as Error)) {
    toast({
      title: "غير مصرح",
      description: "جاري إعادة تسجيل الدخول...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  const onSubmit = (data: any) => {
    createUserMutation.mutate(data);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'editor': return Edit;
      case 'viewer': return Eye;
      default: return Shield;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'editor': return 'محرر';
      case 'viewer': return 'مشاهد';
      default: return 'غير محدد';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'gradient-red';
      case 'editor': return 'gradient-blue';
      case 'viewer': return 'gradient-green';
      default: return 'gradient-gray';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400';
      case 'editor': return 'bg-blue-500/20 text-blue-400';
      case 'viewer': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const rolePermissions = {
    viewer: ["عرض لوحة التحكم", "عرض التقارير", "عرض بيانات العملاء"],
    editor: ["عرض جميع البيانات", "إضافة وتعديل العملاء", "إدارة الإدخالات والإخراجات", "إدارة الموظفين"],
    admin: ["جميع الصلاحيات", "إدارة المستخدمين", "حذف البيانات", "تصدير التقارير"],
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
              <h1 className="text-3xl font-bold" data-testid="text-page-title">إدارة المستخدمين</h1>
              <p className="text-gray-300" data-testid="text-page-subtitle">إنشاء حسابات مستخدمين بصلاحيات محددة</p>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-purple hover:scale-105 transition-transform" data-testid="button-add-user">
                <UserPlus className="w-4 h-4 ml-2" />
                إضافة مستخدم
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md glass-card border-white/20">
              <DialogHeader>
                <DialogTitle data-testid="text-dialog-title">إضافة مستخدم جديد</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المستخدم</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="username" 
                            className="glass-card border-white/20 focus:border-purple-400"
                            data-testid="input-username"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="••••••" 
                            className="glass-card border-white/20 focus:border-purple-400"
                            data-testid="input-password"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الصلاحية</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="glass-card border-white/20" data-testid="select-user-role">
                              <SelectValue placeholder="اختر الصلاحية" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="viewer">مشاهد - عرض البيانات فقط</SelectItem>
                            <SelectItem value="editor">محرر - إضافة وتعديل البيانات</SelectItem>
                            <SelectItem value="admin">مدير - جميع الصلاحيات</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full gradient-purple hover:scale-105 transition-transform"
                    disabled={createUserMutation.isPending}
                    data-testid="button-submit-user"
                  >
                    {createUserMutation.isPending ? "جاري الإنشاء..." : "إضافة المستخدم"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Role Permissions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(rolePermissions).map(([role, permissions]) => {
            const RoleIcon = getRoleIcon(role);
            return (
              <GlassCard key={role} className="p-6">
                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                  <div className={`w-10 h-10 ${getRoleColor(role)} rounded-full flex items-center justify-center`}>
                    <RoleIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold" data-testid={`text-role-${role}`}>
                    {getRoleText(role)}
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  {permissions.map((permission, index) => (
                    <li key={index} className="flex items-center space-x-2 space-x-reverse">
                      <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                      <span data-testid={`text-permission-${role}-${index}`}>{permission}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            );
          })}
        </div>

        {/* Users List */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-semibold mb-6" data-testid="text-users-list-title">قائمة المستخدمين</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">جاري تحميل المستخدمين...</p>
            </div>
          ) : users?.length ? (
            <div className="grid gap-4">
              {users.map((user: any, index: number) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <GlassCard 
                    key={user.id} 
                    className="p-6"
                    data-testid={`card-user-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-12 h-12 gradient-blue rounded-full flex items-center justify-center overflow-hidden">
                          {user.profileImageUrl ? (
                            <img 
                              src={user.profileImageUrl} 
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold" data-testid={`text-user-name-${index}`}>
                            {user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'مستخدم'}
                          </h3>
                          <p className="text-sm text-gray-400" data-testid={`text-user-email-${index}`}>
                            {user.email || (user.username ? `@${user.username}` : 'بدون بريد إلكتروني')}
                          </p>
                          <p className="text-xs text-gray-500" data-testid={`text-user-created-${index}`}>
                            تاريخ الإنشاء: {new Date(user.createdAt).toLocaleDateString('ar-IQ')}
                          </p>
                          {user.isManualUser && (
                            <p className="text-xs text-blue-400">حساب محلي</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Badge className={`${getRoleBadgeColor(user.role)} border-0`} data-testid={`badge-user-role-${index}`}>
                          <RoleIcon className="w-3 h-3 ml-1" />
                          {getRoleText(user.role)}
                        </Badge>
                        
                        {currentUser?.id === user.id && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-0" data-testid={`badge-current-user-${index}`}>
                            أنت
                          </Badge>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p data-testid="text-no-users">لا يوجد مستخدمين إضافيين</p>
              <p className="text-sm mt-2">ابدأ بإضافة مستخدمين جدد للنظام</p>
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
}
