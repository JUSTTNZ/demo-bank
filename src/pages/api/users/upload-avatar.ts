// pages/api/users/upload-avatar.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Disable default body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!userId || !file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Read file content
    const fileContent = fs.readFileSync(file.filepath);
    
    // Generate unique filename
    const fileExtension = path.extname(file.originalFilename || '');
    const fileName = `${userId}-${Date.now()}${fileExtension}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, fileContent, {
        contentType: file.mimetype || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    res.status(200).json({ 
      message: 'Avatar updated successfully',
      avatar_url: publicUrl 
    });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}