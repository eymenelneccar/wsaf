import {
  users,
  customers,
  incomeEntries,
  expenseEntries,
  employees,
  activities,
  type User,
  type UpsertUser,
  type Customer,
  type InsertCustomer,
  type IncomeEntry,
  type InsertIncomeEntry,
  type ExpenseEntry,
  type InsertExpenseEntry,
  type Employee,
  type InsertEmployee,
  type Activity,
  type InsertActivity,
  type InsertManualUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Manual user operations
  getAllUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createManualUser(user: InsertManualUser): Promise<User>;

  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, data: Partial<Customer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;
  getExpiringCustomers(days: number): Promise<Customer[]>;

  // Income operations
  getIncomeEntries(startDate?: Date, endDate?: Date): Promise<IncomeEntry[]>;
  createIncomeEntry(entry: InsertIncomeEntry): Promise<IncomeEntry>;
  getPrintIncomeEntries(): Promise<IncomeEntry[]>;

  // Expense operations
  getExpenseEntries(startDate?: Date, endDate?: Date): Promise<ExpenseEntry[]>;
  createExpenseEntry(entry: InsertExpenseEntry): Promise<ExpenseEntry>;
  

  // Employee operations
  getEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, data: Partial<Employee>): Promise<Employee>;
  deleteEmployee(id: string): Promise<void>;

  // Activity operations
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Dashboard statistics
  getDashboardStats(): Promise<{
    totalCustomers: number;
    monthlyIncome: number;
    expiredSubscriptions: number;
    currentInventory: number;
    totalSalaries: number;
    financialStatus: 'healthy' | 'warning' | 'critical';
  }>;

  // User profile operations
  updateUserProfile(userId: string, updates: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Manual user operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createManualUser(userData: InsertManualUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        isManualUser: true,
      })
      .returning();

    // Log activity
    await this.createActivity({
      type: 'user_created',
      description: `تم إنشاء حساب مستخدم جديد: ${userData.username}`,
      relatedId: user.id,
    });

    return user;
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    // Calculate expiry date based on subscription type
    const joinDate = new Date(customerData.joinDate);
    let expiryDate = new Date(joinDate);

    switch (customerData.subscriptionType) {
      case 'annual':
        expiryDate.setFullYear(joinDate.getFullYear() + 1);
        break;
      case 'semi-annual':
        expiryDate.setMonth(joinDate.getMonth() + 6);
        break;
      case 'quarterly':
        expiryDate.setMonth(joinDate.getMonth() + 3);
        break;
    }

    const [customer] = await db
      .insert(customers)
      .values({
        ...customerData,
        expiryDate: expiryDate.toISOString().split('T')[0],
      })
      .returning();

    // Log activity
    await this.createActivity({
      type: 'customer_added',
      description: `تم إضافة عميل جديد: ${customer.name}`,
      relatedId: customer.id,
    });

    return customer;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const [customer] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  async getExpiringCustomers(days: number): Promise<Customer[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    return await db
      .select()
      .from(customers)
      .where(
        sql`${customers.expiryDate} <= ${targetDate.toISOString().split('T')[0]} AND ${customers.isActive} = true`
      );
  }

  // Income operations
  async getIncomeEntries(startDate?: Date, endDate?: Date): Promise<IncomeEntry[]> {
    let query = db.select().from(incomeEntries).orderBy(desc(incomeEntries.createdAt));

    if (startDate && endDate) {
      query = query.where(
        sql`${incomeEntries.createdAt} >= ${startDate} AND ${incomeEntries.createdAt} <= ${endDate}`
      );
    }

    return await query;
  }

  async createIncomeEntry(entryData: InsertIncomeEntry): Promise<IncomeEntry> {
    const [entry] = await db
      .insert(incomeEntries)
      .values(entryData)
      .returning();

    // Log activity
    await this.createActivity({
      type: 'income_added',
      description: `تم تسجيل دخل بقيمة ${entryData.amount} د.ع`,
      relatedId: entry.id,
    });

    return entry;
  }

  async getPrintIncomeEntries(): Promise<IncomeEntry[]> {
    return await db
      .select()
      .from(incomeEntries)
      .where(eq(incomeEntries.type, 'prints'))
      .orderBy(desc(incomeEntries.createdAt));
  }

  // Expense operations
  async getExpenseEntries(startDate?: Date, endDate?: Date): Promise<ExpenseEntry[]> {
    let query = db.select().from(expenseEntries).orderBy(desc(expenseEntries.createdAt));

    if (startDate && endDate) {
      query = query.where(
        sql`${expenseEntries.createdAt} >= ${startDate} AND ${expenseEntries.createdAt} <= ${endDate}`
      );
    }

    return await query;
  }

  async createExpenseEntry(entryData: InsertExpenseEntry): Promise<ExpenseEntry> {
    const [entry] = await db
      .insert(expenseEntries)
      .values(entryData)
      .returning();

    // Log activity
    await this.createActivity({
      type: 'expense_added',
      description: `تم تسجيل مصروف بقيمة ${entryData.amount} د.ع - ${entryData.reason}`,
      relatedId: entry.id,
    });

    return entry;
  }

  

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return await db
      .select()
      .from(employees)
      .where(eq(employees.isActive, true))
      .orderBy(desc(employees.createdAt));
  }

  async createEmployee(employeeData: InsertEmployee): Promise<Employee> {
    const [employee] = await db
      .insert(employees)
      .values(employeeData)
      .returning();

    // Log activity
    await this.createActivity({
      type: 'employee_added',
      description: `تم إضافة موظف جديد: ${employee.name}`,
      relatedId: employee.id,
    });

    return employee;
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    const [employee] = await db
      .update(employees)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employees.id, id))
      .returning();
    return employee;
  }

  async deleteEmployee(id: string): Promise<void> {
    await db
      .update(employees)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(employees.id, id));
  }

  // Activity operations
  async getRecentActivities(limit = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(activityData)
      .returning();
    return activity;
  }

  // Dashboard statistics
  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total customers
    const [{ count: totalCustomers }] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(customers)
      .where(eq(customers.isActive, true));

    // Monthly income
    const monthlyIncomeResult = await db
      .select({ total: sql<number>`cast(coalesce(sum(cast(amount as decimal)), 0) as decimal)` })
      .from(incomeEntries)
      .where(sql`${incomeEntries.createdAt} >= ${startOfMonth} AND ${incomeEntries.createdAt} <= ${endOfMonth}`);
    const monthlyIncome = Number(monthlyIncomeResult[0]?.total || 0);

    // Expired subscriptions
    const today = new Date().toISOString().split('T')[0];
    const [{ count: expiredSubscriptions }] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(customers)
      .where(sql`${customers.expiryDate} < ${today} AND ${customers.isActive} = true`);

    // Current inventory (total income - total expenses)
    const totalIncomeResult = await db
      .select({ total: sql<number>`cast(coalesce(sum(cast(amount as decimal)), 0) as decimal)` })
      .from(incomeEntries);
    const totalIncome = Number(totalIncomeResult[0]?.total || 0);

    const totalExpensesResult = await db
      .select({ total: sql<number>`cast(coalesce(sum(cast(amount as decimal)), 0) as decimal)` })
      .from(expenseEntries);
    const totalExpenses = Number(totalExpensesResult[0]?.total || 0);

    const currentInventory = totalIncome - totalExpenses;

    // Total salaries
    const totalSalariesResult = await db
      .select({ total: sql<number>`cast(coalesce(sum(cast(salary as decimal)), 0) as decimal)` })
      .from(employees)
      .where(eq(employees.isActive, true));
    const totalSalaries = Number(totalSalariesResult[0]?.total || 0);

    // Financial status
    let financialStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (currentInventory < totalSalaries) {
      financialStatus = 'critical';
    } else if (currentInventory < totalSalaries * 1.5) {
      financialStatus = 'warning';
    }

    return {
      totalCustomers,
      monthlyIncome,
      expiredSubscriptions,
      currentInventory,
      totalSalaries,
      financialStatus,
    };
  }

  async updateUserProfile(userId: string, updates: any): Promise<void> {
    // For Replit auth users, we'll store additional profile info in a separate table
    // For now, we'll just log the update since Replit auth handles the main user data
    console.log(`Updating profile for user ${userId}:`, updates);

    // In a real implementation, you would update the user data in your database
    // For this demo, we'll just acknowledge the update
    return Promise.resolve();
  }
}

export const storage = new DatabaseStorage();