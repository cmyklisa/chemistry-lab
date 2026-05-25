/* =====================================================================
   本機分數紀錄系統（localStorage，不需帳號）
   每關記錄：最高分、最近五次成績（含完成時間）。
   CHEM.records.record(id, {score, time}) → { isRecord, best, history, last }
   CHEM.records.get(id) → { best, history }
   score 一律「越高越好」；time 為完成秒數（可省略）。
   ===================================================================== */
(function () {
  const PREFIX = 'chemlab.rec.';

  function load(id) {
    try { return JSON.parse(localStorage.getItem(PREFIX + id)) || { best: null, history: [] }; }
    catch (e) { return { best: null, history: [] }; }
  }
  function save(id, d) { try { localStorage.setItem(PREFIX + id, JSON.stringify(d)); } catch (e) {} }

  function record(id, entry) {
    const d = load(id);
    const e = { score: Math.round(entry.score || 0), time: entry.time != null ? Math.round(entry.time) : null, ts: Date.now() };
    d.history.push(e);
    if (d.history.length > 5) d.history = d.history.slice(-5);
    let isRecord = false;
    if (!d.best || e.score > d.best.score) { isRecord = true; d.best = e; }
    save(id, d);
    return { isRecord, best: d.best, history: d.history, last: e };
  }

  function get(id) { return load(id); }

  window.CHEM = window.CHEM || {};
  window.CHEM.records = { record, get };
})();
