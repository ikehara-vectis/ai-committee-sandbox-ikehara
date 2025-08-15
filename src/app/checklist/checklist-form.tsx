'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChecklistItem } from '@prisma/client';

interface ChecklistFormProps {
  item: ChecklistItem;
  userId: string;
}

export default function ChecklistForm({ item, userId }: ChecklistFormProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchChecklistResult = useCallback(async () => {
    try {
      const response = await fetch(`/api/checklist/${item.id}?userId=${userId}`);
      if (response.ok) {
        const result = await response.json();
        setIsChecked(result.isChecked || false);
        setNotes(result.notes || '');
      }
    } catch (error) {
      console.error('Failed to fetch checklist result:', error);
    }
  }, [item.id, userId]);

  useEffect(() => {
    if (userId) {
      // 既存のチェック状態を取得
      fetchChecklistResult();
    }
  }, [userId, fetchChecklistResult]);

  const handleCheckChange = async (checked: boolean) => {
    if (!userId) return;

    setIsLoading(true);
    setIsChecked(checked);

    try {
      const response = await fetch('/api/checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          itemId: item.id,
          isChecked: checked,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save checklist result');
      }
    } catch (error) {
      console.error('Error saving checklist result:', error);
      // エラー時は元の状態に戻す
      setIsChecked(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotesChange = async (newNotes: string) => {
    if (!userId) return;

    setNotes(newNotes);

    // debounce処理で自動保存
    const timeoutId = setTimeout(async () => {
      try {
        await fetch('/api/checklist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            itemId: item.id,
            isChecked,
            notes: newNotes,
          }),
        });
      } catch (error) {
        console.error('Error saving notes:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => handleCheckChange(e.target.checked)}
          disabled={isLoading || !userId}
          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className={`text-sm ${isChecked ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
          {isChecked ? '✓ できている' : '未達成'}
        </span>
        {isLoading && (
          <span className="text-xs text-gray-400">保存中...</span>
        )}
      </div>
      
      {isChecked && (
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="具体的な実践例や気づきをメモ..."
          className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          disabled={!userId}
        />
      )}
    </div>
  );
}