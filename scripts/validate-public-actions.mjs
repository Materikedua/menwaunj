import assert from 'node:assert/strict';
import { PUBLIC_ACTION_IDS, isPublishedActionUrl, readPublishedActions, mergePublishedActions } from '../src/command/publicActionPolicy.js';

const published = (id, url, revision = 1) => ({ id, url, revision });
const initialKcUrl = 'https://bit.ly/PendaftaranKCVIII';
const newForm = 'https://forms.gle/ApprovedRegistration';
const docsForm = 'https://docs.google.com/forms/d/e/approved/viewform';
assert.equal(PUBLIC_ACTION_IDS.length, 4);
assert.ok(isPublishedActionUrl(initialKcUrl));
assert.ok(isPublishedActionUrl(newForm));
assert.ok(isPublishedActionUrl(docsForm));
for (const url of [
  'http://forms.gle/registration',
  '//forms.gle/registration',
  'https:forms.gle/registration',
  'https://forms.gle\\registration',
  'javascript:alert(1)',
  'https://forms.gle.evil.example/registration',
  'https://forms.gle@evil.example/registration',
  'https://user:password@forms.gle/registration',
  'https://forms.gle:8443/registration',
  'https://forms.gle/',
  'https://forms.gle/one/two',
  'https://forms.gle/form?name=<script>',
  'https://forms.gle/form?name="example"',
  "https://forms.gle/form?name='example'",
  'https://forms.gle/form?name=`example`',
  'https://docs.google.com/document/d/registration',
  'https://docs.google.com/forms/edit',
  'https://docs.google.com/forms/upload',
  'https://docs.google.com/forms/d/form-id/edit',
  'https://docs.google.com/forms.evil/registration',
  'https://bit.ly/UnreviewedNewDestination',
  ' https://forms.gle/registration',
  'https://forms.gle/registration\n',
  '',
  null,
]) assert.equal(isPublishedActionUrl(url), false, `Unsafe public URL accepted: ${url}`);

const result = readPublishedActions({ actions: [
  published('kc-registration', newForm, 2),
  published('youth-spark-registration', docsForm, 3),
  published('kc-jersey-peserta', newForm),
  published('kc-jersey-official', newForm),
] });
assert.equal(Object.getPrototypeOf(result), null);
assert.deepEqual(Object.keys(result).sort(), [...PUBLIC_ACTION_IDS].sort());
assert.equal(result['kc-registration'], newForm);
assert.equal(result['youth-spark-registration'], docsForm);

for (const invalidPayload of [null, {}, { actions: null }, { actions: {} }, { drafts: [published('kc-registration', newForm)] }]) {
  assert.deepEqual(Object.keys(readPublishedActions(invalidPayload)), []);
}
for (const revision of [0, -1, 1.5, '2', null, Number.MAX_SAFE_INTEGER + 1]) {
  assert.deepEqual(Object.keys(readPublishedActions({ actions: [published('kc-registration', newForm, revision)] })), []);
}
assert.deepEqual(Object.keys(readPublishedActions({ actions: [
  published('unknown-action', newForm),
  published('__proto__', newForm),
  { ...published('kc-registration', newForm), status: 'draft' },
  published('youth-spark-registration', 'https://evil.example/forms'),
] })), []);
assert.deepEqual(Object.keys(readPublishedActions({ actions: [
  published('kc-registration', initialKcUrl),
  published('kc-registration', newForm, 2),
  published('kc-registration', docsForm, 3),
] })), [], 'Ambiguous duplicate IDs must fall back instead of choosing a URL.');
assert.equal(readPublishedActions({ actions: [published('kc-registration', initialKcUrl)] })['kc-registration'], initialKcUrl);
for (const invalidRefresh of [null, {}, { actions: [] }, { actions: [published('kc-registration', 'javascript:alert(1)', 3)] }]) {
  assert.equal(mergePublishedActions(result, invalidRefresh), result, 'Malformed refresh must preserve the confirmed snapshot.');
}
const partialRefresh = mergePublishedActions(result, { actions: [published('kc-registration', docsForm, 4)] });
assert.equal(partialRefresh['kc-registration'], docsForm);
assert.equal(partialRefresh['kc-jersey-official'], result['kc-jersey-official'], 'A partial refresh keeps other confirmed destinations.');
assert.equal(result['kc-registration'], newForm, 'Merging must not mutate the previous snapshot.');
console.log('Published action payload policy passed: canonical IDs, positive revisions, safe form URLs, draft and malformed payload fallback.');
