import { auth } from '@/auth';
import connectToMongoDB from '@/lib/mongodb';
import User from '@/models/User';

// Get current user from session with MongoDB lookup
export async function getCurrentUser() {
  try {
    const session = await auth();
    
    if (session?.user?.email) {
      await connectToMongoDB();
      
      // Find user by email in MongoDB
      const user = await User.findOne({ 
        email: session.user.email.toLowerCase() 
      });
      
      if (user) {
        console.log('Found user in MongoDB:', (user as any)._id.toString());
        return {
          id: (user as any)._id.toString(),
          name: user.name,
          email: user.email,
          role: user.roles?.includes('superadmin') ? 'superadmin' :
                user.roles?.includes('admin') ? 'admin' : 'user',
          createdAt: user.createdAt,
          profile: user.profile || {}
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user from MongoDB:', error);
    return null;
  }
}

// Get user by ID from MongoDB
export async function getUserById(userId: string) {
  try {
    await connectToMongoDB();
    const user = await User.findById(userId);
    
    if (user) {
      return {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        role: user.roles?.includes('superadmin') ? 'superadmin' :
              user.roles?.includes('admin') ? 'admin' : 'user',
        createdAt: user.createdAt,
        profile: user.profile || {}
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user by ID from MongoDB:', error);
    return null;
  }
}

// Update user profile in MongoDB
export async function updateUserProfile(userId: string, profileData: any) {
  try {
    await connectToMongoDB();
    
    const updateData: any = {};
    
    if (profileData.name) updateData.name = profileData.name;
    if (profileData.company !== undefined) updateData['profile.company'] = profileData.company;
    if (profileData.position !== undefined) updateData['profile.position'] = profileData.position;
    if (profileData.companyUrl !== undefined) updateData['profile.companyUrl'] = profileData.companyUrl;
    if (profileData.bio !== undefined) updateData['profile.bio'] = profileData.bio;
    if (profileData.avatarUrl !== undefined) updateData['profile.avatarUrl'] = profileData.avatarUrl;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (user) {
      console.log('✅ Profile updated in MongoDB for user:', userId);
      return {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        role: user.roles?.includes('superadmin') ? 'superadmin' :
              user.roles?.includes('admin') ? 'admin' : 'user',
        createdAt: user.createdAt,
        profile: user.profile || {}
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error updating user profile in MongoDB:', error);
    return null;
  }
}

// Get all users from MongoDB (excluding sensitive data)
export async function getAllUsers() {
  try {
    await connectToMongoDB();
    
    const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 });
    
    return users.map(user => ({
      id: (user as any)._id.toString(),
      name: user.name,
      email: user.email,
      role: user.roles?.includes('superadmin') ? 'superadmin' :
            user.roles?.includes('admin') ? 'admin' : 'user',
      createdAt: user.createdAt,
      profile: user.profile || {}
    }));
  } catch (error) {
    console.error('Error getting all users from MongoDB:', error);
    return [];
  }
}