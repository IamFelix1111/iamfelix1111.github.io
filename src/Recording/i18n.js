// Recording page translations.
// Loaded after /i18n.js and merged into the shared dictionary.
// Release metadata: bump this and every language below updates.
// Keep the matching static text in index.html in sync (shown before JS runs).
const RECORDING_VERSION = 'v0.0.2';

window.I18N = window.I18N || {};
Object.assign(window.I18N, {
    'version': {
        'de': `Neueste Version: <strong>${RECORDING_VERSION}</strong>.`,
        'en': `Latest version: <strong>${RECORDING_VERSION}</strong>.`,
        'es': `Última versión: <strong>${RECORDING_VERSION}</strong>.`,
        'fr': `Dernière version : <strong>${RECORDING_VERSION}</strong>.`,
        'it': `Ultima versione: <strong>${RECORDING_VERSION}</strong>.`,
        'ja': `最新バージョン：<strong>${RECORDING_VERSION}</strong>。`,
        'ko': `최신 버전: <strong>${RECORDING_VERSION}</strong>.`,
        'pt': `Versão mais recente: <strong>${RECORDING_VERSION}</strong>.`,
        'ru': `Последняя версия: <strong>${RECORDING_VERSION}</strong>.`,
        'zh-cn': `最新版本：<strong>${RECORDING_VERSION}</strong>。`,
        'zh-tw': `最新版本：<strong>${RECORDING_VERSION}</strong>。`
    }
});
