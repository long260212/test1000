function includesAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

export function getClientFallbackReply(question: string): string {
  const text = question.toLowerCase();

  if (includesAny(text, ['chuyển động đều', 'chuyen dong deu', 'không đều', 'khong deu'])) {
    return `**Chuyển động đều** có vận tốc không đổi: trong các khoảng thời gian bằng nhau, vật đi được các quãng đường bằng nhau. Công thức: **v = s/t**.\n\n**Chuyển động không đều** có vận tốc thay đổi. Vận tốc trung bình của cả hành trình: **v_tb = s_tổng/t_tổng**.`;
  }
  if (includesAny(text, ['ác-si-mét', 'ac-si-met', 'lực đẩy', 'luc day'])) {
    return `Lực đẩy Ác-si-mét xuất hiện khi vật được nhúng một phần hoặc toàn bộ trong chất lỏng hay chất khí. Lực hướng từ dưới lên. Công thức: **F_A = d.V**, với d là trọng lượng riêng của chất lỏng và V là thể tích phần vật chìm.`;
  }
  if (includesAny(text, ['áp suất', 'ap suat'])) {
    return `Áp suất chất rắn: **p = F/S**. Áp suất chất lỏng: **p = d.h**. Khi độ sâu h tăng thì áp suất chất lỏng tăng.`;
  }
  if (includesAny(text, ['công suất', 'cong suat'])) {
    return `Công suất cho biết tốc độ thực hiện công. Công thức: **P = A/t**; đơn vị là watt (W).`;
  }
  if (includesAny(text, ['nhiệt lượng', 'nhiet luong', 'cân bằng nhiệt', 'can bang nhiet'])) {
    return `Nhiệt lượng vật thu vào: **Q = m.c.Δt**. Khi bỏ qua thất thoát nhiệt: **Q_tỏa = Q_thu**.`;
  }

  return `Em hãy giải theo 4 bước: **xác định dữ kiện → chọn công thức → đổi đơn vị → thay số và kiểm tra kết quả**. Các công thức trọng tâm gồm **v = s/t**, **p = F/S**, **p = d.h**, **F_A = d.V**, **A = F.s**, **P = A/t**, **Q = m.c.Δt**.`;
}
