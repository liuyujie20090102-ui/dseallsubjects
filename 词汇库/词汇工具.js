
// ==========================================
// 词汇工具.js — DSE 词汇库公共逻辑（按字母分页版）
// 所有主题共用此文件
// ==========================================

// ---------- 去重函数 ----------

function removeDuplicateWords(wordList) {
    const seen = new Set();
    return wordList.filter(item => {
        const key = item.英文.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function removeDuplicateIds(wordList) {
    const seen = new Set();
    return wordList.filter(item => {
        if (seen.has(item.id)) {
            console.warn('⚠️ 重复 id 已跳过：' + item.id + '（' + item.英文 + '）');
            return false;
        }
        seen.add(item.id);
        return true;
    });
}

// ---------- 按首字母分组排序 ----------

function groupByFirstLetter(wordList) {
    const groups = {};
    wordList.forEach(item => {
        const letter = item.英文.charAt(0).toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(item);
    });
    for (const letter in groups) {
        groups[letter].sort((a, b) => a.英文.toLowerCase().localeCompare(b.英文.toLowerCase()));
    }
    return groups;
}

function getSortedLetters(groups) {
    return Object.keys(groups).sort();
}

// ---------- 按字母分页 ----------

let currentLetter = 'A';
let allWordsFlat = [];

function renderWordListByLetter() {
    const container = document.getElementById('word-list');
    if (!container) return;
    container.innerHTML = '';

    const groups = groupByFirstLetter(allWordsFlat);
    const sortedLetters = getSortedLetters(groups);

    if (!groups[currentLetter]) {
        currentLetter = sortedLetters[0];
    }

    const letter = currentLetter;
    const letterDiv = document.createElement('div');
    letterDiv.id = 'letter-' + letter;
    letterDiv.style.cssText = 'font-size:22px;font-weight:700;color:#8b6914;margin:16px 0 12px;padding-left:4px;border-bottom:2px solid rgba(180,160,130,0.4);';
    letterDiv.textContent = letter;
    container.appendChild(letterDiv);

    groups[letter].forEach(function(item) {
        const wordDiv = document.createElement('div');
        wordDiv.style.cssText = 'padding:10px 14px;margin:4px 0;background:rgba(255,253,248,0.6);border-radius:8px;cursor:pointer;transition:background 0.2s;';
        wordDiv.innerHTML = '<span style="font-weight:600;color:#2c2416;">' + item.英文 + '</span> — <span style="color:#5c5347;">' + item.中文 + '</span>';
        wordDiv.onmouseenter = function() { wordDiv.style.background = 'rgba(196,169,125,0.12)'; };
        wordDiv.onmouseleave = function() { wordDiv.style.background = 'rgba(255,253,248,0.6)'; };
        wordDiv.onclick = function() { window.location.href = '词汇详情.html?id=' + encodeURIComponent(item.id); };
        container.appendChild(wordDiv);
    });

    renderLetterPagination(sortedLetters);
}

// ---------- 字母翻页按钮 ----------

function renderLetterPagination(sortedLetters) {
    const container = document.getElementById('pagination');
    if (!container || sortedLetters.length <= 1) return;
    container.innerHTML = '';

    const currentIdx = sortedLetters.indexOf(currentLetter);

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← 上一字母';
    prevBtn.className = 'page-btn';
    prevBtn.disabled = currentIdx === 0;
    prevBtn.onclick = function() {
        if (currentIdx > 0) { currentLetter = sortedLetters[currentIdx - 1]; renderWordListByLetter(); }
    };
    container.appendChild(prevBtn);

    const span = document.createElement('span');
    span.textContent = ' ' + currentLetter + ' ';
    span.style.cssText = 'color:#8b6914;font-size:16px;font-weight:600;margin:0 12px;';
    container.appendChild(span);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '下一字母 →';
    nextBtn.className = 'page-btn';
    nextBtn.disabled = currentIdx === sortedLetters.length - 1;
    nextBtn.onclick = function() {
        if (currentIdx < sortedLetters.length - 1) { currentLetter = sortedLetters[currentIdx + 1]; renderWordListByLetter(); }
    };
    container.appendChild(nextBtn);
}

// ---------- 渲染 A-Z 导航 ----------

function renderAZNav(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const groups = groupByFirstLetter(allWordsFlat);
    const sortedLetters = getSortedLetters(groups);

    sortedLetters.forEach(function(letter) {
        const link = document.createElement('a');
        link.textContent = letter;
        link.href = '#letter-' + letter;
        link.style.cssText = 'display:inline-block;padding:5px 9px;margin:2px;color:#8b6914;text-decoration:none;font-size:14px;font-weight:500;border-radius:4px;transition:background 0.2s;';
        link.onmouseenter = function() { link.style.background = 'rgba(139,105,20,0.08)'; };
        link.onmouseleave = function() { link.style.background = 'transparent'; };
        link.onclick = function(e) {
            e.preventDefault();
            currentLetter = letter;
            renderWordListByLetter();
            document.getElementById('word-list').scrollIntoView({ behavior: 'smooth' });
        };
        container.appendChild(link);
    });
}

// ---------- 折叠 A-Z 导航 ----------

function setupAZToggle(toggleId, navId) {
    const toggle = document.getElementById(toggleId);
    const nav = document.getElementById(navId);
    if (!toggle || !nav) return;

    nav.style.display = 'none';
    toggle.textContent = '🔤 字母索引 ▸';

    toggle.onclick = function() {
        if (nav.style.display === 'none') {
            nav.style.display = 'block';
            toggle.textContent = '🔤 字母索引 ▾';
        } else {
            nav.style.display = 'none';
            toggle.textContent = '🔤 字母索引 ▸';
        }
    };
}

// ---------- 初始化 ----------

function initWordList(rawData) {
    let cleaned = removeDuplicateWords(rawData);
    cleaned = removeDuplicateIds(cleaned);
    cleaned.sort(function(a, b) {
        return a.英文.toLowerCase().localeCompare(b.英文.toLowerCase());
    });
    allWordsFlat = cleaned;

    const groups = groupByFirstLetter(allWordsFlat);
    const sortedLetters = getSortedLetters(groups);
    currentLetter = sortedLetters[0];

    renderWordListByLetter();
    setupAZToggle('az-toggle', 'az-nav');
    renderAZNav('az-nav');

    const style = document.createElement('style');
    style.textContent = '.page-btn{padding:8px 16px;background:rgba(255,253,248,0.7);border:1px solid rgba(180,160,130,0.25);border-radius:20px;cursor:pointer;font-family:"Noto Serif TC",serif;font-size:13px;color:#5c5347;letter-spacing:1px;transition:all 0.3s;}.page-btn:hover{background:rgba(180,160,130,0.12);color:#2c2416;}.page-btn:disabled{opacity:0.4;cursor:default;}';
    document.head.appendChild(style);
}

