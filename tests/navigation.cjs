// npm install --prefix /tmp/hb-tests jsdom
// NODE_PATH=/tmp/hb-tests/node_modules node tests/navigation.cjs
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const fixture = '<div class="main"><div class="section"><div class="section__body typo"><pre><code><span class="hljs-keyword">int</span></code></pre></div></div></div><div class="scratchpad-container" style="display:none"><div id="scratchpad" style="opacity:0"></div></div>';
(async () => {
    const dom = new JSDOM(`<html><head></head><body class="mode--scratchpad">${fixture}</body></html>`, {
        url: 'http://10.3.44.224/p/1', runScripts: 'outside-only', pretendToBeVisual: true,
    });
    const w = dom.window, doc = w.document;
    try {
        w.matchMedia = () => ({ matches: false, addEventListener() {} });
        w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
        w.GM_xmlhttpRequest = () => {};
        w.localStorage.setItem('hydro_beautifier_v170', JSON.stringify({cardOpacity: 67, blur: 9, radius: 18}));
        w.eval(fs.readFileSync(path.join(__dirname, '../Hydro-UI-Beautifier.user.js'), 'utf8'));
        const wait = () => new Promise(resolve => setTimeout(resolve, 500));
        await wait();
        const root = doc.documentElement;
        const before = root.style.getPropertyValue('--hb-global-bg');
        assert(before.includes('0.67'));
        const saved = w.localStorage.getItem('hydro_beautifier_v170');
        const check = () => {
            assert.equal(root.style.getPropertyValue('--hb-global-bg'), before);
            assert(doc.body.classList.contains('hb170-code-style'));
            assert(doc.querySelector('.section.hb170-card.hb170-native'));
            assert(doc.querySelector('pre.hb170-code'));
            assert.equal(doc.querySelector('.hljs-keyword').textContent, 'int');
            assert.equal(doc.querySelectorAll('#hb170-panel').length, 1);
            assert.equal(w.localStorage.getItem('hydro_beautifier_v170'), saved);
        };
        check();
        // 用户提供的真实 DOM：隐藏的预建 IDE 不得改变普通题面状态。
        assert(!doc.body.classList.contains('mode--scratchpad'));
        const dock = doc.querySelector('.scratchpad-container');
        dock.style.display = 'block'; await wait();
        assert(doc.body.classList.contains('mode--scratchpad'));
        check();
        dock.style.display = 'none'; await wait();
        assert(!doc.body.classList.contains('mode--scratchpad'));
        check();
        // PJAX 留下旧 mode class，但目标页面的 IDE 仍然隐藏。
        doc.body.classList.add('mode--scratchpad'); await wait();
        assert(!doc.body.classList.contains('mode--scratchpad'));
        check();
        // 隐藏祖先的情形也不能误判为 IDE 已打开。
        const wrapper = doc.createElement('div'); dock.before(wrapper); wrapper.append(dock);
        wrapper.style.display = 'none'; dock.style.display = 'block'; await wait();
        assert(!doc.body.classList.contains('mode--scratchpad'));
        wrapper.style.display = 'block'; await wait();
        assert(doc.body.classList.contains('mode--scratchpad'));
        dock.style.display = 'none'; await wait();
        assert(!doc.body.classList.contains('mode--scratchpad'));
        // PJAX 保留 body 和 DOM，仅清空根 style；原版本遗漏的场景。
        root.removeAttribute('style'); await wait(); check();
        root.style.setProperty('--hb-native-bg', 'transparent'); await wait(); check();
        assert.notEqual(root.style.getPropertyValue('--hb-native-bg'), 'transparent');
        doc.body.className = 'mode--scratchpad'; await wait(); check();
        doc.querySelector('.section').className = 'section'; await wait(); check();
        doc.querySelector('#hb170-style').remove(); await wait(); check();
        assert(doc.querySelector('#hb170-style'));
        const body = doc.createElement('body'); body.innerHTML = fixture;
        doc.body.replaceWith(body); await wait(); check();
        doc.dispatchEvent(new w.Event('pjax:complete')); await wait(); check();
        // 自身写入不会造成 MutationObserver 的无限重扫。
        let mutations = 0;
        const observer = new w.MutationObserver(records => { mutations += records.length; });
        observer.observe(root, {attributes:true, subtree:true, childList:true});
        await wait(); observer.disconnect();
        assert.equal(mutations, 0, 'theme recovery must settle');
        console.log('PASS: hidden IDE initial state, IDE enter/exit, stale mode class, hidden ancestor, root variables, body/card classes, stylesheet removal, body replacement, PJAX, settings preservation, observer settles');
    } finally { w.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
