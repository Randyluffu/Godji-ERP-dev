// ==UserScript==
// @name         Годжи — TightVNC23232
// @namespace    http://tampermonkey.net/
// @version      1.1
// @match        https://godji.cloud/*
// @match        https://*.godji.cloud/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    setTimeout(init, 1500);

    const PROXY = 'http://localhost:6080';

    function showToast(msg, ok) {
        var old = document.getElementById('gj-vnc-toast');
        if (old) old.remove();
        var t = document.createElement('div');
        t.id = 'gj-vnc-toast';
        t.textContent = msg;
        t.style.cssText =
            'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
            'padding:10px 20px;border-radius:10px;font-size:13px;font-family:sans-serif;' +
            'z-index:9999999;pointer-events:none;transition:opacity .3s;' +
            (ok
                ? 'background:#0d1f14;color:#10b981;border:1px solid rgba(16,185,129,.3);'
                : 'background:#1f0d0d;color:#ef4444;border:1px solid rgba(239,68,68,.3);');
        document.body.appendChild(t);
        setTimeout(function() {
            t.style.opacity = '0';
            setTimeout(function() { if (t.parentNode) t.remove(); }, 300);
        }, 2500);
    }

    function loadList(listEl, statusEl) {
        fetch(PROXY + '/status')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (statusEl) {
                    statusEl.textContent = '\u2713 Сервер работает \u00B7 ПК: ' + Object.keys(data).length;
                    statusEl.style.color = '#10b981';
                }

                listEl.innerHTML = '';
                var keys = Object.keys(data).sort(function(a, b) {
                    return parseInt(a) - parseInt(b);
                });

                if (!keys.length) {
                    listEl.innerHTML = '<div style="color:#374151;text-align:center;padding:20px;font-size:13px">Нет ПК в конфиге</div>';
                    return;
                }

                keys.forEach(function(name) {
                    var pc = data[name];

                    var row = document.createElement('div');
                    row.style.cssText =
                        'display:flex;align-items:center;background:#111128;' +
                        'border:1px solid rgba(99,102,241,.12);border-radius:10px;' +
                        'padding:10px 12px;margin-bottom:6px;gap:10px;' +
                        'transition:border-color .15s;';
                    row.onmouseover = function() { row.style.borderColor = 'rgba(220,38,38,.4)'; };
                    row.onmouseout  = function() { row.style.borderColor = 'rgba(99,102,241,.12)'; };

                    var info = document.createElement('div');
                    info.style.flex = '1';
                    info.innerHTML =
                        '<div style="color:#e2e8f0;font-size:13px;font-weight:600">ПК ' + name + '</div>' +
                        '<div style="color:#4b5563;font-size:11px;margin-top:2px">' + pc.ip + '</div>';

                    var openBtn = document.createElement('button');
                    openBtn.textContent = '\u25B6 Открыть';
                    openBtn.style.cssText =
                        'background:rgba(220,38,38,.15);color:#ef4444;' +
                        'border:1px solid rgba(220,38,38,.3);border-radius:7px;' +
                        'padding:5px 12px;font-size:12px;font-weight:500;' +
                        'cursor:pointer;white-space:nowrap;font-family:sans-serif;' +
                        'transition:all .15s;';
                    openBtn.onmouseover = function() { openBtn.style.background = 'rgba(220,38,38,.25)'; };
                    openBtn.onmouseout  = function() { openBtn.style.background = 'rgba(220,38,38,.15)'; };

                    openBtn.onclick = function() {
                        openBtn.disabled = true;
                        openBtn.textContent = '...';
fetch(PROXY + '/connect?pc=' + name)
                            .then(function(r) { return r.json(); })
                            .then(function(res) {
                                if (res.error) throw new Error(res.error);
                                showToast('\u2713 TightVNC открыт для ПК ' + name, true);
                                openBtn.textContent = '\u2713';
                                setTimeout(function() {
                                    openBtn.disabled = false;
                                    openBtn.textContent = '\u25B6 Открыть';
                                }, 2000);
                            })
                            .catch(function(e) {
                                showToast('\u2715 ' + e.message, false);
                                openBtn.disabled = false;
                                openBtn.textContent = '\u25B6 Открыть';
                            });
                    };

                    row.appendChild(info);
                    row.appendChild(openBtn);
                    listEl.appendChild(row);
                });
            })
            .catch(function() {
                if (statusEl) {
                    statusEl.textContent = '\u26A0 Сервер недоступен \u2014 запустите vnc_server.py';
                    statusEl.style.color = '#ef4444';
                }
                listEl.innerHTML =
                    '<div style="color:#ef4444;text-align:center;padding:16px;font-size:12px">' +
                    '\u26A0 Сервер не запущен<br>' +
                    '<span style="color:#374151">Запустите vnc_server.py</span>' +
                    '</div>';
            });
    }

    function init() {
        var btn = document.createElement('button');
        btn.id = 'gj-vnc-btn';
        btn.title = 'TightVNC — управление ПК';
        btn.innerHTML =
            '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
            '<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" ' +
            'font-family="Arial,sans-serif" font-size="14" font-weight="900" fill="#fff">G</text>' +
            '</svg>';
        btn.style.cssText =
            'position:fixed;top:170px;right:0;' +
            'background:#dc2626;color:#fff;' +
            'border:none;border-radius:8px 0 0 8px;' +
            'padding:10px 8px;cursor:pointer;' +
            'z-index:999991;' +
            'box-shadow:-2px 2px 10px rgba(220,38,38,.5);' +
            'transition:background .15s;' +
            'display:flex;align-items:center;justify-content:center;';
        btn.onmouseover = function() { btn.style.background = '#b91c1c'; };
        btn.onmouseout  = function() { btn.style.background = '#dc2626'; };
        document.body.appendChild(btn);

        var panel = document.createElement('div');
        panel.id = 'gj-vnc-panel';
        panel.style.cssText =
            'position:fixed;top:0;right:0;width:300px;height:100vh;' +
            'background:#0d0d1e;border-left:1px solid rgba(220,38,38,.2);' +
            'box-shadow:-4px 0 24px rgba(0,0,0,.6);z-index:999990;' +
            'font-family:sans-serif;display:flex;flex-direction:column;' +
            'transform:translateX(100%);transition:transform .3s ease;';

        var header = document.createElement('div');
        header.style.cssText =
            'background:#111128;border-bottom:1px solid rgba(220,38,38,.2);' +
            'padding:12px 16px;display:flex;align-items:center;' +
            'justify-content:space-between;flex-shrink:0';

        var titleWrap = document.createElement('div');
        titleWrap.style.cssText = 'display:flex;align-items:center;gap:8px';

        var logo = document.createElement('div');
        logo.style.cssText =
            'width:24px;height:24px;background:#dc2626;border-radius:4px;' +
            'display:flex;align-items:center;justify-content:center;' +
            'font-size:14px;font-weight:900;color:#fff;flex-shrink:0';
        logo.textContent = 'G';
var titleText = document.createElement('span');
        titleText.style.cssText = 'color:#f1f5f9;font-weight:600;font-size:14px';
        titleText.textContent = 'TightVNC';

        titleWrap.appendChild(logo);
        titleWrap.appendChild(titleText);

        var headerRight = document.createElement('div');
        headerRight.style.cssText = 'display:flex;gap:8px';

        var refreshBtn = document.createElement('button');
        refreshBtn.textContent = '\u21BA';
        refreshBtn.title = 'Обновить';
        refreshBtn.style.cssText =
            'background:rgba(220,38,38,.15);color:#ef4444;' +
            'border:1px solid rgba(220,38,38,.25);border-radius:7px;' +
            'padding:4px 10px;font-size:14px;cursor:pointer';

        var closeBtn = document.createElement('button');
        closeBtn.textContent = '\u2715';
        closeBtn.style.cssText =
            'background:rgba(99,102,241,.1);color:#6b7280;' +
            'border:1px solid rgba(99,102,241,.15);border-radius:7px;' +
            'padding:4px 10px;font-size:12px;cursor:pointer';
        closeBtn.onclick = function() { panel.style.transform = 'translateX(100%)'; };

        headerRight.appendChild(refreshBtn);
        headerRight.appendChild(closeBtn);
        header.appendChild(titleWrap);
        header.appendChild(headerRight);
        panel.appendChild(header);

        var statusEl = document.createElement('div');
        statusEl.style.cssText =
            'padding:8px 16px;font-size:11px;color:#4b5563;' +
            'border-bottom:1px solid rgba(99,102,241,.1);flex-shrink:0';
        statusEl.textContent = 'Проверка сервера...';
        panel.appendChild(statusEl);

        var listEl = document.createElement('div');
        listEl.style.cssText = 'flex:1;overflow-y:auto;padding:10px';
        listEl.innerHTML = '<div style="color:#374151;text-align:center;padding:20px;font-size:13px">Загрузка...</div>';
        panel.appendChild(listEl);

        var style = document.createElement('style');
        style.textContent =
            '#gj-vnc-panel ::-webkit-scrollbar{width:4px}' +
            '#gj-vnc-panel ::-webkit-scrollbar-track{background:transparent}' +
            '#gj-vnc-panel ::-webkit-scrollbar-thumb{background:rgba(220,38,38,.3);border-radius:2px}';
        document.head.appendChild(style);

        document.body.appendChild(panel);

        refreshBtn.onclick = function() { loadList(listEl, statusEl); };

        btn.onclick = function() {
            var isOpen = panel.style.transform === 'translateX(0px)' ||
                         panel.style.transform === 'translateX(0)';
            panel.style.transform = isOpen ? 'translateX(100%)' : 'translateX(0)';
            if (!isOpen) loadList(listEl, statusEl);
        };

        setInterval(function() {
            var isOpen = panel.style.transform === 'translateX(0px)' ||
                         panel.style.transform === 'translateX(0)';
            if (isOpen) loadList(listEl, statusEl);
        }, 15000);

        console.log('[TightVNC] v1.1 готов');
    }

})();
