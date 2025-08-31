import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.ts";

// Initialize Supabase clients
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
);
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-f2f8e889/health", (c) => {
  return c.json({ status: "ok" });
});

// Time entries endpoints
app.post("/make-server-f2f8e889/time-entries", async (c) => {
  try {
    const body = await c.req.json();
    const { action, userId = "default" } = body;
    
    const today = new Date().toISOString().split('T')[0];
    const entryKey = `time_entry_${userId}_${today}`;
    
    if (action === "check_in") {
      const checkInTime = new Date().toISOString();
      const entry = {
        id: `${userId}_${today}`,
        userId,
        date: today,
        checkIn: checkInTime,
        status: "checked_in"
      };
      
      await kv.set(entryKey, entry);
      return c.json({ success: true, entry });
      
    } else if (action === "check_out") {
      const existingEntry = await kv.get(entryKey);
      if (!existingEntry) {
        return c.json({ success: false, error: "No check-in found for today" }, 400);
      }
      
      const checkOutTime = new Date().toISOString();
      const checkInDate = new Date(existingEntry.checkIn);
      const checkOutDate = new Date(checkOutTime);
      const totalHours = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
      
      const updatedEntry = {
        ...existingEntry,
        checkOut: checkOutTime,
        totalHours: Math.round(totalHours * 100) / 100,
        status: "completed"
      };
      
      await kv.set(entryKey, updatedEntry);
      return c.json({ success: true, entry: updatedEntry });
    }
    
    return c.json({ success: false, error: "Invalid action" }, 400);
  } catch (error) {
    console.error("Time entry error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get today's time entry
app.get("/make-server-f2f8e889/time-entries/today", async (c) => {
  try {
    const userId = c.req.query("userId") || "default";
    const today = new Date().toISOString().split('T')[0];
    const entryKey = `time_entry_${userId}_${today}`;
    
    const entry = await kv.get(entryKey);
    return c.json({ success: true, entry });
  } catch (error) {
    console.error("Get today entry error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get time entries history
app.get("/make-server-f2f8e889/time-entries/history", async (c) => {
  try {
    const userId = c.req.query("userId") || "default";
    const prefix = `time_entry_${userId}_`;
    
    const entries = await kv.getByPrefix(prefix);
    const sortedEntries = entries
      .filter(entry => entry && entry.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return c.json({ success: true, entries: sortedEntries });
  } catch (error) {
    console.error("Get history error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get analytics/statistics
app.get("/make-server-f2f8e889/analytics", async (c) => {
  try {
    const userId = c.req.query("userId") || "default";
    const prefix = `time_entry_${userId}_`;
    
    const entries = await kv.getByPrefix(prefix);
    const completedEntries = entries.filter(entry => entry && entry.totalHours);
    
    // Calculate weekly hours (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyEntries = completedEntries.filter(entry => 
      new Date(entry.date) >= weekAgo
    );
    const weeklyHours = weeklyEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    
    // Calculate monthly hours (last 30 days)
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthlyEntries = completedEntries.filter(entry => 
      new Date(entry.date) >= monthAgo
    );
    const monthlyHours = monthlyEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    
    // Generate daily stats for charts (last 7 days)
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEntry = completedEntries.find(entry => entry.date === dateStr);
      dailyStats.push({
        date: dateStr,
        hours: dayEntry?.totalHours || 0,
        day: date.toLocaleDateString('es-ES', { weekday: 'short' })
      });
    }
    
    return c.json({
      success: true,
      analytics: {
        weeklyHours: Math.round(weeklyHours * 100) / 100,
        monthlyHours: Math.round(monthlyHours * 100) / 100,
        dailyStats,
        totalEntries: completedEntries.length
      }
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Settings endpoints
app.get("/make-server-f2f8e889/settings", async (c) => {
  try {
    const userId = c.req.query("userId") || "default";
    const settingsKey = `settings_${userId}`;
    
    const settings = await kv.get(settingsKey);
    return c.json({ success: true, settings });
  } catch (error) {
    console.error("Settings get error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post("/make-server-f2f8e889/settings", async (c) => {
  try {
    const { settings, userId = "default" } = await c.req.json();
    const settingsKey = `settings_${userId}`;
    
    await kv.set(settingsKey, settings);
    return c.json({ success: true });
  } catch (error) {
    console.error("Settings save error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Profile endpoints
app.get("/make-server-f2f8e889/profile", async (c) => {
  try {
    const userId = c.req.query("userId") || "default";
    const profileKey = `profile_${userId}`;
    
    const profile = await kv.get(profileKey);
    return c.json({ success: true, profile });
  } catch (error) {
    console.error("Profile get error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post("/make-server-f2f8e889/profile", async (c) => {
  try {
    const { profile, userId = "default" } = await c.req.json();
    const profileKey = `profile_${userId}`;
    
    await kv.set(profileKey, profile);
    return c.json({ success: true });
  } catch (error) {
    console.error("Profile save error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.get("/make-server-f2f8e889/profile/stats", async (c) => {
  try {
    const userId = c.req.query("userId") || "default";
    const prefix = `time_entry_${userId}_`;
    
    const entries = await kv.getByPrefix(prefix);
    const completedEntries = entries.filter(entry => entry && entry.totalHours);
    
    const totalHours = completedEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const daysWorked = completedEntries.length;
    const averageDaily = daysWorked > 0 ? totalHours / daysWorked : 0;
    
    // Calculate punctuality score (example: percentage of days with check-in before 9:30 AM)
    const punctualDays = completedEntries.filter(entry => {
      if (!entry.checkIn) return false;
      const checkInTime = new Date(entry.checkIn);
      const nineThirty = new Date(checkInTime);
      nineThirty.setHours(9, 30, 0, 0);
      return checkInTime <= nineThirty;
    }).length;
    
    const punctualityScore = daysWorked > 0 ? Math.round((punctualDays / daysWorked) * 100) : 0;
    
    // Mock achievements for now
    const achievements = [];
    if (totalHours >= 40) {
      achievements.push({
        id: '1',
        title: 'Primera Semana',
        description: 'Completaste tu primera semana completa',
        earnedDate: new Date().toISOString(),
        icon: '🎯'
      });
    }
    if (daysWorked >= 30) {
      achievements.push({
        id: '2',
        title: 'Mes Productivo',
        description: 'Trabajaste 30 días o más',
        earnedDate: new Date().toISOString(),
        icon: '📅'
      });
    }
    
    return c.json({
      success: true,
      stats: {
        totalHours: Math.round(totalHours * 10) / 10,
        daysWorked,
        averageDaily: Math.round(averageDaily * 10) / 10,
        punctualityScore,
        achievements
      }
    });
  } catch (error) {
    console.error("Profile stats error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Calendar endpoints
app.get("/make-server-f2f8e889/time-entries/calendar", async (c) => {
  try {
    const userId = c.req.query("userId") || "default";
    const start = c.req.query("start");
    const end = c.req.query("end");
    
    const prefix = `time_entry_${userId}_`;
    const allEntries = await kv.getByPrefix(prefix);
    
    let filteredEntries = allEntries;
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      filteredEntries = allEntries.filter(entry => {
        if (!entry || !entry.date) return false;
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      });
    }
    
    // Transform entries for calendar view
    const calendarEntries = filteredEntries.map(entry => ({
      date: entry.date,
      checkIn: entry.checkIn,
      checkOut: entry.checkOut,
      totalHours: entry.totalHours,
      status: entry.status === 'completed' ? 'completed' : 
              entry.status === 'checked_in' ? 'incomplete' : 'absent'
    }));
    
    return c.json({ success: true, entries: calendarEntries });
  } catch (error) {
    console.error("Calendar entries error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Authentication endpoints
app.post("/make-server-f2f8e889/auth/register", async (c) => {
  try {
    const { email, password, firstName, lastName } = await c.req.json();
    
    // Create user with admin client
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        firstName, 
        lastName,
        name: `${firstName} ${lastName}`
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.error("Registration error:", error);
      return c.json({ 
        success: false, 
        error: error.message === 'User already registered' ? 
          'Ya existe una cuenta con este email' : 
          'Error al crear la cuenta' 
      }, 400);
    }
    
    if (data.user) {
      // Store additional profile information
      const profileKey = `profile_${data.user.id}`;
      const profile = {
        id: data.user.id,
        firstName,
        lastName,
        email,
        avatar: '',
        createdAt: new Date().toISOString()
      };
      await kv.set(profileKey, profile);
      
      return c.json({ 
        success: true, 
        user: data.user,
        message: 'Cuenta creada correctamente'
      });
    }
    
    return c.json({ success: false, error: 'Error al crear la cuenta' }, 500);
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.post("/make-server-f2f8e889/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Sign in with password
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Login error:", error);
      return c.json({ 
        success: false, 
        error: error.message === 'Invalid login credentials' ? 
          'Email o contraseña incorrectos' : 
          'Error al iniciar sesión' 
      }, 400);
    }
    
    if (data.session && data.user) {
      return c.json({ 
        success: true, 
        user: data.user,
        access_token: data.session.access_token,
        message: 'Sesión iniciada correctamente'
      });
    }
    
    return c.json({ success: false, error: 'Error al iniciar sesión' }, 500);
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ success: false, error: 'Error interno del servidor' }, 500);
  }
});

app.get("/make-server-f2f8e889/auth/verify", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Token no proporcionado' }, 401);
    }
    
    const { data: { user }, error } = await supabaseClient.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ success: false, error: 'Token inválido' }, 401);
    }
    
    return c.json({ 
      success: true, 
      user,
      message: 'Token válido'
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return c.json({ success: false, error: 'Error al verificar token' }, 500);
  }
});

app.post("/make-server-f2f8e889/auth/logout", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (accessToken) {
      await supabaseClient.auth.signOut();
    }
    
    return c.json({ 
      success: true, 
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json({ success: false, error: 'Error al cerrar sesión' }, 500);
  }
});

// Middleware to protect routes that require authentication
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ success: false, error: 'Token requerido' }, 401);
  }
  
  const { data: { user }, error } = await supabaseClient.auth.getUser(accessToken);
  
  if (error || !user) {
    return c.json({ success: false, error: 'Token inválido' }, 401);
  }
  
  // Add user to context
  c.set('user', user);
  await next();
};

Deno.serve(app.fetch);