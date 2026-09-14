const fs = require('node:fs/promises');
const path = require('node:path');
const { withAndroidManifest, withMainApplication, withDangerousMod } = require('@expo/config-plugins');

const packageName = 'com.teamproject.travelsettle.capture';
function registerPackage(contents, language) {
  if (contents.includes(`${packageName}.PaymentCapturePackage()`)) return contents;
  // Expo SDK/React Native releases use either an expression body or a block
  // body here, and config-plugins may report the language as "kotlin" instead
  // of "kt". Detect the source shape rather than relying on that label.
  const kotlinApply = /PackageList\(this\)\.packages\.apply\s*\{/;
  if (kotlinApply.test(contents)) {
    return contents.replace(kotlinApply, match =>
      `${match}\n          add(${packageName}.PaymentCapturePackage())`);
  }

  const kotlinReturn = /return\s+PackageList\(this\)\.packages\b/;
  if (kotlinReturn.test(contents)) {
    return contents.replace(kotlinReturn,
      `return PackageList(this).packages.apply {\n          add(${packageName}.PaymentCapturePackage())\n        }`);
  }

  const javaPackages = /List<ReactPackage>\s+packages\s*=\s*new\s+PackageList\(this\)\.getPackages\(\);/;
  if (javaPackages.test(contents)) {
    return contents.replace(javaPackages, match =>
      `${match}\n      packages.add(new ${packageName}.PaymentCapturePackage());`);
  }

  throw new Error(`PaymentCapture: MainApplication의 ReactPackage 등록 위치를 찾을 수 없습니다. (${language || 'unknown'})`);
}

module.exports = function withPaymentCapture(config) {
  config = withMainApplication(config, mod => {
    mod.modResults.contents = registerPackage(mod.modResults.contents, mod.modResults.language);
    return mod;
  });
  config = withAndroidManifest(config, mod => {
    const manifest = mod.modResults.manifest;
    manifest.queries = manifest.queries || [];
    const launcherQuery = { action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }], category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }] };
    if (!JSON.stringify(manifest.queries).includes('android.intent.category.LAUNCHER')) manifest.queries.push({ intent: [launcherQuery] });
    const app = mod.modResults.manifest.application[0];
    const name = `${packageName}.PaymentNotificationListener`;
    app.service = (app.service || []).filter(s => s.$['android:name'] !== name);
    app.service.push({
      $: {
        'android:name': name, 'android:label': '결제 알림 수집', 'android:exported': 'false',
        'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE'
      },
      'intent-filter': [{ action: [{ $: { 'android:name': 'android.service.notification.NotificationListenerService' } }] }],
    });
    // 계정별 수집 대기목록을 새 기기로 복원하지 않는다.
    app.$['android:fullBackupContent'] = '@xml/payment_backup_rules';
    app.$['android:dataExtractionRules'] = '@xml/payment_extraction_rules';
    return mod;
  });
  return withDangerousMod(config, ['android', async mod => {
    const root = path.join(mod.modRequest.platformProjectRoot, 'app/src/main');
    const java = path.join(root, 'java', ...packageName.split('.'));
    await fs.mkdir(java, { recursive: true });
    const sources = path.join(__dirname, 'payment-capture/android');
    for (const file of await fs.readdir(sources)) {
      if (file.endsWith('.java')) await fs.copyFile(path.join(sources, file), path.join(java, file));
    }
    const xml = path.join(root, 'res/xml');
    await fs.mkdir(xml, { recursive: true });
    await fs.writeFile(path.join(xml, 'payment_backup_rules.xml'), '<full-backup-content><exclude domain="sharedpref" path="payment_capture.xml"/><exclude domain="sharedpref" path="SecureStore"/></full-backup-content>');
    await fs.writeFile(path.join(xml, 'payment_extraction_rules.xml'), '<data-extraction-rules><cloud-backup><exclude domain="sharedpref" path="payment_capture.xml"/><exclude domain="sharedpref" path="SecureStore"/></cloud-backup><device-transfer><exclude domain="sharedpref" path="payment_capture.xml"/><exclude domain="sharedpref" path="SecureStore"/></device-transfer></data-extraction-rules>');
    return mod;
  }]);
};
module.exports.registerPackage = registerPackage;
