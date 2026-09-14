const fs = require('node:fs');
const path = require('node:path');

module.exports = ({ config }) => {
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON || './google-services.json';
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || config.extra?.eas?.projectId;
  const privacyPolicyUrl = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || '';
  const accountDeletionUrl = process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL || '';
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  if (process.env.EAS_BUILD_PROFILE === 'production') {
    const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL || '';
    if (!apiUrl.startsWith('https://')) throw new Error('production 빌드에는 HTTPS EXPO_PUBLIC_API_BASE_URL이 필요합니다.');
    if (!projectId) throw new Error('production 빌드에는 EXPO_PUBLIC_EAS_PROJECT_ID가 필요합니다.');
    if (!fs.existsSync(path.resolve(googleServicesFile))) throw new Error('production 빌드에는 google-services.json이 필요합니다.');
    if (!privacyPolicyUrl.startsWith('https://')) throw new Error('production 빌드에는 HTTPS EXPO_PUBLIC_PRIVACY_POLICY_URL이 필요합니다.');
    if (!accountDeletionUrl.startsWith('https://')) throw new Error('production 빌드에는 HTTPS EXPO_PUBLIC_ACCOUNT_DELETION_URL이 필요합니다.');
    if (!googleMapsApiKey) throw new Error('production 빌드에는 GOOGLE_MAPS_API_KEY가 필요합니다.');
  }
  return {
    ...config,
    android: {
      ...config.android,
      package: process.env.ANDROID_APP_ID || config.android?.package || 'com.teamproject.travelsettle',
      ...(fs.existsSync(path.resolve(googleServicesFile)) ? { googleServicesFile } : {}),
      config: {
        ...config.android?.config,
        ...(googleMapsApiKey ? { googleMaps: { apiKey: googleMapsApiKey } } : {}),
      },
    },
    extra: {
      ...config.extra,
      ...(projectId ? { eas: { ...config.extra?.eas, projectId } } : {}),
      legal: { privacyPolicyUrl, accountDeletionUrl },
    },
    plugins: [...(config.plugins || []), 'expo-secure-store', './plugins/withPaymentCapture'],
  };
};
