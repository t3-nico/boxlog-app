// デバッグ用: ブラウザのコンソールで実行してテスト
const testEvent = {
  title: "テストイベント",
  description: "デバッグ用のテストイベントです",
  start_date: "2025-01-24",
  start_time: "10:00:00",
  end_date: "2025-01-24", 
  end_time: "11:00:00",
  is_all_day: false,
  event_type: "event",
  status: "confirmed",
  color: "#3b82f6"
};

fetch('/api/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testEvent)
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('Error:', error);
});