import { VALIDATION_LIMITS } from '../MockData';

export const cleanJsonString = (rawStr) => {
  if (!rawStr) return '{}';
  if (typeof rawStr === 'object') return JSON.stringify(rawStr, null, 2);
  let currentStr = String(rawStr).trim();
  currentStr = currentStr.replace(/\u201c/g, '"').replace(/\u201d/g, '"');
  try {
    const parsed = JSON.parse(currentStr);
    if (parsed && typeof parsed === 'object') return JSON.stringify(parsed, null, 2);
  } catch (e) {}
  return currentStr;
};

export const clampValue = (fieldName, val) => {
  const rule = VALIDATION_LIMITS[fieldName];
  if (!rule) return val;
  if (val === undefined || val === null || val === '') return rule.min;
  let num = parseInt(String(val).replace(/\D/g, ''), 10);
  if (isNaN(num)) num = rule.min;
  return Math.max(rule.min, Math.min(rule.max, num));
};

export const getFormFields = (jsonStr) => {
  try {
    const obj = JSON.parse(jsonStr || '{}');
    return Object.entries(obj).filter(([_, v]) => typeof v !== 'object');
  } catch (e) {
    return [];
  }
};
