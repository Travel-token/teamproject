const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, dependencies = {}, globals = {}) {
    const filename = path.resolve(__dirname, '../src', file);
    const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText;
    const context = { exports: {}, FormData, Blob, process: { env: {} }, ...globals,
        require: name => {
            if (name in dependencies) return dependencies[name];
            throw new Error('Unexpected dependency: ' + name);
        }
    };
    vm.runInNewContext(js, context);
    return context.exports;
}
const dates = load('utils/expenseDateTime.ts');

test('default expense date preserves local calendar date and time', () => {
    assert.equal(dates.nowExpenseDateTime(new Date(2026, 8, 10, 14, 30, 12)), '2026-09-10T14:30:12');
});

test('OCR date retains its original year and gets an ISO separator', () => {
    assert.equal(dates.normalizeExpenseDateTime('2024-02-29 23:59:58'), '2024-02-29T23:59:58');
    assert.equal(dates.normalizeExpenseDateTime('2026-09-10T14:30'), '2026-09-10T14:30:00');
    assert.equal(dates.normalizeExpenseDateTime('2026-09-10T14:30:12.123'), '2026-09-10T14:30:12.123');
});

test('ambiguous labels and impossible dates are rejected instead of silently shifting', () => {
    for (const value of ['09월 10일 14:30', '2026-02-29T14:30', '2026-04-31T14:30', '2026-13-01T14:30', '2026-09-10T24:00', '2026-09-10T14:60', '2026-09-10T14:30Z']) {
        assert.throws(() => dates.normalizeExpenseDateTime(value));
    }
});

test('expense create/update normalize dates before HTTP and reject bad dates locally', async () => {
    const calls = [];
    const send = async (url, body) => { calls.push({ url, body }); return { data: { data: { id: 1, payerMemberId: 2 } } }; };
    const expense = load('api/expense.ts', { './client': { api: { post: send, patch: send } }, '../utils/expenseDateTime': dates });
    await expense.createExpense({ tripId: '3', amount: 1000, splits: [{ memberId: '2' }], spentAt: '2024-02-29 14:30' });
    await expense.updateExpense('3', '1', { spentAt: '2026-09-10T14:30:00' });
    assert.equal(calls[0].body.spentAt, '2024-02-29T14:30:00');
    assert.equal(calls[1].body.spentAt, '2026-09-10T14:30:00');
    await assert.rejects(expense.createExpense({ tripId: '3', amount: 1000, splits: [{ memberId: '2' }], spentAt: '09월 10일 14:30' }));
    assert.equal(calls.length, 2);
});

function ocrRuntime(platform, globals = {}) {
    const calls = [];
    const api = load('api/ocr.ts', {
        'react-native': { Platform: { OS: platform } },
        './client': { api: { post: async (url, body, config) => { calls.push({ url, body, config }); return { data: { name: 'Store' } }; } } }
    }, globals);
    return { api, calls };
}

test('OCR forwards cancellation to the HTTP request', async () => {
    const r = ocrRuntime('web');
    const controller = new AbortController();
    await r.api.extractReceipt('3', { uri: 'blob:test', file: new Blob(['test']) }, controller.signal);
    assert.equal(r.calls[0].config.signal, controller.signal);
    controller.abort();
    assert.equal(r.calls[0].config.signal.aborted, true);
});

test('web OCR uploads actual file bytes with an automatically generated boundary', async () => {
    const r = ocrRuntime('web');
    const file = new Blob(['receipt-data'], { type: 'image/png' });
    file.name = 'receipt.png';
    await r.api.extractReceipt('3', { uri: 'blob:receipt', file });
    const call = r.calls[0];
    assert.equal(call.url, '/api/trips/3/receipts/parse');
    assert.equal(await call.body.get('file').text(), 'receipt-data');
    assert.equal(call.body.get('file').type, 'image/png');
    assert.equal(call.config.headers, undefined);
});

test('web OCR can read a blob URI when ImagePicker has no File', async () => {
    const r = ocrRuntime('web', { fetch: async () => ({ ok: true, blob: async () => new Blob(['fallback-bytes']) }) });
    await r.api.extractReceipt('3', { uri: 'blob:receipt' });
    assert.equal(await r.calls[0].body.get('file').text(), 'fallback-bytes');
});

test('Android OCR retains the native uri/name/type multipart representation', async () => {
    class NativeForm { parts = new Map(); append(k, v) { this.parts.set(k, v); } }
    const r = ocrRuntime('android', { FormData: NativeForm });
    await r.api.extractReceipt('3', { uri: 'file:///receipt.jpg', fileName: 'receipt.jpg', mimeType: 'image/jpeg' });
    assert.equal(r.calls[0].body.parts.get('file').uri, 'file:///receipt.jpg');
    assert.equal(r.calls[0].body.parts.get('file').type, 'image/jpeg');
});
