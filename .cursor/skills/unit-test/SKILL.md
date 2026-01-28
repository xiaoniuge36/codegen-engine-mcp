---
name: unit-test
description: 单元测试技能。当用户需要编写单元测试、创建测试用例、使用测试框架、或询问如何进行前端测试时使用此skill。
---

# Unit Test Skill

单元测试编写指导，帮助 AI 完成测试用例设计、Mock 数据创建、断言编写、覆盖率分析等任务。

## 核心能力

| 能力 | 说明 |
|------|------|
| 📝 用例设计 | 根据代码逻辑设计测试用例 |
| 🎭 Mock 处理 | 模拟 API、模块、组件 |
| ✅ 断言编写 | expect 断言和匹配器 |
| 🧩 组件测试 | React/Vue 组件测试 |
| 📊 覆盖率 | 测试覆盖率分析 |

---

## 测试文件组织

### 目录结构

```
src/
├── components/
│   └── Button/
│       ├── index.tsx
│       ├── index.test.tsx      # 组件测试
│       └── Button.stories.tsx  # Storybook（可选）
├── hooks/
│   └── useCounter/
│       ├── index.ts
│       └── index.test.ts       # Hooks 测试
├── utils/
│   └── format/
│       ├── index.ts
│       └── index.test.ts       # 工具函数测试
└── __mocks__/                  # 全局 mock
    └── axios.ts
```

### 命名规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 测试文件 | `*.test.ts(x)` | `Button.test.tsx` |
| 测试套件 | describe('组件/函数名') | `describe('Button')` |
| 测试用例 | it('should 描述行为') | `it('should render')` |
| Mock 文件 | `__mocks__/模块名.ts` | `__mocks__/axios.ts` |

---

## 工具函数测试

### 基础测试模板

```typescript
// utils/format.ts
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN');
}
```

```typescript
// utils/format.test.ts
import { formatPrice, formatDate } from './format';

describe('formatPrice', () => {
  it('should format integer price', () => {
    expect(formatPrice(100)).toBe('¥100.00');
  });

  it('should format decimal price', () => {
    expect(formatPrice(99.9)).toBe('¥99.90');
  });

  it('should handle zero', () => {
    expect(formatPrice(0)).toBe('¥0.00');
  });

  it('should handle negative price', () => {
    expect(formatPrice(-50)).toBe('¥-50.00');
  });
});

describe('formatDate', () => {
  it('should format Date object', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('2024/1/15');
  });

  it('should format date string', () => {
    expect(formatDate('2024-01-15')).toBe('2024/1/15');
  });
});
```

### 边界条件测试

```typescript
// 测试边界条件的模板
describe('边界条件测试', () => {
  describe('空值处理', () => {
    it('should handle null', () => {});
    it('should handle undefined', () => {});
    it('should handle empty string', () => {});
    it('should handle empty array', () => {});
    it('should handle empty object', () => {});
  });

  describe('极值处理', () => {
    it('should handle zero', () => {});
    it('should handle negative', () => {});
    it('should handle very large number', () => {});
    it('should handle max/min values', () => {});
  });

  describe('类型边界', () => {
    it('should handle type coercion', () => {});
    it('should handle invalid input type', () => {});
  });
});
```

---

## React 组件测试

### 基于 React Testing Library

```tsx
// components/Button/index.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ children, onClick, disabled, loading }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={loading ? 'loading' : ''}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
```

```tsx
// components/Button/index.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './index';

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show loading state', () => {
    render(<Button loading>Submit</Button>);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should not call onClick when loading', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} loading>Submit</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### Hooks 测试

```typescript
// hooks/useCounter.ts
import { useState, useCallback } from 'react';

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}
```

```typescript
// hooks/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    
    expect(result.current.count).toBe(0);
  });

  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    expect(result.current.count).toBe(10);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(10);
  });
});
```

---

## Vue 组件测试

### 基于 Vue Test Utils

```vue
<!-- components/Button.vue -->
<template>
  <button
    :disabled="disabled || loading"
    :class="{ loading }"
    @click="handleClick"
  >
    <span v-if="loading">Loading...</span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean;
  loading?: boolean;
}

interface Emits {
  (e: 'click'): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  loading: false,
});

const emit = defineEmits<Emits>();

const handleClick = () => {
  if (!props.disabled && !props.loading) {
    emit('click');
  }
};
</script>
```

```typescript
// components/Button.test.ts
import { mount } from '@vue/test-utils';
import Button from './Button.vue';

describe('Button', () => {
  it('should render slot content', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me',
      },
    });
    
    expect(wrapper.text()).toContain('Click me');
  });

  it('should emit click event', async () => {
    const wrapper = mount(Button);
    
    await wrapper.trigger('click');
    
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
    });
    
    expect(wrapper.attributes('disabled')).toBeDefined();
  });

  it('should show loading state', () => {
    const wrapper = mount(Button, {
      props: { loading: true },
    });
    
    expect(wrapper.text()).toContain('Loading...');
  });

  it('should not emit click when loading', async () => {
    const wrapper = mount(Button, {
      props: { loading: true },
    });
    
    await wrapper.trigger('click');
    
    expect(wrapper.emitted('click')).toBeUndefined();
  });
});
```

---

## Mock 技巧

### API Mock

```typescript
// __mocks__/axios.ts
const mockAxios = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(() => mockAxios),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

export default mockAxios;
```

```typescript
// 使用 mock
import axios from 'axios';
import { getUserList } from '@/services/user';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getUserList', () => {
  it('should fetch users', async () => {
    const mockData = { list: [{ id: 1, name: 'Test' }], total: 1 };
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });
    
    const result = await getUserList({ current: 1, pageSize: 10 });
    
    expect(result).toEqual(mockData);
    expect(mockedAxios.get).toHaveBeenCalledWith('/user/list', {
      params: { current: 1, pageSize: 10 },
    });
  });
});
```

### 模块 Mock

```typescript
// Mock 整个模块
jest.mock('@/utils/storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock 部分模块
jest.mock('@/utils/format', () => ({
  ...jest.requireActual('@/utils/format'),
  formatDate: jest.fn(() => '2024-01-01'),
}));
```

### Timer Mock

```typescript
describe('Timer tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call callback after delay', () => {
    const callback = jest.fn();
    setTimeout(callback, 1000);
    
    jest.advanceTimersByTime(1000);
    
    expect(callback).toHaveBeenCalled();
  });
});
```

---

## 断言速查

### 常用匹配器

| 匹配器 | 用途 | 示例 |
|--------|------|------|
| toBe | 精确相等 | `expect(1).toBe(1)` |
| toEqual | 深度相等 | `expect({a:1}).toEqual({a:1})` |
| toBeTruthy | 真值 | `expect(1).toBeTruthy()` |
| toBeFalsy | 假值 | `expect(0).toBeFalsy()` |
| toBeNull | null | `expect(null).toBeNull()` |
| toBeUndefined | undefined | `expect(undefined).toBeUndefined()` |
| toContain | 包含 | `expect([1,2]).toContain(1)` |
| toHaveLength | 长度 | `expect([1,2]).toHaveLength(2)` |
| toThrow | 抛异常 | `expect(fn).toThrow()` |

### DOM 匹配器

```typescript
// @testing-library/jest-dom
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveClass('active');
expect(element).toHaveAttribute('href', '/home');
expect(element).toHaveTextContent('Hello');
expect(element).toHaveValue('test');
```

### 函数匹配器

```typescript
const fn = jest.fn();

expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledTimes(2);
expect(fn).toHaveBeenCalledWith(arg1, arg2);
expect(fn).toHaveBeenLastCalledWith(arg);
expect(fn).toHaveReturnedWith(value);
```

---

## 测试用例设计

### 用例设计原则

```
AAA 模式：
- Arrange（准备）：设置测试数据和环境
- Act（执行）：执行被测试的操作
- Assert（断言）：验证结果

FIRST 原则：
- Fast（快速）：测试要快
- Independent（独立）：测试间不依赖
- Repeatable（可重复）：每次结果一致
- Self-validating（自验证）：自动判断通过/失败
- Timely（及时）：及时编写测试
```

### 用例覆盖清单

```markdown
## 测试用例设计模板

### 功能测试
- [ ] 正常输入，预期输出
- [ ] 边界值测试
- [ ] 异常输入处理

### 交互测试
- [ ] 用户点击
- [ ] 表单输入
- [ ] 键盘操作

### 状态测试
- [ ] 初始状态
- [ ] 状态变更
- [ ] 异步状态

### 集成测试
- [ ] 组件间交互
- [ ] API 调用
```

---

## 触发关键词

| 类型 | 关键词示例 |
|------|-----------|
| 写测试 | "写单测"、"单元测试"、"测试用例" |
| 测试框架 | "Jest"、"Vitest"、"测试配置" |
| Mock | "mock数据"、"模拟接口"、"假数据" |
| 覆盖率 | "测试覆盖率"、"覆盖率报告" |
| 组件测试 | "测试组件"、"Testing Library" |

---

## 注意事项

### 最佳实践

```
✅ 推荐做法：
- 测试行为而非实现
- 使用有意义的测试描述
- 保持测试独立性
- Mock 外部依赖

❌ 避免做法：
- 测试实现细节
- 测试间共享状态
- 过度 Mock
- 忽略边界条件
```

### 测试金字塔

```
        /\
       /  \   E2E 测试（少量）
      /----\
     /      \  集成测试（适量）
    /--------\
   /          \ 单元测试（大量）
  --------------
```
