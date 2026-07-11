import { useWriteStore } from '../store/useWriteStore';

describe('useWriteStore', () => {

  beforeEach(() => {
    useWriteStore.getState().resetAll();
  });

  test('recordPractice: 新規レコードが正しく作成される', () => {
    const { recordPractice, getRecord } = useWriteStore.getState();
    recordPractice('test001', '小', 85);
    const record = getRecord('test001');
    expect(record).not.toBeNull();
    expect(record?.practiceCount).toBe(1);
    expect(record?.lastAccuracy).toBe(85);
    expect(record?.hanzi).toBe('小');
  });

  test('recordPractice: 2回目でpracticeCountが2になる', () => {
    const { recordPractice, getRecord } = useWriteStore.getState();
    recordPractice('test001', '小', 85);
    recordPractice('test001', '小', 90);
    const record = getRecord('test001');
    expect(record?.practiceCount).toBe(2);
    expect(record?.lastAccuracy).toBe(90);
  });

  test('getTodayCount: recordPractice後に1以上を返す', () => {
    const { recordPractice, getTodayCount } = useWriteStore.getState();
    recordPractice('test001', '小', 85);
    recordPractice('test002', '好', 70);
    expect(getTodayCount()).toBeGreaterThanOrEqual(1);
  });

  test('resetAll: 実行後にgetRecordがnullを返す', () => {
    const { recordPractice, resetAll, getRecord } = useWriteStore.getState();
    recordPractice('test001', '小', 85);
    resetAll();
    expect(getRecord('test001')).toBeNull();
  });

  test('getRecord: 存在しないIDはnullを返す', () => {
    const { getRecord } = useWriteStore.getState();
    expect(getRecord('nonexistent')).toBeNull();
  });

});
