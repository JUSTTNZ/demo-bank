import supabase from '@/utils/supabaseClient';

export const getAdminForUser = async (userId: string) => {
  const { data: chat, error } = await supabase
    .from('chats')
    .select('admin_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !chat) throw new Error('Chat or admin not found');

  const { data: admin, error: adminError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, email')
    .eq('id', chat.admin_id)
    .single();

  if (adminError || !admin) throw new Error('Admin profile not found');

  return admin;
};
