import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertCustomerSchema,
  insertIncomeEntrySchema,
  insertExpenseEntrySchema,
  insertEmployeeSchema,
  insertManualUserSchema
} from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات الصور و PDF'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put('/api/auth/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, email, username, phone, password } = req.body;
      
      // Prepare update data
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (username) updateData.username = username;
      if (phone) updateData.phone = phone;
      
      // Hash password if provided
      if (password && password.trim() !== '') {
        const hashedPassword = await hashPassword(password);
        updateData.password = hashedPassword;
      }
      
      // Update user in storage
      await storage.updateUserProfile(userId, updateData);
      
      // Return updated user data
      const updatedUser = await storage.getUser(userId);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "فشل في تحديث البروفايل" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "فشل في جلب إحصائيات لوحة التحكم" });
    }
  });

  // Recent activities
  app.get('/api/activities', isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getRecentActivities(10);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "فشل في جلب الأنشطة الأخيرة" });
    }
  });

  // Customer routes
  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "فشل في جلب العملاء" });
    }
  });

  app.post('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "بيانات العميل غير صحيحة" });
    }
  });

  app.patch('/api/customers/:id/renew', isAuthenticated, async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "العميل غير موجود" });
      }

      // Extend subscription by one year
      const currentExpiry = new Date(customer.expiryDate);
      const newExpiry = new Date(currentExpiry);
      newExpiry.setFullYear(currentExpiry.getFullYear() + 1);

      const updatedCustomer = await storage.updateCustomer(req.params.id, {
        expiryDate: newExpiry.toISOString().split('T')[0],
        isActive: true
      });

      // Log activity
      await storage.createActivity({
        type: 'subscription_renewed',
        description: `تم تجديد اشتراك العميل: ${customer.name}`,
        relatedId: customer.id,
      });

      res.json(updatedCustomer);
    } catch (error) {
      console.error("Error renewing subscription:", error);
      res.status(500).json({ message: "فشل في تجديد الاشتراك" });
    }
  });

  app.get('/api/customers/expiring/:days', isAuthenticated, async (req, res) => {
    try {
      const days = parseInt(req.params.days);
      const expiringCustomers = await storage.getExpiringCustomers(days);
      res.json(expiringCustomers);
    } catch (error) {
      console.error("Error fetching expiring customers:", error);
      res.status(500).json({ message: "فشل في جلب العملاء المنتهيين" });
    }
  });

  // Income routes
  app.get('/api/income', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const incomeEntries = await storage.getIncomeEntries(start, end);
      res.json(incomeEntries);
    } catch (error) {
      console.error("Error fetching income entries:", error);
      res.status(500).json({ message: "فشل في جلب الإدخالات" });
    }
  });

  app.post('/api/income', isAuthenticated, upload.single('receipt'), async (req, res) => {
    try {
      const validatedData = insertIncomeEntrySchema.parse({
        ...req.body,
        receiptUrl: req.file ? `/uploads/${req.file.filename}` : null
      });
      
      const incomeEntry = await storage.createIncomeEntry(validatedData);
      res.status(201).json(incomeEntry);
    } catch (error) {
      console.error("Error creating income entry:", error);
      res.status(400).json({ message: "بيانات الإدخال غير صحيحة" });
    }
  });

  app.get('/api/income/prints', isAuthenticated, async (req, res) => {
    try {
      const printEntries = await storage.getPrintIncomeEntries();
      res.json(printEntries);
    } catch (error) {
      console.error("Error fetching print entries:", error);
      res.status(500).json({ message: "فشل في جلب المطبوعات" });
    }
  });

  // Expense routes
  app.get('/api/expenses', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const expenseEntries = await storage.getExpenseEntries(start, end);
      res.json(expenseEntries);
    } catch (error) {
      console.error("Error fetching expense entries:", error);
      res.status(500).json({ message: "فشل في جلب الإخراجات" });
    }
  });

  app.post('/api/expenses', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertExpenseEntrySchema.parse(req.body);
      const expenseEntry = await storage.createExpenseEntry(validatedData);
      res.status(201).json(expenseEntry);
    } catch (error) {
      console.error("Error creating expense entry:", error);
      res.status(400).json({ message: "بيانات الإخراج غير صحيحة" });
    }
  });

  

  // Employee routes
  app.get('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "فشل في جلب الموظفين" });
    }
  });

  app.post('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(400).json({ message: "بيانات الموظف غير صحيحة" });
    }
  });

  app.delete('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteEmployee(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "فشل في حذف الموظف" });
    }
  });

  // Reports route
  app.post('/api/reports/generate', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate, reportType } = req.body;
      
      // This is a simplified PDF generation - in production you'd use proper PDF libraries
      const reportData = {
        period: `${startDate} إلى ${endDate}`,
        type: reportType,
        generatedAt: new Date().toISOString(),
        // Add actual data based on report type
      };

      res.json({
        message: "تم إنشاء التقرير بنجاح",
        downloadUrl: "/api/reports/download/sample.pdf",
        data: reportData
      });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "فشل في إنشاء التقرير" });
    }
  });

  // User management routes
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't return password hashes in the response
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "فشل في جلب المستخدمين" });
    }
  });

  app.post('/api/users', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertManualUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(validatedData.password);
      
      const user = await storage.createManualUser({
        ...validatedData,
        password: hashedPassword,
      });
      
      // Don't return password hash in the response
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: "بيانات المستخدم غير صحيحة" });
      } else {
        res.status(500).json({ message: "فشل في إنشاء المستخدم" });
      }
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
