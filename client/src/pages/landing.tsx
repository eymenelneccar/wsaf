import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full p-8 text-center animate-float">
        <div className="w-20 h-20 gradient-purple rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
          <i className="fas fa-chart-line text-3xl text-white"></i>
        </div>
        
        <h1 className="text-3xl font-bold mb-2" data-testid="text-landing-title">IQR CONTROL</h1>
        <p className="text-gray-300 mb-8" data-testid="text-landing-subtitle">
          نظام إدارة الأعمال المتكامل
        </p>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-400" data-testid="text-landing-description">
            إدارة شاملة للعملاء والمالية والموظفين والتقارير
          </p>
          
          <Button 
            onClick={handleLogin}
            className="w-full gradient-purple hover:scale-105 transition-transform duration-300 py-3"
            data-testid="button-login"
          >
            تسجيل الدخول
          </Button>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-gray-400">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>إدارة العملاء</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>التقارير المالية</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>إدارة الموظفين</span>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span>المطبوعات</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
