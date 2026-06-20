import { useEffect } from 'react';
import { router } from 'expo-router';
import { useTestStore } from '../../store/useTestStore';

// 再テスト画面は useTestStore に問題がセットされている前提で
// そのまま /test にリダイレクトする
export default function RetestScreen() {
  const { questions } = useTestStore();

  useEffect(() => {
    if (questions.length > 0) {
      router.replace('/test');
    } else {
      router.replace('/review');
    }
  }, [questions.length]);

  return null;
}
