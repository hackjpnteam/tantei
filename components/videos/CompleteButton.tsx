'use client';

import { useState, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface CompleteButtonProps {
  videoId: string;
  defaultCompleted?: boolean;
  onComplete?: (newCompletionCount?: number) => void;
}

export default function CompleteButton({ videoId, defaultCompleted = false, onComplete }: CompleteButtonProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if video is already completed
  useEffect(() => {
    const checkCompletionStatus = async () => {
      try {
        const response = await fetch('/api/completed-videos', {
          credentials: 'include'
        });

        if (response.ok) {
          setIsAuthenticated(true);
          const data = await response.json();
          const isVideoCompleted = data.videos?.some((v: any) => {
            const vId = v.id || v._id;
            return vId === videoId;
          });
          setIsCompleted(isVideoCompleted);
        } else if (response.status === 401) {
          // Not authenticated, check localStorage
          setIsAuthenticated(false);
          const localProgress = JSON.parse(localStorage.getItem('videoProgress') || '{}');
          if (localProgress[videoId]?.status === 'completed') {
            setIsCompleted(true);
          }
        }
      } catch (error) {
        console.error('Error checking completion status:', error);
        // Fallback to localStorage
        const localProgress = JSON.parse(localStorage.getItem('videoProgress') || '{}');
        if (localProgress[videoId]?.status === 'completed') {
          setIsCompleted(true);
        }
      }
    };

    checkCompletionStatus();
  }, [videoId]);

  const handleComplete = async () => {
    if (isCompleted || isLoading) return;

    setIsLoading(true);
    
    try {
      
      // Update UI immediately
      setIsCompleted(true);
      toast.success('視聴完了を記録しました！');

      // Update video completion count
      try {
        const completeResponse = await fetch(`/api/videos/${videoId}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (completeResponse.ok) {
          const completeData = await completeResponse.json();
          onComplete?.(completeData.completions);
        } else {
          onComplete?.();
        }
      } catch (completeError) {
        console.error('Error updating video completion count:', completeError);
        onComplete?.();
      }

      // Save completion to database or localStorage
      if (isAuthenticated) {
        try {
          // Save to completed videos API
          await fetch('/api/completed-videos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ videoId }),
          });

          // Save to progress API
          await fetch('/api/progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ videoId, status: 'completed' }),
          });
        } catch (error) {
          console.error('Error saving to server:', error);
        }
      } else {
        // Store in localStorage for non-logged users
        const localProgress = JSON.parse(localStorage.getItem('videoProgress') || '{}');
        localProgress[videoId] = { status: 'completed', completedAt: new Date().toISOString() };
        localStorage.setItem('videoProgress', JSON.stringify(localProgress));
      }
    } catch (error) {
      console.error('Error marking video as completed:', error);
      setIsCompleted(false); // Revert on error
      toast.error('完了の記録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleComplete}
      disabled={isCompleted || isLoading}
      className={`
        flex items-center gap-3 text-lg transition-all duration-300
        ${
          isCompleted
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white cursor-not-allowed rounded-2xl px-6 py-3 font-semibold shadow-lg'
            : 'btn-primary'
        }
      `}
      style={{ position: 'relative', zIndex: 1 }}
    >
      {isCompleted ? (
        <>
          <FaCheckCircle className="text-xl" />
          <span>視聴完了</span>
        </>
      ) : (
        <span>{isLoading ? '記録中...' : '視聴完了として記録'}</span>
      )}
    </button>
  );
}