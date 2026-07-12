export interface PhysicsQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  points: number;
}

const QUESTION_BANK: Omit<PhysicsQuestion, 'id'>[] = [
  {
    questionText: 'Chuyển động đều là chuyển động có đặc điểm nào?',
    options: ['Vận tốc không đổi theo thời gian', 'Quãng đường luôn bằng 0', 'Vận tốc luôn tăng', 'Hướng chuyển động luôn đổi'],
    correctAnswerIndex: 0,
    explanation: 'Trong chuyển động đều, vật đi được những quãng đường bằng nhau trong những khoảng thời gian bằng nhau nên độ lớn vận tốc không đổi.',
    points: 2,
  },
  {
    questionText: 'Công thức tính vận tốc trung bình của một chuyển động không đều là gì?',
    options: ['v = t/s', 'v = s.t', 'v_tb = s_tổng/t_tổng', 'v_tb = (v1 + v2)/2 trong mọi trường hợp'],
    correctAnswerIndex: 2,
    explanation: 'Vận tốc trung bình trên toàn hành trình bằng tổng quãng đường chia cho tổng thời gian chuyển động.',
    points: 2,
  },
  {
    questionText: 'Đơn vị hợp pháp của áp suất trong hệ SI là gì?',
    options: ['N', 'Pa', 'J', 'W'],
    correctAnswerIndex: 1,
    explanation: 'Pascal (Pa) là đơn vị áp suất; 1 Pa = 1 N/m².',
    points: 2,
  },
  {
    questionText: 'Áp suất chất lỏng tại một điểm được tính bằng công thức nào?',
    options: ['p = F/S', 'p = d.h', 'p = m/V', 'p = A/t'],
    correctAnswerIndex: 1,
    explanation: 'Ở độ sâu h trong chất lỏng có trọng lượng riêng d, áp suất do chất lỏng gây ra là p = d.h.',
    points: 2,
  },
  {
    questionText: 'Lực đẩy Ác-si-mét tác dụng lên vật nhúng trong chất lỏng có phương và chiều như thế nào?',
    options: ['Nằm ngang, từ trái sang phải', 'Thẳng đứng, từ trên xuống', 'Thẳng đứng, từ dưới lên', 'Cùng chiều chuyển động của vật'],
    correctAnswerIndex: 2,
    explanation: 'Lực đẩy Ác-si-mét có phương thẳng đứng và chiều từ dưới lên.',
    points: 2,
  },
  {
    questionText: 'Công thức tính lực đẩy Ác-si-mét là gì?',
    options: ['F_A = d.V', 'F_A = m.g.h', 'F_A = F/S', 'F_A = A/t'],
    correctAnswerIndex: 0,
    explanation: 'F_A = d.V, trong đó d là trọng lượng riêng của chất lỏng và V là thể tích phần chất lỏng bị vật chiếm chỗ.',
    points: 2,
  },
  {
    questionText: 'Khi nào có công cơ học?',
    options: ['Có lực tác dụng nhưng vật không dịch chuyển', 'Vật dịch chuyển mà không có lực tác dụng', 'Có lực tác dụng và vật dịch chuyển theo phương có thành phần của lực', 'Chỉ khi vật chuyển động thẳng đều'],
    correctAnswerIndex: 2,
    explanation: 'Có công cơ học khi lực tác dụng làm vật dịch chuyển và lực có thành phần theo hướng dịch chuyển.',
    points: 2,
  },
  {
    questionText: 'Công suất cho biết điều gì?',
    options: ['Khả năng sinh công của vật', 'Tốc độ thực hiện công', 'Khối lượng của vật', 'Độ lớn của áp suất'],
    correctAnswerIndex: 1,
    explanation: 'Công suất đặc trưng cho tốc độ thực hiện công và được tính bằng P = A/t.',
    points: 2,
  },
  {
    questionText: 'Nhiệt lượng vật thu vào để nóng lên được tính bằng công thức nào?',
    options: ['Q = m.c.Δt', 'Q = F.s', 'Q = p.V', 'Q = A/t'],
    correctAnswerIndex: 0,
    explanation: 'Q = m.c.Δt, với m là khối lượng, c là nhiệt dung riêng và Δt là độ tăng nhiệt độ.',
    points: 2,
  },
  {
    questionText: 'Trong quá trình trao đổi nhiệt của hai vật trong hệ cô lập, phương trình cân bằng nhiệt là gì?',
    options: ['Q_tỏa = Q_thu', 'Q_tỏa > Q_thu', 'Q_tỏa < Q_thu', 'Q_tỏa + Q_thu = 1'],
    correctAnswerIndex: 0,
    explanation: 'Khi bỏ qua thất thoát nhiệt ra môi trường, nhiệt lượng vật nóng tỏa ra bằng nhiệt lượng vật lạnh thu vào.',
    points: 2,
  },
];

export function getFallbackQuestions(count: number, topic = 'Vật lí 8'): PhysicsQuestion[] {
  const safeCount = Math.min(Math.max(Math.trunc(count) || 3, 1), 10);
  const offset = Math.abs([...topic].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % QUESTION_BANK.length;
  return Array.from({ length: safeCount }, (_, index) => {
    const item = QUESTION_BANK[(offset + index) % QUESTION_BANK.length];
    return {
      ...item,
      id: `local-q-${Date.now()}-${index}`,
    };
  });
}

function includesAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

export function getFallbackReply(question: string): string {
  const text = question.toLowerCase();

  if (includesAny(text, ['chuyển động đều', 'chuyen dong deu', 'không đều', 'khong deu'])) {
    return `**Chuyển động đều** là chuyển động có độ lớn vận tốc không đổi: trong các khoảng thời gian bằng nhau, vật đi được các quãng đường bằng nhau. Công thức: **v = s/t**.\n\n**Chuyển động không đều** là chuyển động có độ lớn vận tốc thay đổi theo thời gian. Khi xét cả hành trình, dùng **v_tb = s_tổng/t_tổng**; không được tự động lấy trung bình cộng các vận tốc.`;
  }

  if (includesAny(text, ['ác-si-mét', 'ac-si-met', 'lực đẩy', 'luc day'])) {
    return `Lực đẩy Ác-si-mét xuất hiện khi một vật được nhúng một phần hoặc toàn bộ trong chất lỏng hay chất khí. Lực có phương thẳng đứng, chiều từ dưới lên.\n\nCông thức: **F_A = d.V**\n- **d**: trọng lượng riêng của chất lỏng, đơn vị N/m³.\n- **V**: thể tích phần vật chìm, đơn vị m³.\n\nKhi vật nổi cân bằng trên mặt chất lỏng thì **F_A = P**.`;
  }

  if (includesAny(text, ['áp suất', 'ap suat'])) {
    return `**Áp suất chất rắn:** p = F/S, trong đó F là áp lực và S là diện tích bị ép.\n\n**Áp suất chất lỏng:** p = d.h, trong đó d là trọng lượng riêng của chất lỏng và h là độ sâu tính từ mặt thoáng. Áp suất chất lỏng tăng khi độ sâu tăng.`;
  }

  if (includesAny(text, ['công suất', 'cong suat'])) {
    return `Công suất cho biết tốc độ thực hiện công. Công thức: **P = A/t**, trong đó A là công thực hiện (J), t là thời gian (s), P có đơn vị watt (W).`;
  }

  if (includesAny(text, ['công cơ học', 'cong co hoc'])) {
    return `Có công cơ học khi lực tác dụng làm vật dịch chuyển và lực có thành phần theo hướng dịch chuyển. Khi lực cùng hướng chuyển động: **A = F.s**. Đơn vị công là joule (J).`;
  }

  if (includesAny(text, ['nhiệt lượng', 'nhiet luong', 'cân bằng nhiệt', 'can bang nhiet'])) {
    return `Nhiệt lượng vật thu vào để nóng lên: **Q = m.c.Δt**. Trong trao đổi nhiệt và bỏ qua thất thoát ra môi trường, dùng phương trình **Q_tỏa = Q_thu**.`;
  }

  if (includesAny(text, ['lộ trình', 'lo trinh', 'kế hoạch', 'ke hoach', 'roadmap'])) {
    return `## Lộ trình ôn Vật lí 8 trong 4 tuần\n\n1. **Tuần 1 – Chuyển động và lực:** học v = s/t, vận tốc trung bình, biểu diễn lực và quán tính.\n2. **Tuần 2 – Áp suất:** học p = F/S, p = d.h và bài toán đổi đơn vị diện tích.\n3. **Tuần 3 – Ác-si-mét và công:** học F_A = d.V, điều kiện nổi–chìm, A = F.s.\n4. **Tuần 4 – Công suất và nhiệt học:** học P = A/t, Q = m.c.Δt, Q_tỏa = Q_thu; sau đó làm đề tổng hợp.\n\nMỗi buổi nên gồm 15 phút lý thuyết, 30 phút bài tập và 10 phút tự kiểm tra lỗi sai.`;
  }

  return `Em có thể giải câu hỏi theo 4 bước: **xác định dữ kiện → chọn công thức → đổi đơn vị → thay số và kiểm tra đơn vị kết quả**.\n\nCác công thức trọng tâm Vật lí 8 gồm: **v = s/t**, **p = F/S**, **p = d.h**, **F_A = d.V**, **A = F.s**, **P = A/t**, **Q = m.c.Δt**. Hãy gửi nguyên văn bài toán hoặc nêu rõ phần em chưa hiểu để được hướng dẫn sát hơn.`;
}
