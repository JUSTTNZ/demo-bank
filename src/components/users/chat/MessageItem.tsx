
import { Message } from '@/types/userTypes';
export function MessageItem({ 
  message, 
  userId 
}: { 
  message: Message; 
  userId: string 
}) {
  const isCurrentUser = message.sender_id === userId;
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-xs md:max-w-md lg:max-w-lg ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
        {!isCurrentUser && (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 overflow-hidden mr-2">
            <img 
              src={message.profiles?.avatar_url || ''} 
              alt={message.profiles?.full_name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        
        <div className={`px-4 py-2 rounded-lg ${
          isCurrentUser 
            ? 'bg-blue-600 text-white rounded-tr-none' 
            : 'bg-gray-200 text-gray-800 rounded-tl-none'
        }`}>
          {!isCurrentUser && (
            <div className="font-semibold text-sm">
              {message.profiles?.full_name}
            </div>
          )}
          <div className="text-sm">{message.text}</div>
          <div className={`text-xs mt-1 ${
            isCurrentUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {new Date(message.sent_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
}