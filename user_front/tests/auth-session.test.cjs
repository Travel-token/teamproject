const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../src/services/authSession.ts'), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const session = (token = 'old') => ({ userId: 7, name: '테스트', sessionId: 'session-1', accessToken: 'access-' + token, refreshToken: token, accessExpiresAt: Date.now() + 900000, refreshExpiresAt: Date.now() + 86400000 });
function runtime(post, { platform = 'android', store = new Map(), nativeFailure = false } = {}) {
    const calls = [];
    const http = { post: async (url, body) => { calls.push({ url, body }); return post(url, body); } };
    const axios = { create: () => http, isAxiosError: e => !!e.isAxiosError };
    const context = {
        window: { sessionStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) } },
        exports: {}, require: name => {
            if (name === 'react-native') return { Platform: { OS: platform } };
            if (name === 'expo-secure-store') return platform === 'web' ? {} : {
                getItemAsync: async k => { if (nativeFailure) throw new Error('keystore unavailable'); return store.get(k) || null; },
                setItemAsync: async (k, v) => { if (nativeFailure) throw new Error('keystore unavailable'); store.set(k, v); }
            };
            if (name === '@react-native-async-storage/async-storage') return { default: { removeItem: async () => { } } };
            if (name === 'axios') return { default: axios };
            if (name === '../config/api') return { API_BASE_URL: 'https://unit.invalid' };
            throw new Error(name);
        }
    };
    vm.runInNewContext(js, context);
    return { api: context.exports, store, calls };
}
const failure = status => Object.assign(new Error('request failed'), { isAxiosError: true, response: status ? { status } : undefined });
test('parallel refresh calls use one request and rotated token', async () => {
    let resolve; const deferred = new Promise(r => { resolve = r; });
    const r = runtime(async () => deferred); await r.api.saveSession(session());
    const a = r.api.refreshSession(), b = r.api.refreshSession();
    await new Promise(r => setImmediate(r)); resolve({ data: session('next') });
    const result = await Promise.all([a, b]); assert.equal(result[0].refreshToken, 'next'); assert.equal(r.calls.filter(c => c.url.endsWith('/refresh')).length, 1);
});
test('network failure preserves the login', async () => {
    const r = runtime(async () => { throw failure(); }); await r.api.saveSession(session());
    await assert.rejects(r.api.refreshSession()); assert.equal((await r.api.getSession()).refreshToken, 'old');
});
test('refresh 401 clears credentials and emits signed-out state', async () => {
    const r = runtime(async () => { throw failure(401); }); await r.api.saveSession(session()); let signedOut = false;
    r.api.subscribeSession(s => { if (!s) signedOut = true; }); await assert.rejects(r.api.refreshSession());
    assert.equal(await r.api.getSession(), null); assert.equal(signedOut, true);
});
test('late refresh cannot restore a logged-out account', async () => {
    let resolve; const deferred = new Promise(r => { resolve = r; }); const r = runtime(async () => deferred);
    await r.api.saveSession(session()); const refresh = r.api.refreshSession(); await new Promise(r => setImmediate(r));
    await r.api.forgetSession(); resolve({ data: session('late') }); await assert.rejects(refresh); assert.equal(await r.api.getSession(), null);
});
test('old 401 does not rotate a token already refreshed by another request', async () => {
    const r = runtime(async () => { throw new Error('unexpected network'); }); await r.api.saveSession(session('new'));
    assert.equal((await r.api.refreshSession('access-old')).refreshToken, 'new'); assert.equal(r.calls.length, 0);
});
test('offline logout is queued securely and retried', async () => {
    let offline = true; const r = runtime(async () => { if (offline) throw failure(); return { data: null }; });
    await r.api.saveSession(session()); assert.equal(await r.api.logoutSession(), false); assert.equal(await r.api.getSession(), null);
    assert.equal(JSON.parse(r.store.get('travel.auth.v1')).pending.length, 1);
    offline = false; await r.api.flushRevocations(); assert.equal(JSON.parse(r.store.get('travel.auth.v1')).pending.length, 0);
});
test('late refresh cannot overwrite a newly logged-in account', async () => {
    let resolve; const deferred = new Promise(r => { resolve = r; }); const r = runtime(async () => deferred);
    await r.api.saveSession(session()); const refresh = r.api.refreshSession(); await new Promise(r => setImmediate(r));
    await r.api.saveSession({ ...session('other'), sessionId: 'session-2', userId: 8 }); resolve({ data: session('late') });
    await assert.rejects(refresh); assert.equal((await r.api.getSession()).userId, 8);
});

test('web boot, login and reload work without native SecureStore methods', async () => {
    const store = new Map();
    const r = runtime(async () => ({ data: null }), { platform: 'web', store });
    assert.equal(await r.api.getSession(), null);
    await r.api.saveSession(session());
    const reloaded = runtime(async () => ({ data: null }), { platform: 'web', store });
    assert.equal((await reloaded.api.getSession()).refreshToken, 'old');
    assert.equal(await reloaded.api.logoutSession(), true);
    assert.equal(JSON.parse(store.get('travel.auth.v1')).session, null);
});

test('corrupt JSON and old storage shapes recover to the login screen', async () => {
    for (const raw of ['{invalid', 'null', '{}', '{"session":{},"pending":[]}', '{"session":null,"pending":[null]}']) {
        const r = runtime(async () => ({ data: null }), { store: new Map([['travel.auth.v1', raw]]) });
        assert.equal(await r.api.getSession(), null);
        assert.equal(JSON.parse(r.store.get('travel.auth.v1')).pending.length, 0);
    }
});

test('native storage errors never fall back to unencrypted browser storage', async () => {
    const r = runtime(async () => ({ data: null }), { nativeFailure: true });
    await assert.rejects(r.api.getSession(), /keystore unavailable/);
    assert.equal(r.store.size, 0);
});
