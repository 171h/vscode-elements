import {Percent, percent} from '../includes/sizes.js';

export function calculateColumnWidths(
  widths: Percent[],
  splitterIndex: number,
  delta: Percent,
  minWidths: Map<number, Percent>
): Percent[] {
  const result = [...widths];

  // 分隔位置无效或位移为零时不执行操作
  if (delta === 0 || splitterIndex < 0 || splitterIndex >= widths.length - 1) {
    return result;
  }

  const absDelta = Math.abs(delta);
  let remaining: Percent = percent(absDelta);

  const leftIndices: number[] = [];
  const rightIndices: number[] = [];

  // 收集分隔条左侧的列索引，包含当前列
  for (let i = splitterIndex; i >= 0; i--) {
    leftIndices.push(i);
  }

  // 收集分隔条右侧的列索引
  for (let i = splitterIndex + 1; i < widths.length; i++) {
    rightIndices.push(i);
  }

  // 根据拖动方向，一侧缩小，另一侧增大
  const shrinkingSide = delta > 0 ? rightIndices : leftIndices;
  const growingSide = delta > 0 ? leftIndices : rightIndices;

  // 计算遵循 minWidth 的总可缩小空间
  let totalAvailable: Percent = percent(0);

  for (const i of shrinkingSide) {
    const available = Math.max(0, result[i] - (minWidths.get(i) ?? 0));
    totalAvailable = percent(totalAvailable + available);
  }

  // 请求位移无法完全满足时中止
  if (totalAvailable < remaining) {
    return result;
  }

  // 依次缩小列，直到完全消耗请求位移
  for (const i of shrinkingSide) {
    if (remaining === 0) {
      break;
    }

    const available = Math.max(0, result[i] - (minWidths.get(i) ?? 0));
    const take = Math.min(available, remaining);

    result[i] = percent(result[i] - take);
    remaining = percent(remaining - take);
  }

  // 对增大侧应用大小相同、方向相反的位移
  let toAdd: Percent = percent(absDelta);

  for (const i of growingSide) {
    if (toAdd === 0) {
      break;
    }

    result[i] = percent(result[i] + toAdd);
    toAdd = percent(0); // 全部增量应用于最近的列
  }

  return result;
}
