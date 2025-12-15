import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { connectDB } from './db';
import User from '@/models/User';

// Simple password hashing (in production, use bcrypt)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate session token
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Mock user storage (in production, use database)
interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: Date;
  profile?: {
    company?: string;
    position?: string;
    companyUrl?: string;
    bio?: string;
    avatarUrl?: string;
  };
}

// File path for persistent storage
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load data from files
function loadUsers(): Map<string, User> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      const users = new Map<string, User>();
      Object.entries(data).forEach(([id, user]: [string, any]) => {
        users.set(id, {
          ...user,
          createdAt: new Date(user.createdAt)
        });
      });
      return users;
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return new Map<string, User>();
}

function loadSessions(): Map<string, string> {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
      return new Map<string, string>(Object.entries(data));
    }
  } catch (error) {
    console.error('Error loading sessions:', error);
  }
  return new Map<string, string>();
}

// Save data to files
function saveUsers(users: Map<string, User>) {
  try {
    const data = Object.fromEntries(users);
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Users saved to file successfully', USERS_FILE);
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

function saveSessions(sessions: Map<string, string>) {
  try {
    const data = Object.fromEntries(sessions);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving sessions:', error);
  }
}

// In-memory storage for demo with file persistence
// Using global to persist across hot reloads in development
const globalForAuth = global as unknown as {
  users: Map<string, User>;
  sessions: Map<string, string>;
};

// Always reload from file to ensure data consistency
const users = loadUsers();
const sessions = loadSessions();

// Update global references
globalForAuth.users = users;
globalForAuth.sessions = sessions;

export function createUser(email: string, name: string, password: string, role: 'user' | 'admin' | 'superadmin' = 'user'): User | null {
  if (getUserByEmailSync(email)) {
    return null; // User already exists
  }

  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    passwordHash: hashPassword(password),
    role,
    createdAt: new Date()
  };

  users.set(user.id, user);
  saveUsers(users);
  return user;
}

export async function createUserAsync(email: string, name: string, password: string, role: 'user' | 'admin' | 'superadmin' = 'user'): Promise<User | null> {
  // Check if user already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return null; // User already exists
  }

  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    passwordHash: hashPassword(password),
    role,
    createdAt: new Date()
  };

  // Try MongoDB first (production)
  try {
    await connectDB();
    const UserModel = (await import('@/models/User')).default;
    const mongoUser = new UserModel(user);
    await mongoUser.save();
    console.log('✅ User saved to MongoDB');
    
    return {
      id: (mongoUser as any)._id.toString(),
      email: mongoUser.email,
      name: mongoUser.name,
      passwordHash: mongoUser.passwordHash,
      role: mongoUser.roles?.includes('superadmin') ? 'superadmin' :
            mongoUser.roles?.includes('admin') ? 'admin' : 'user',
      createdAt: mongoUser.createdAt || new Date(),
      profile: mongoUser.profile
    };
  } catch (error) {
    console.log('📂 MongoDB save failed');
    if (process.env.NODE_ENV === 'development') {
      console.log('📂 Falling back to file system in development');
      // Fallback to file system (development only)
      users.set(user.id, user);
      saveUsers(users);
      return user;
    } else {
      // In production, don't fall back to file system
      throw error;
    }
  }

  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  // Try MongoDB first (production)
  try {
    await connectDB();
    const mongoUser = await User.findOne({ email }).lean();
    
    if (mongoUser) {
      return {
        id: mongoUser._id.toString(),
        email: mongoUser.email,
        name: mongoUser.name,
        passwordHash: mongoUser.passwordHash,
        role: mongoUser.roles?.includes('superadmin') ? 'superadmin' :
              mongoUser.roles?.includes('admin') ? 'admin' : 'user',
        createdAt: mongoUser.createdAt || new Date(),
        profile: mongoUser.profile
      };
    }
  } catch (error) {
    console.log('📂 MongoDB getUserByEmail failed, falling back to file system');
  }

  // Fallback to file system (development)
  for (const user of Array.from(users.values())) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

// Synchronous version for backward compatibility
export function getUserByEmailSync(email: string): User | null {
  for (const user of Array.from(users.values())) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

export function getUserById(id: string): User | null {
  return users.get(id) || null;
}

export function createSession(userId: string): string {
  const token = generateToken();
  sessions.set(token, userId);
  
  // Only save to file system in development
  if (process.env.NODE_ENV === 'development') {
    saveSessions(sessions);
  }
  
  return token;
}

export async function getUserFromSession(token: string): Promise<User | null> {
  const userId = sessions.get(token);
  if (!userId) return null;
  
  // Try MongoDB first
  try {
    await connectDB();
    const mongoUser = await User.findById(userId).lean();
    
    if (mongoUser) {
      const user: User = {
        id: mongoUser._id.toString(),
        email: mongoUser.email,
        name: mongoUser.name,
        passwordHash: mongoUser.passwordHash,
        role: (mongoUser.roles?.includes('superadmin') ? 'superadmin' :
              mongoUser.roles?.includes('admin') ? 'admin' : 'user') as 'user' | 'admin' | 'superadmin',
        createdAt: mongoUser.createdAt || new Date(),
        profile: mongoUser.profile
      };
      console.log('🔍 getUserFromSession - returning MongoDB user profile:', user.profile);
      return user;
    }
  } catch (error) {
    console.log('📂 MongoDB getUserFromSession failed, falling back to file system');
  }
  
  // Fallback to file system
  const user = getUserById(userId);
  if (user) {
    console.log('🔍 getUserFromSession - returning file system user profile:', user.profile);
  }
  return user;
}

// Synchronous version for backward compatibility  
export function getUserFromSessionSync(token: string): User | null {
  const userId = sessions.get(token);
  if (!userId) return null;
  
  const user = getUserById(userId);
  if (user) {
    console.log('🔍 getUserFromSessionSync - returning user profile:', user.profile);
  }
  return user;
}

export function deleteSession(token: string): void {
  sessions.delete(token);
  
  // Only save to file system in development
  if (process.env.NODE_ENV === 'development') {
    saveSessions(sessions);
  }
}

export async function updateUserProfile(userId: string, profileData: {
  name?: string;
  company?: string;
  position?: string;
  companyUrl?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<User | null> {
  console.log('🔍 updateUserProfile called for userId:', userId);
  console.log('🔍 Profile data to update:', profileData);
  
  // Try MongoDB first (production)
  try {
    await connectDB();
    const updateData: any = {};
    
    // Update name if provided
    if (profileData.name !== undefined) {
      updateData.name = profileData.name;
    }
    
    // Update profile fields
    if (profileData.company !== undefined) {
      updateData['profile.company'] = profileData.company;
    }
    if (profileData.position !== undefined) {
      updateData['profile.position'] = profileData.position;
    }
    if (profileData.companyUrl !== undefined) {
      updateData['profile.companyUrl'] = profileData.companyUrl;
    }
    if (profileData.bio !== undefined) {
      updateData['profile.bio'] = profileData.bio;
    }
    if (profileData.avatarUrl !== undefined && profileData.avatarUrl !== '') {
      updateData['profile.avatarUrl'] = profileData.avatarUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, lean: true }
    );
    
    if (updatedUser) {
      console.log('✅ User profile updated in MongoDB');
      return {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        passwordHash: updatedUser.passwordHash,
        role: (updatedUser.roles?.includes('superadmin') ? 'superadmin' :
              updatedUser.roles?.includes('admin') ? 'admin' : 'user') as 'user' | 'admin' | 'superadmin',
        createdAt: updatedUser.createdAt || new Date(),
        profile: updatedUser.profile
      };
    }
  } catch (error) {
    console.log('📂 MongoDB updateUserProfile failed, trying file system fallback');
  }

  // Fallback to file system (development only)
  if (process.env.NODE_ENV !== 'development') {
    console.error('❌ User profile update failed in production');
    return null;
  }

  const user = getUserById(userId);
  if (!user) {
    console.error('❌ User not found:', userId);
    return null;
  }

  console.log('✅ User found:', user.email);
  console.log('🔍 Current user profile:', user.profile);

  // Update name if provided
  if (profileData.name !== undefined) {
    user.name = profileData.name;
    console.log('📝 Updated name to:', user.name);
  }

  // Initialize profile if it doesn't exist
  if (!user.profile) {
    user.profile = {};
    console.log('🆕 Created new profile object');
  }

  // Update profile fields
  if (profileData.company !== undefined) {
    user.profile.company = profileData.company;
    console.log('📝 Updated company to:', user.profile.company);
  }
  if (profileData.position !== undefined) {
    user.profile.position = profileData.position;
    console.log('📝 Updated position to:', user.profile.position);
  }
  if (profileData.companyUrl !== undefined) {
    user.profile.companyUrl = profileData.companyUrl;
    console.log('📝 Updated companyUrl to:', user.profile.companyUrl);
  }
  if (profileData.bio !== undefined) {
    user.profile.bio = profileData.bio;
    console.log('📝 Updated bio to:', user.profile.bio);
  }
  if (profileData.avatarUrl !== undefined && profileData.avatarUrl !== '') {
    user.profile.avatarUrl = profileData.avatarUrl;
    console.log('📝 Updated avatarUrl to:', user.profile.avatarUrl);
  } else if (profileData.avatarUrl === '') {
    console.log('⚠️ Skipping empty avatarUrl to preserve existing value');
  }

  console.log('💾 Final user profile before saving:', user.profile);

  // Update in storage (development only)
  if (process.env.NODE_ENV === 'development') {
    users.set(userId, user);
    saveUsers(users);
    
    // Verify the data was saved correctly by re-reading from file
    const verificationUsers = loadUsers();
    const verifiedUser = verificationUsers.get(userId);
    if (verifiedUser) {
      console.log('🔍 Verification: Data saved successfully to file');
      console.log('🔍 Verified profile from file:', verifiedUser.profile);
    } else {
      console.error('❌ Verification failed: User not found in saved file');
    }
  }
  
  console.log('✅ User profile updated successfully');
  return user;
}

// Initialize with demo users
function initDemoUsers() {
  if (users.size === 0) {
    createUser('demo@example.com', 'デモユーザー', 'password123');
    createUser('admin@example.com', '管理者', 'admin123', 'admin');
    createUser('tomura@hackjpn.com', '管理者 Tomura', 'admin123', 'admin');
    console.log('Demo users initialized');
  }
}

// Initialize demo users
initDemoUsers();