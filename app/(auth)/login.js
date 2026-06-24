import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import AppButton from '../../src/components/common/AppButton';
import { colors, fontSize, spacing, radius } from '../../src/constants/theme';
import { SOCIAL_LOGIN_PROVIDERS } from '../../src/constants/config';
import { useAuth } from '../../src/context/AuthContext';
import TermsModal from '../../src/components/modals/TermsModal';
import { Ionicons } from '@expo/vector-icons';

// 원본: 각 소셜 로그인 버튼의 아이콘 (간소화된 브랜드 마크)
function ProviderIcon({ providerKey }) {
  if (providerKey === 'google') {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </Svg>
    );
  }
  if (providerKey === 'kakao') {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Rect width={24} height={24} rx={5} fill="#FEE500" />
        <Path d="M12 4C7.58 4 4 6.91 4 10.5c0 2.28 1.47 4.29 3.7 5.43l-.7 2.59 3.02-2a9.2 9.2 0 0 0 1.98.22c4.42 0 8-2.91 8-6.5S16.42 4 12 4z" fill="#3C1E1E" />
      </Svg>
    );
  }
  if (providerKey === 'naver') {
    return (
      <View style={styles.naverBadge}>
        <Text style={styles.naverText}>N</Text>
      </View>
    );
  }
  // apple
  return <Ionicons name="logo-apple" size={20} color={colors.textPrimary} />;
}

export default function LoginScreen() {
  const { startLogin, pendingProvider } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.logoBadge}>
            <Ionicons name="location" size={36} color={colors.white} />
          </View>
          <Text style={styles.appName}>Travel Token</Text>
          <Text style={styles.tagline}>여행을 데이터로, 경험을 자산으로</Text>
        </View>

        <View style={styles.providerList}>
          {SOCIAL_LOGIN_PROVIDERS.map((p) => (
            <AppButton
              key={p.key}
              variant="secondary"
              title={p.label}
              icon={<ProviderIcon providerKey={p.key} />}
              onPress={() => startLogin(p.key, p.label.replace('로 로그인', ''))}
              style={styles.providerBtn}
              textStyle={styles.providerBtnText}
            />
          ))}
        </View>

        <Text style={styles.legalText}>
          로그인 시 <Text style={styles.legalLink}>이용약관</Text> 및{' '}
          <Text style={styles.legalLink}>개인정보처리방침</Text>에{'\n'}동의하는 것으로
          간주됩니다
        </Text>
      </View>

      {/* 소셜 로그인 선택 시 뜨는 약관 동의 모달 */}
      <TermsModal visible={!!pendingProvider} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgPrimary },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xxl },
  hero: { alignItems: 'center', marginBottom: 44 },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: colors.tp,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: colors.tp,
    shadowOpacity: 0.4,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  appName: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  tagline: { fontSize: fontSize.lg, color: colors.textSecondary },
  providerList: { gap: spacing.md, marginBottom: spacing.xxl + 4 },
  providerBtn: {
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    gap: 14,
  },
  providerBtnText: { fontSize: fontSize.ml },
  legalText: {
    fontSize: fontSize.base,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  legalLink: { color: colors.tp },
  naverBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#03C75A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  naverText: { color: colors.white, fontWeight: '800', fontSize: 13 },
});
