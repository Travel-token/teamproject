import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated } from 'react-native';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  // 원본 toast(msg): 2.4초 노출 후 페이드아웃
  const show = useCallback(
    (msg, duration = 2400) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(msg);
      setVisible(true);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
          setVisible(false);
        });
      }, duration);
    },
    [opacity]
  );

  return (
    <ToastContext.Provider value={{ show, message, visible, opacity }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast는 ToastProvider 내부에서만 사용할 수 있습니다');
  return ctx;
}
