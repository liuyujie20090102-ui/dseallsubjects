
// ==========================================
// 词汇工具.js — DSE 词汇库公共逻辑
// 所有主题共用此文件
// ==========================================

// ---------- 去重函数 ----------

// 英文单词去重：重复的英文单词只保留第一条
function removeDuplicateWords(wordList) {
    const seen = new Set();
    return wordList.filter(item => {
        const key = item.英文.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

// id去重检查：重复id在控制台弹出警告，只保留第一条
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
    // 每组内部按英文排序
    for (const letter in groups) {
        groups[letter].sort((a, b) => a.英文.toLowerCase().localeCompare(b.英文.toLowerCase()));
    }
    return groups;
}

// ---------- 获取排序后的字母列表 ----------

function getSortedLetters(groups) {
    return Object.keys(groups).sort();
}

// ---------- 分页 ----------

const WORDS_PER_PAGE = 20;
let currentPage = 1;
let totalPages = 1;
let allWordsFlat = []; // 去重排序后的扁平词汇列表

function paginate(wordList, page) {
    const start = (page - 1) * WORDS_PER_PAGE;
    return wordList.slice(start, start + WORDS_PER_PAGE);
}

// ---------- 渲染分页按钮 ----------

function renderPagination(totalWords, containerId) {
    totalPages = Math.ceil(totalWords / WORDS_PER_PAGE);
    const container = document.getElementById(containerId);
    if (!container || totalPages <= 1) return;
    container.innerHTML = '';
    // 上一页
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← 上一頁';
    prevBtn.className = 'page-btn';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderWordList(); } };
    container.appendChild(prevBtn);
    // 页码
    const span = document.createElement('span');
    span.textContent = ' 第 ' + currentPage + ' 頁 / 共 ' + totalPages + ' 頁 ';
    span.style.cssText = 'color:#5c5347;font-size:14px;margin:0 12px;';
    container.appendChild(span);
    // 下一页
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '下一頁 →';
    nextBtn.className = 'page-btn';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderWordList(); } };
    container.appendChild(nextBtn);
}

// ---------- 渲染词汇列表 ----------

function renderWordList() {
    const container = document.getElementById('word-list');
    if (!container) return;
    container.innerHTML = '';
    const pageWords = paginate(allWordsFlat, currentPage);
    const groups = groupByFirstLetter(pageWords);
    const sortedLetters = getSortedLetters(groups);
    sortedLetters.forEach(letter => {
        // 字母标题
        const letterDiv = document.createElement('div');
        letterDiv.id = 'letter-' + letter;
        letterDiv.style.cssText = 'font-size:18px;font-weight:700;color:#8b6914;margin:20px 0 8px;padding-left:4px;border-bottom:1px solid rgba(180,160,130,0.3);';
        letterDiv.textContent = letter;
        container.appendChild(letterDiv);
        // 词汇列表
        groups[letter].forEach(item => {
            const wordDiv = document.createElement('div');
            wordDiv.style.cssText = 'padding:8px 12px;margin:4px 0;background:rgba(255,253,248,0.6);border-radius:8px;cursor:pointer;transition:background 0.2s;';
            wordDiv.innerHTML = '<span style="font-weight:600;color:#2c2416;">' + item.英文 + '</span> — <span style="color:#5c5347;">' + item.中文 + '</span>';
            wordDiv.onmouseenter = () => { wordDiv.style.background = 'rgba(196,169,125,0.1)'; };
            wordDiv.onmouseleave = () => { wordDiv.style.background = 'rgba(255,253,248,0.6)'; };
            wordDiv.onclick = () => { window.location.href = '词汇详情.html?id=' + encodeURIComponent(item.id); };
            container.appendChild(wordDiv);
        });
    });
    renderPagination(allWordsFlat.length, 'pagination');
}

// ---------- 渲染 A-Z 导航 ----------

function renderAZNav(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const groups = groupByFirstLetter(allWordsFlat);
    const sortedLetters = getSortedLetters(groups);
    sortedLetters.forEach(letter => {
        const link = document.createElement('a');
        link.textContent = letter;
        link.href = '#letter-' + letter;
        link.style.cssText = 'display:inline-block;padding:4px 8px;margin:2px;color:#8b6914;text-decoration:none;font-size:14px;font-weight:500;border-radius:4px;transition:background 0.2s;';
        link.onmouseenter = () => { link.style.background = 'rgba(139,105,20,0.08)'; };
        link.onmouseleave = () => { link.style.background = 'transparent'; };
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
    toggle.onclick = () => {
        if (nav.style.display === 'none') {
            nav.style.display = 'block';
            toggle.textContent = '🔤 字母索引 ▾';
        } else {
            nav.style.display = 'none';
            toggle.textContent = '🔤 字母索引 ▸';
        }
    };
}

// ---------- 初始化函数（列表页调用） ----------

function initWordList(rawData) {
    // 去重
    let cleaned = removeDuplicateWords(rawData);
    cleaned = removeDuplicateIds(cleaned);
    // 按英文排序
    cleaned.sort((a, b) => a.英文.toLowerCase().localeCompare(b.英文.toLowerCase()));
    allWordsFlat = cleaned;
    currentPage = 1;
    renderWordList();
    renderAZNav('az-nav');
    setupAZToggle('az-toggle', 'az-nav');
    // 翻页按钮样式
    const style = document.createElement('style');
    style.textContent = '.page-btn{padding:8px 16px;background:rgba(255,253,248,0.7);border:1px solid rgba(180,160,130,0.25);border-radius:20px;cursor:pointer;font-family:"Noto Serif TC",serif;font-size:13px;color:#5c5347;letter-spacing:1px;transition:all 0.3s;}.page-btn:hover{background:rgba(180,160,130,0.12);color:#2c2416;}.page-btn:disabled{opacity:0.4;cursor:default;}';
    document.head.appendChild(style);
}
