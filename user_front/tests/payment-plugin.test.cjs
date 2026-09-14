const test = require('node:test');
const assert = require('node:assert/strict');
const { registerPackage } = require('../plugins/withPaymentCapture');

test('Kotlin registration survives repeated prebuild', () => {
  const source = 'override fun getPackages(): List<ReactPackage> = PackageList(this).packages.apply {\n}';
  const result = registerPackage(source, 'kt');
  assert.match(result, /add\(com\.teamproject\.travelsettle\.capture\.PaymentCapturePackage\(\)\)/);
  assert.equal(registerPackage(result, 'kt'), result);
});
test('Java registration preserves existing packages and is idempotent', () => {
  const result = registerPackage('List<ReactPackage> packages = new PackageList(this).getPackages();', 'java');
  assert.match(result, /packages.add\(new/);
  assert.equal(registerPackage(result, 'java'), result);
});
test('unknown generated entrypoint fails instead of silently omitting native module', () => {
  assert.throws(() => registerPackage('custom host', 'kt'));
});