import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Users, 
  DollarSign, 
  Receipt, 
  Printer, 
  Bus, 
  BarChart3,
  ExternalLink,
  UserPlus,
  Handshake,
  Plus,
  TrendingUp,
  AlertTriangle,
  Warehouse
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
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

  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useQuery({
    queryKey: ["/api/activities"]
  });

  if (activitiesError && isUnauthorizedError(activitiesError as Error)) {
    toast({
      title: "غير مصرح",
      description: "جاري إعادة تسجيل الدخول...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }

  const modules = [
    {
      title: "إدارة العملاء",
      description: "إضافة العملاء وتتبع الاشتراكات والتجديدات التلقائية",
      icon: Users,
      gradient: "purple",
      link: "/customers",
      stats: [`${stats?.totalCustomers || 0} عميل`, `${stats?.expiredSubscriptions || 0} منتهي`],
    },
    {
      title: "إدارة الإدخالات",
      description: "تسجيل الحوالات والمطبوعات ورفع الفيوش الإلكترونية",
      icon: DollarSign,
      gradient: "green",
      link: "/income",
      stats: [`${stats?.monthlyIncome || 0} د.ع`, "هذا الشهر"],
    },
    {
      title: "إدارة الإخراجات",
      description: "تسجيل المصاريف والنفقات مع الأسباب التفصيلية",
      icon: Receipt,
      gradient: "red",
      link: "/expenses",
      stats: [`${stats?.totalExpenses || 0} د.ع`, "إجمالي المصاريف"],
    },
    {
      title: "قسم المطبوعات",
      description: "عرض جميع المطبوعات والإيرادات المحققة منها",
      icon: Printer,
      gradient: "orange",
      link: "/prints",
      stats: [`${stats?.printRevenue || 0} د.ع`, "إيرادات المطبوعات"],
    },
    {
      title: "إدارة الموظفين",
      description: "تسجيل الموظفين والرواتب ومقارنة المخزون",
      icon: Bus,
      gradient: "cyan",
      link: "/employees",
      stats: [`${stats?.totalEmployees || 0} موظف`, stats?.financialStatus === 'healthy' ? "الوضع صحي" : stats?.financialStatus === 'warning' ? "تحذير" : "وضع خطر"],
    },
    {
      title: "التقارير",
      description: "إنشاء وتصدير التقارير بصيغة PDF احترافية",
      icon: BarChart3,
      gradient: "indigo",
      link: "/reports",
      stats: ["تقارير شاملة", "جاهزة للتصدير"],
    },
    {
      title: "إدارة المنيوهات",
      description: "رابط مباشر لواجهة الإدارة الخارجية",
      icon: ExternalLink,
      gradient: "pink",
      link: "https://backoffice.dijital.menu/iqr",
      external: true,
      stats: ["إدارة خارجية", "dijital.menu"],
    },
    {
      title: "إنشاء الحسابات",
      description: "إنشاء حسابات مستخدمين بصلاحيات محددة",
      icon: UserPlus,
      gradient: "purple",
      link: "/user-management",
      stats: ["إدارة المستخدمين", "صلاحيات متقدمة"],
    },
    {
      title: "المستثمرين",
      description: "مخصص للتطوير المستقبلي",
      icon: Handshake,
      gradient: "gray",
      disabled: true,
      stats: ["قريباً"],
    },
  ];

  const quickStats = [
    {
      title: "إجمالي العملاء",
      value: stats?.totalCustomers || 0,
      icon: Users,
      gradient: "green",
    },
    {
      title: "الدخل الشهري",
      value: `${stats?.monthlyIncome || 0} د.ع`,
      icon: TrendingUp,
      gradient: "blue",
    },
    {
      title: "اشتراكات منتهية",
      value: stats?.expiredSubscriptions || 0,
      icon: AlertTriangle,
      gradient: "red",
      warning: (stats?.expiredSubscriptions || 0) > 0,
    },
    {
      title: "المخزون الحالي",
      value: `${stats?.currentInventory || 0} د.ع`,
      icon: Warehouse,
      gradient: "purple",
    },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" data-testid="text-dashboard-title">لوحة التحكم الرئيسية</h2>
          <p className="text-gray-300" data-testid="text-dashboard-subtitle">إدارة شاملة لجميع عمليات الشركة</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <GlassCard 
              key={index}
              className="p-6 hover:scale-105 transition-transform duration-300"
              data-testid={`card-stat-${index}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm" data-testid={`text-stat-title-${index}`}>{stat.title}</p>
                  <p 
                    className={`text-2xl font-bold ${stat.warning ? 'text-red-400' : ''}`}
                    data-testid={`text-stat-value-${index}`}
                  >
                    {statsLoading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 gradient-${stat.gradient} rounded-full flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Main Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {modules.map((module, index) => (
            <ModuleCard
              key={index}
              module={module}
              index={index}
            />
          ))}
        </div>

        {/* Recent Activities */}
        <div>
          <h3 className="text-2xl font-bold mb-6" data-testid="text-recent-activities">النشاطات الأخيرة</h3>
          <GlassCard className="p-6">
            <div className="space-y-4">
              {activitiesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-gray-400">جاري التحميل...</p>
                </div>
              ) : activities?.length ? (
                activities.map((activity: any, index: number) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                    data-testid={`activity-${index}`}
                  >
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className={`w-10 h-10 gradient-${getActivityGradient(activity.type)} rounded-full flex items-center justify-center`}>
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium" data-testid={`text-activity-description-${index}`}>{activity.description}</p>
                        <p className="text-sm text-gray-400" data-testid={`text-activity-time-${index}`}>
                          {new Date(activity.createdAt).toLocaleString('ar-IQ')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm ${getActivityStatusColor(activity.type)}`}>
                      {getActivityStatus(activity.type)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p data-testid="text-no-activities">لا توجد أنشطة حديثة</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}

function ModuleCard({ module, index }: { module: any; index: number }) {
  const content = (
    <GlassCard
      className={`p-8 ${module.disabled ? 'opacity-60' : 'hover:scale-105 cursor-pointer'} transition-all duration-500 hover:shadow-2xl animate-float group`}
      glow={!module.disabled}
      data-testid={`card-module-${index}`}
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div className={`w-20 h-20 ${module.disabled ? 'bg-gray-600' : `gradient-${module.gradient}`} rounded-full flex items-center justify-center ${!module.disabled ? 'group-hover:animate-glow' : ''}`}>
          <module.icon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2" data-testid={`text-module-title-${index}`}>{module.title}</h3>
          <p className="text-gray-300 text-sm leading-relaxed" data-testid={`text-module-description-${index}`}>
            {module.description}
          </p>
        </div>
        {module.stats && (
          <div className="flex space-x-2 space-x-reverse">
            {module.stats.map((stat: string, statIndex: number) => (
              <span 
                key={statIndex}
                className={`px-3 py-1 ${module.disabled ? 'bg-yellow-500/20' : 'bg-white/20'} rounded-full text-xs`}
                data-testid={`text-module-stat-${index}-${statIndex}`}
              >
                {stat}
              </span>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );

  if (module.disabled) {
    return content;
  }

  if (module.external) {
    return (
      <a
        href={module.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={module.link}>
      {content}
    </Link>
  );
}

function getActivityGradient(type: string): string {
  switch (type) {
    case 'customer_added': return 'green';
    case 'income_added': return 'blue';
    case 'expense_added': return 'red';
    case 'employee_added': return 'cyan';
    case 'subscription_renewed': return 'purple';
    default: return 'gray';
  }
}

function getActivityStatusColor(type: string): string {
  switch (type) {
    case 'customer_added': return 'text-green-400';
    case 'income_added': return 'text-blue-400';
    case 'expense_added': return 'text-red-400';
    case 'employee_added': return 'text-cyan-400';
    case 'subscription_renewed': return 'text-purple-400';
    default: return 'text-gray-400';
  }
}

function getActivityStatus(type: string): string {
  switch (type) {
    case 'customer_added': return 'مكتمل';
    case 'income_added': return 'مؤكد';
    case 'expense_added': return 'مسجل';
    case 'employee_added': return 'مضاف';
    case 'subscription_renewed': return 'مجدد';
    default: return 'منجز';
  }
}
