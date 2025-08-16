import { useState } from "react";
import { Bell, User, LogOut, Settings, Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "أيمن النجار",
    email: user?.email || "admin@iqrcontrol.com",
    username: "admin",
    phone: "+964 770 123 4567",
    password: "",
    confirmPassword: ""
  });

  const handleSaveProfile = async () => {
    try {
      // Validate password confirmation
      if (profileData.password && profileData.password !== profileData.confirmPassword) {
        toast({
          title: "خطأ",
          description: "كلمات المرور غير متطابقة",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/auth/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          username: profileData.username,
          phone: profileData.phone,
          password: profileData.password || undefined
        }),
      });

      if (response.ok) {
        toast({
          title: "تم الحفظ",
          description: "تم حفظ تغييرات البروفايل بنجاح",
          variant: "default"
        });
        setIsProfileEditOpen(false);
        // Clear password fields
        setProfileData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ البروفايل",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="glass-card border-b border-white/20 px-6 py-4 sticky top-0 z-50 mx-4 mt-4 rounded-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="w-12 h-12 gradient-purple rounded-full flex items-center justify-center">
            <i className="fas fa-chart-line text-xl text-white"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-app-title">IQR CONTROL</h1>
            <p className="text-sm text-gray-300" data-testid="text-app-subtitle">نظام إدارة الأعمال المتكامل</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <button 
            className="p-2 glass-card rounded-full hover:bg-white/20 transition-all duration-300"
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogTrigger asChild>
              <div className="flex items-center space-x-3 space-x-reverse cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-all duration-300" data-testid="button-profile">
                <div className="w-10 h-10 gradient-blue rounded-full flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <span className="text-sm font-medium" data-testid="text-username">
                  أيمن النجار
                </span>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md glass-card border-white/20">
              <DialogHeader>
                <DialogTitle data-testid="text-profile-title">الملف الشخصي</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-16 h-16 gradient-blue rounded-full flex items-center justify-center">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <User className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" data-testid="text-profile-name">أيمن النجار</h3>
                    <p className="text-sm text-gray-400" data-testid="text-profile-email">{user?.email || "admin@iqrcontrol.com"}</p>
                    <p className="text-xs text-gray-500" data-testid="text-profile-role">مدير النظام</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-300">معلومات الحساب</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">اسم المستخدم:</span>
                      <span data-testid="text-profile-username">أيمن النجار</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">البريد الإلكتروني:</span>
                      <span data-testid="text-profile-user-email">{user?.email || "admin@iqrcontrol.com"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">الدور:</span>
                      <span className="text-green-400" data-testid="text-profile-user-role">مدير النظام</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">تاريخ الانضمام:</span>
                      <span data-testid="text-profile-join-date">{new Date().toLocaleDateString('ar-IQ')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 space-x-reverse">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-blue-400 text-blue-400 hover:bg-blue-400/10"
                    onClick={() => setIsProfileEditOpen(true)}
                    data-testid="button-profile-edit"
                  >
                    <Settings className="w-4 h-4 ml-2" />
                    تعديل البروفايل
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-400 text-red-400 hover:bg-red-400/10"
                    onClick={() => window.location.href = '/api/logout'}
                    data-testid="button-profile-logout"
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    تسجيل الخروج
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Profile Edit Dialog */}
          <Dialog open={isProfileEditOpen} onOpenChange={setIsProfileEditOpen}>
            <DialogContent className="sm:max-w-md glass-card border-white/20">
              <DialogHeader>
                <DialogTitle data-testid="text-profile-edit-title">تعديل البروفايل</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">الاسم الكامل</Label>
                    <Input 
                      id="edit-name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="glass-card border-white/20 focus:border-blue-400"
                      data-testid="input-edit-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                    <Input 
                      id="edit-email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="glass-card border-white/20 focus:border-blue-400"
                      data-testid="input-edit-email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-username">اسم المستخدم</Label>
                    <Input 
                      id="edit-username"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      className="glass-card border-white/20 focus:border-blue-400"
                      data-testid="input-edit-username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">رقم الهاتف</Label>
                    <Input 
                      id="edit-phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="glass-card border-white/20 focus:border-blue-400"
                      data-testid="input-edit-phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-password">كلمة المرور الجديدة (اختياري)</Label>
                    <Input 
                      id="edit-password"
                      type="password"
                      value={profileData.password}
                      onChange={(e) => setProfileData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="اتركها فارغة إذا لم ترد التغيير"
                      className="glass-card border-white/20 focus:border-blue-400"
                      data-testid="input-edit-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-confirm-password">تأكيد كلمة المرور</Label>
                    <Input 
                      id="edit-confirm-password"
                      type="password"
                      value={profileData.confirmPassword}
                      onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="تأكيد كلمة المرور الجديدة"
                      className="glass-card border-white/20 focus:border-blue-400"
                      data-testid="input-edit-confirm-password"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 space-x-reverse">
                  <Button 
                    className="flex-1 gradient-blue hover:scale-105 transition-transform"
                    onClick={handleSaveProfile}
                    data-testid="button-save-profile"
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-gray-400 text-gray-400 hover:bg-gray-400/10"
                    onClick={() => setIsProfileEditOpen(false)}
                    data-testid="button-cancel-profile-edit"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
