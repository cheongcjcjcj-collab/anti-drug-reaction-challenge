"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Drug = {
  name: string;
  image: string;
  harm: string;
};

const DRUGS: Drug[] = [
  { name: "依托咪酯", image: "/drugs/依托咪酯.jpg", harm: "可引致失去知覺、抽搐、失憶，甚至昏迷。" },
  { name: "迷幻蘑菇", image: "/drugs/迷幻蘑菇.jpg", harm: "會扭曲感官及判斷，可能令人產生幻覺。" },
  { name: "大麻", image: "/drugs/大麻.jpg", harm: "可能影響記憶、反應及判斷能力。" },
  { name: "搖頭丸（MDMA）", image: "/drugs/搖頭丸MDMA.jpg", harm: "可導致身體過熱、脫水、抽搐及精神混亂。" },
  { name: "冰毒", image: "/drugs/冰毒.jpg", harm: "可引致失眠、焦慮、心跳異常及依賴。" },
  { name: "咳水", image: "/drugs/咳水.jpg", harm: "咳藥應按醫囑使用；濫用可引致神志不清、呼吸減慢及成癮。" },
];

const SUPPORTS = [
  { name: "踢足球", icon: "⚽", note: "運動可以係健康出口" },
  { name: "跑步", icon: "🏃", note: "用運動整理情緒同壓力" },
  { name: "打籃球", icon: "🏀", note: "同隊友一齊郁動，建立連結" },
  { name: "做伸展", icon: "🙆", note: "放鬆繃緊嘅身體" },
  { name: "聽音樂", icon: "🎧", note: "搵適合自己嘅放鬆方法" },
  { name: "做靜觀", icon: "🧘", note: "停一停，留意呼吸同當下" },
  { name: "慢慢呼吸", icon: "🌬️", note: "幫自己穩定下來再決定" },
  { name: "飲水休息", icon: "💧", note: "先照顧身體嘅基本需要" },
  { name: "食一餐", icon: "🍚", note: "保持基本生活同體力" },
  { name: "規律睡眠", icon: "😴", note: "休息有助情緒同判斷" },
  { name: "做喜歡嘅活動", icon: "🎨", note: "用安全興趣轉換心情" },
  { name: "可信任朋友", icon: "🤝", note: "有人同行，選擇可以更清晰" },
  { name: "同隊友同行", icon: "👥", note: "互相提醒，唔使一個人面對" },
  { name: "家人支援", icon: "🏠", note: "有需要時可以向家人求助" },
  { name: "老師／社工", icon: "💬", note: "遇到風險，可以搵可信任成年人" },
  { name: "醫護支援", icon: "🩺", note: "身體或精神不適要盡快求助" },
  { name: "打電話求助", icon: "📞", note: "情況危急時主動聯絡支援" },
  { name: "去安全地方", icon: "🛟", note: "先保障自己，再處理下一步" },
  { name: "離開現場", icon: "🚪", note: "感到唔安全，先離開係一個選擇" },
];

const MYTHS = [
  { name: "試一次冇事", icon: "一次" },
  { name: "朋友食過一定安全", icon: "朋友" },
  { name: "有包裝就代表可靠", icon: "包裝" },
  { name: "少量就一定安全", icon: "少量" },
  { name: "後生身體一定頂得住", icon: "後生" },
  { name: "有朋友睇住就唔會出事", icon: "睇住" },
  { name: "靠意志可以隨時停", icon: "意志" },
  { name: "免費試食冇問題", icon: "免費" },
  { name: "幫朋友保管唔關自己事", icon: "保管" },
  { name: "混合酒精會更安全", icon: "混合" },
  { name: "睇外觀就知真正成分", icon: "外觀" },
  { name: "唔舒服瞓一覺就一定冇事", icon: "瞓覺" },
  { name: "只影響身體，唔影響情緒", icon: "情緒" },
  { name: "電子煙形式就冇風險", icon: "電子煙" },
  { name: "唔上癮就唔會有傷害", icon: "上癮" },
];

type Question =
  | { type: "photo"; drug: Drug; choices: string[] }
  | { type: "harm"; drug: Drug; choices: string[]; answer: string }
  | { type: "law"; title: string; choices: string[]; answer: string; explanation: string }
  | { type: "scenario"; choices: string[]; answer: string };

type BoardEntry = { name: string; score: number; mode: string; at: number };
type Reminder = { text: string; image?: string };

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeQuestions(): Question[] {
  const selected = shuffle(DRUGS).slice(0, 2);
  const photoQuestions: Question[] = selected.map((drug) => ({
    type: "photo",
    drug,
    choices: shuffle([
      drug.name,
      ...shuffle(DRUGS.filter((item) => item.name !== drug.name)).slice(0, 2).map((item) => item.name),
    ]),
  }));
  const hallucinationQuestion: Question = {
    type: "harm",
    drug: DRUGS.find((drug) => drug.name === "冰毒")!,
    answer: "幻覺可能連同焦慮、被害感及判斷失準一齊出現。",
    choices: shuffle([
      "幻覺可能連同焦慮、被害感及判斷失準一齊出現。",
      "幻覺只係短暫有趣畫面，不會影響行為。",
      "只要保持清醒，就一定可以控制所有反應。",
    ]),
  };
  const healthDrug = shuffle(DRUGS.filter((drug) => drug.name !== "冰毒"))[0];
  const healthQuestion: Question = {
    type: "harm",
    drug: healthDrug,
    answer: healthDrug.harm,
    choices: shuffle([
      healthDrug.harm,
      "只要份量少，就不會影響身體或情緒。",
      "有熟人陪同，就可以消除所有健康風險。",
    ]),
  };
  const possessionQuestion: Question = {
    type: "law",
    title: "在香港非法管有或吸食危險藥物，最高刑罰係？",
    answer: "罰款港幣100萬元及監禁7年",
    choices: shuffle(["罰款港幣100萬元及監禁7年", "只會口頭警告", "最多罰款港幣5,000元"]),
    explanation: "呢個係法例訂明嘅最高刑罰；實際判刑會由法庭按個別案情決定。",
  };
  const traffickingQuestion: Question = {
    type: "law",
    title: "販運或製造危險藥物，最高刑罰係？",
    answer: "罰款港幣500萬元及終身監禁",
    choices: shuffle(["罰款港幣500萬元及終身監禁", "監禁最多6個月", "只需交出物品，不會被檢控"]),
    explanation: "替人收藏、運送或交收可疑物品都可能帶來嚴重法律風險；切勿因人情或報酬代為處理。",
  };
  const scenarioQuestion: Question = {
    type: "scenario",
    answer: "唔使預我，我真係唔玩呢樣。",
    choices: shuffle([
      "唔使預我，我真係唔玩呢樣。",
      "怕尷尬，所以先試一次。",
      "先收低毒品，遲啲先決定。",
    ]),
  };
  const riskQuestion = shuffle([hallucinationQuestion, healthQuestion])[0];
  const lawQuestion = shuffle([possessionQuestion, traffickingQuestion])[0];
  return shuffle([...photoQuestions, riskQuestion, lawQuestion, scenarioQuestion]);
}

export default function Home() {
  const [screen, setScreen] = useState<"home" | "detective" | "reaction" | "result" | "board">("home");
  const [player, setPlayer] = useState("");
  const [pendingMode, setPendingMode] = useState<"detective" | "reaction" | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [detectiveScore, setDetectiveScore] = useState(0);
  const [detectiveMistakes, setDetectiveMistakes] = useState<Reminder[]>([]);
  const [completedModes, setCompletedModes] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState({ mode: "", score: 0, detail: "", reminders: [] as Reminder[], allCompleted: false });
  const [leaderboard, setLeaderboard] = useState<BoardEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("anti-drug-board") || "[]"); }
    catch { return []; }
  });

  const saveScore = useCallback((score: number, mode: string, detail: string, reminders: Reminder[] = []) => {
    const entry = { name: player.trim() || "神秘偵探", score, mode, at: Date.now() };
    setLeaderboard((current) => {
      const next = [...current, entry].sort((a, b) => b.score - a.score).slice(0, 20);
      localStorage.setItem("anti-drug-board", JSON.stringify(next));
      return next;
    });
    const nextCompleted = [...new Set([...completedModes, mode])];
    setCompletedModes(nextCompleted);
    setResult({ mode, score, detail, reminders: reminders.filter((reminder, index, all) => all.findIndex((item) => item.text === reminder.text) === index).slice(0, 4), allCompleted: nextCompleted.length === 2 });
    setScreen("result");
  }, [player, completedModes]);

  const requestStart = (mode: "detective" | "reaction") => {
    setPendingMode(mode);
    if (player.trim()) startMode(mode);
  };

  const startMode = (mode: "detective" | "reaction") => {
    setPendingMode(null);
    if (mode === "detective") {
      setQuestions(makeQuestions());
      setQuestionIndex(0);
      setDetectiveScore(0);
      setDetectiveMistakes([]);
      setSelectedAnswer(null);
      setScreen("detective");
    } else {
      setScreen("reaction");
    }
  };

  const goHome = () => {
    setScreen("home");
    setPendingMode(null);
  };

  const nextPlayer = () => {
    setPlayer("");
    setCompletedModes([]);
    setPendingMode(null);
    setScreen("home");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={goHome} aria-label="返回主頁">
          <span className="brand-mark">玩</span>
          <span><strong>攤位互動遊戲</strong><small>邊玩邊學 · 完成有禮</small></span>
        </button>
        <div className="top-actions">
          <button className="ghost-button" onClick={() => setScreen("board")}>🏆 今日榜</button>
          <button className="ghost-button" onClick={toggleFullscreen}>⛶ 全螢幕</button>
        </div>
      </header>

      {screen === "home" && (
        <section className="home-screen">
          <div className="hero-copy">
            <p className="eyebrow">青怡中心 · 互動挑戰</p>
            <h1>睇清楚，<br /><span>識得揀！</span></h1>
            <p className="hero-intro">由外觀、幻覺風險到法律後果，兩個互動挑戰考你點樣喺壓力下睇清楚、識選擇。</p>
            <div className="hero-pills"><span>🔎 辨風險</span><span>⚖️ 識法律</span><span>⚡ 考反應</span></div>
            <div className="risk-signal"><span>感官失真 ≠ 有趣體驗</span><strong>幻覺亦可能伴隨焦慮、被害感、混亂同判斷失準。</strong></div>
            <div className="hero-reward"><span>🎁</span><strong>完成兩個挑戰<br />即可換領小禮物</strong></div>
          </div>
          <div className="game-grid">
            <div className="game-grid-label"><span>{completedModes.length ? "繼續下一關" : "揀一個開始"}</span><b>完成進度 {completedModes.length} / 2</b></div>
            <button className="game-card detective-card" onClick={() => requestStart("detective")}>
              <span className="card-number">01</span>
              <span className="card-icon">🔎</span>
              <span className="card-copy"><strong>毒品偵探</strong><small>辨外觀 · 拆解幻覺風險 · 認識法律後果</small></span>
              <span className="play-pill">開始挑戰 <b>→</b></span>
            </button>
            <button className="game-card reaction-card" onClick={() => requestStart("reaction")}>
              <span className="card-number">02</span>
              <span className="card-icon">⚡</span>
              <span className="card-copy"><strong>守住支援</strong><small>30秒拍走陷阱，保住健康選擇</small></span>
              <span className="play-pill">開始拍擊 <b>→</b></span>
            </button>
          </div>
          <p className="safety-note">相片只供教育用途。物質外觀及成分可以改變，切勿單靠外觀判斷。</p>
        </section>
      )}

      {pendingMode && screen === "home" && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="輸入暱稱">
          <div className="name-modal">
            <span className="modal-icon">🕵️</span>
            <h2>準備好未？</h2>
            <p>輸入暱稱，完成後可以登上今日榜。</p>
            <input autoFocus type="text" inputMode="text" enterKeyHint="go" maxLength={12} value={player} onInput={(e) => setPlayer(e.currentTarget.value)} placeholder="例如：反應王" aria-label="玩家暱稱" onKeyDown={(e) => e.key === "Enter" && e.currentTarget.value.trim() && startMode(pendingMode)} />
            <button className="primary-button" disabled={!player.trim()} onClick={() => startMode(pendingMode)}>開始遊戲</button>
            <button className="text-button" onClick={() => setPendingMode(null)}>返回</button>
          </div>
        </div>
      )}

      {screen === "detective" && questions.length > 0 && (
        <DetectiveGame
          question={questions[questionIndex]}
          index={questionIndex}
          total={questions.length}
          selected={selectedAnswer}
          onSelect={(answer, correct) => {
            if (selectedAnswer) return;
            setSelectedAnswer(answer);
            if (correct) setDetectiveScore((value) => value + 1);
            else setDetectiveMistakes((current) => [...current, getQuestionReminder(questions[questionIndex])]);
          }}
          onNext={() => {
            if (questionIndex === questions.length - 1) {
              const finalScore = detectiveScore;
              saveScore(Math.round((finalScore / questions.length) * 100), "毒品偵探", `答啱 ${finalScore} / ${questions.length} 題`, detectiveMistakes);
            } else {
              setQuestionIndex((value) => value + 1);
              setSelectedAnswer(null);
            }
          }}
          onExit={goHome}
        />
      )}

      {screen === "reaction" && <ReactionGame onFinish={(score, detail, reminders) => saveScore(score, "守住支援", detail, reminders)} onExit={goHome} />}

      {screen === "result" && (
        <section className={`result-screen ${result.allCompleted ? "completed-screen" : ""}`}>
          <div className="result-summary">
            <div className="result-burst">★</div>
            <p className="eyebrow">{result.allCompleted ? "MISSION COMPLETE · 兩關完成" : "挑戰完成"}</p>
            <h1>{result.score >= 80 ? "冷靜判斷王" : result.score >= 50 ? "風險觀察員" : "反應練習生"}</h1>
            <div className="score-ring"><strong>{result.score}</strong><span>分</span></div>
            <p className="result-detail">{result.detail}</p>
            {result.reminders.length > 0 && <div className="gentle-reminders"><strong>唔緊要，呢幾張卡可以再留意：</strong><ul>{result.reminders.map((reminder) => <li key={reminder.text} className={reminder.image ? "photo-reminder" : ""}>{reminder.image && <img src={reminder.image} alt="錯題相片縮圖" />}<span>{reminder.text}</span></li>)}</ul></div>}
            <div className="takeaway"><span>記住</span><p>來源不明嘅物質，單靠外觀無法確認。停一停、離開現場、搵可信任嘅人，都係保護自己嘅方法。</p></div>
          </div>
          {result.allCompleted ? <div className="reward-panel">
            <div className="reward-heading"><div className="gift-icon">🎁</div><div><p className="eyebrow">獎勵已解鎖</p><h2>向工作人員<br />換領小禮物</h2></div><span className="claim-tag">出示此畫面</span></div>
            <div className="follow-heading"><span>保持聯絡</span><p>掃描 QR Code，睇更多健康資訊同中心活動。</p></div>
            <div className="qr-grid" aria-label="青怡中心社交平台及網頁 QR Code">
              <div className="qr-card"><div className="qr-crop qr-ig" role="img" aria-label="青怡中心 Instagram QR Code" /><strong>Instagram</strong><small>追蹤最新動態</small></div>
              <div className="qr-card"><div className="qr-crop qr-fb" role="img" aria-label="青怡中心 Facebook QR Code" /><strong>Facebook</strong><small>活動及資訊</small></div>
              <div className="qr-card"><div className="qr-crop qr-web" role="img" aria-label="青怡中心網頁 QR Code" /><strong>中心網頁</strong><small>了解服務</small></div>
            </div>
          </div> : <div className="continue-panel"><span>完成進度　1 / 2</span><strong>仲有一個遊戲！</strong><p>完成埋另一個挑戰，就可以換領小禮物。</p><button className="primary-button" onClick={() => startMode(result.mode === "毒品偵探" ? "reaction" : "detective")}>挑戰另一個遊戲 →</button></div>}
          <div className="result-actions">
            <button className="primary-button" onClick={() => startMode(result.mode === "毒品偵探" ? "detective" : "reaction")}>再玩一次</button>
            <button className="secondary-button" onClick={result.allCompleted ? nextPlayer : goHome}>{result.allCompleted ? "下一位" : "返回主頁"}</button>
          </div>
        </section>
      )}

      {screen === "board" && (
        <section className="board-screen">
          <button className="back-button" onClick={goHome}>← 返回主頁</button>
          <p className="eyebrow">本機紀錄</p>
          <h1>今日挑戰榜</h1>
          <div className="board-list">
            {leaderboard.length === 0 ? <p className="empty-board">未有人完成挑戰，等你做第一位！</p> : leaderboard.map((entry, index) => (
              <div className="board-row" key={`${entry.at}-${index}`}>
                <span className="rank">{index < 3 ? ["🥇", "🥈", "🥉"][index] : index + 1}</span>
                <strong>{entry.name}</strong><small>{entry.mode}</small><b>{entry.score} 分</b>
              </div>
            ))}
          </div>
          {leaderboard.length > 0 && <button className="text-button danger" onClick={() => { localStorage.removeItem("anti-drug-board"); setLeaderboard([]); }}>清除本機紀錄</button>}
        </section>
      )}

      <footer>內容參考：香港保安局禁毒處　·　本遊戲只作教育用途</footer>
    </main>
  );
}

function getQuestionReminder(question: Question) {
  if (question.type === "photo") return { text: `相片題嘅答案係「${question.drug.name}」。不過單靠外觀，仍然未必能確定成分。`, image: question.drug.image };
  if (question.type === "harm") return { text: `「${question.drug.name}」可能帶來身體或精神健康風險。` };
  if (question.type === "law") return { text: `${question.title} 答案係「${question.answer}」。呢個係最高刑罰，實際判刑按個別案情決定。` };
  return { text: "朋友邀請時，可以清楚講：「唔使預我，我真係唔玩呢樣。」" };
}

function DetectiveGame({ question, index, total, selected, onSelect, onNext, onExit }: {
  question: Question; index: number; total: number; selected: string | null;
  onSelect: (answer: string, correct: boolean) => void; onNext: () => void; onExit: () => void;
}) {
  const correctAnswer = question.type === "photo" ? question.drug.name : question.answer;
  const heading = question.type === "photo" ? "呢張相片最可能係咩？" : question.type === "harm" ? `以下邊項係「${question.drug.name}」嘅相關風險？` : question.type === "law" ? question.title : "朋友話：「大家都試過啦，唔使驚。」你會點回應？";
  return (
    <section className="game-screen">
      <div className="game-head">
        <button className="back-button" onClick={onExit}>× 離開</button>
        <div className="progress-wrap"><span>第 {index + 1} / {total} 題</span><div className="progress"><i style={{ width: `${((index + 1) / total) * 100}%` }} /></div></div>
        <span className="mode-label">毒品偵探</span>
      </div>
      <div className={`question-layout ${question.type !== "photo" ? "no-photo" : ""}`}>
        {question.type === "photo" && <div className="photo-frame"><img src={question.drug.image} alt="待辨認的物品" /></div>}
        {question.type === "harm" && <div className="prompt-visual">⚠️<small>風險判斷</small></div>}
        {question.type === "law" && <div className="prompt-visual law-visual">⚖️<small>法律界線</small><b>一時代收<br />都可能出事</b></div>}
        {question.type === "scenario" && <div className="speech-card"><span>朋友</span><p>「大家都試過啦，<br />唔使驚。」</p></div>}
        <div className="question-panel">
          <p className="question-type">{question.type === "photo" ? "認外觀" : question.type === "harm" ? "識禍害" : question.type === "law" ? "識法律" : "練習拒絕"}</p>
          <h2>{heading}</h2>
          <div className="answer-list">
            {question.choices.map((choice) => {
              const correct = choice === correctAnswer;
              const chosen = selected === choice;
              return <button key={choice} disabled={!!selected} className={`${selected ? (correct ? "correct" : chosen ? "wrong" : "dim") : ""}`} onClick={() => onSelect(choice, correct)}><span>{choice}</span>{selected && correct && <b>✓</b>}{selected && chosen && !correct && <b>×</b>}</button>;
            })}
          </div>
          {selected && <div className={`feedback ${selected === correctAnswer ? "good" : "learn"}`}><strong>{selected === correctAnswer ? "答啱！" : `正確答案：${correctAnswer}`}</strong><p>{question.type === "photo" ? `${question.drug.harm} 但物質外觀可以改變，單靠相片不能確定成分。` : question.type === "scenario" ? "清楚拒絕之外，亦可以離開現場，或者搵可信任嘅人支援。" : question.type === "law" ? question.explanation : "毒品可能同時影響感官、情緒、判斷、身體控制同日常生活。"}</p><button className="primary-button" onClick={onNext}>{index === total - 1 ? "查看結果" : "下一題"}</button></div>}
        </div>
      </div>
    </section>
  );
}

type ReactionItem = { kind: "risk" | "support"; name: string; image?: string; icon?: string; note: string };

function ReactionGame({ onFinish, onExit }: { onFinish: (score: number, detail: string, reminders: Reminder[]) => void; onExit: () => void }) {
  const [phase, setPhase] = useState<"intro" | "play">("intro");
  const [time, setTime] = useState(30);
  const [item, setItem] = useState<ReactionItem | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [protectedCount, setProtectedCount] = useState(0);
  const [mistakes, setMistakes] = useState<Reminder[]>([]);
  const [flash, setFlash] = useState("");
  const finished = useRef(false);
  const answerLock = useRef(false);
  const servedKinds = useRef({ risk: 0, support: 0 });
  const usedItems = useRef<{ risk: string[]; support: string[] }>({ risk: [], support: [] });

  const makeItem = useCallback((): ReactionItem => {
    const pool: ReactionItem[] = [
      ...DRUGS.map((drug) => ({ kind: "risk" as const, name: drug.name, image: drug.image, note: "來源不明物質／毒品風險" })),
      ...MYTHS.map((myth) => ({ kind: "risk" as const, name: myth.name, icon: myth.icon, note: "" })),
      ...SUPPORTS.map((support) => ({ kind: "support" as const, name: support.name, icon: support.icon, note: support.note })),
    ];
    const { risk, support } = servedKinds.current;
    const targetKind: ReactionItem["kind"] = risk === support
      ? (Math.random() < 0.5 ? "risk" : "support")
      : (risk < support ? "risk" : "support");
    const sameKind = pool.filter((candidate) => candidate.kind === targetKind);
    let choices = sameKind.filter((candidate) => !usedItems.current[targetKind].includes(candidate.name));
    if (!choices.length) {
      usedItems.current[targetKind] = [];
      choices = sameKind;
    }
    const chosen = choices[Math.floor(Math.random() * choices.length)];
    usedItems.current[targetKind].push(chosen.name);
    servedKinds.current[targetKind] += 1;
    return chosen;
  }, []);

  useEffect(() => {
    if (phase !== "play") return;
    const clock = window.setInterval(() => setTime((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(clock);
  }, [phase]);

  useEffect(() => {
    if (phase === "play" && time === 0 && !finished.current) {
      finished.current = true;
      const accuracy = correct + wrong === 0 ? 0 : Math.round((correct / (correct + wrong)) * 100);
      onFinish(Math.max(0, score), `答啱 ${correct} 題 · 留低 ${protectedCount} 項支援 · 準確率 ${accuracy}%`, mistakes);
    }
  }, [time, phase, correct, wrong, score, protectedCount, mistakes, onFinish]);

  const choose = (action: "keep" | "remove") => {
    if (!item || answerLock.current || time === 0) return;
    answerLock.current = true;
    const isRight = (action === "keep" && item.kind === "support") || (action === "remove" && item.kind === "risk");
    if (isRight) {
      setScore((value) => value + 5);
      setCorrect((value) => value + 1);
      if (item.kind === "support") setProtectedCount((value) => value + 1);
      setFlash(action === "keep" ? "+5 留低支援" : "+5 拍走陷阱");
    } else {
      setScore((value) => Math.max(0, value - 3));
      setWrong((value) => value + 1);
      setMistakes((current) => [...current, {
        text: item.kind === "support" ? `「${item.name}」係支援，下次可以放心留低。` : `「${item.name}」係風險或迷思，下次記得拍走。`,
        image: item.image,
      }]);
      setFlash(item.kind === "support" ? "呢個係支援，應該留低！" : "呢個係風險，應該拍走！");
    }
    window.setTimeout(() => {
      setItem(makeItem());
      setFlash("");
      answerLock.current = false;
    }, 230);
  };

  if (phase === "intro") return <section className="reaction-intro"><button className="back-button" onClick={onExit}>← 返回</button><div className="intro-card"><p className="eyebrow">30秒反應挑戰</p><h1>守住支援<br /><span>拍走陷阱</span></h1><div className="rule-grid"><div className="rule support-rule"><b>見到健康／支援</b><strong>撳「留低」</strong></div><div className="rule risk-rule"><b>見到風險／迷思</b><strong>撳「拍走」</strong></div></div><p className="intro-hint">兩類題目比例相若。答啱 +5 分，答錯 −3 分；睇清楚，快啲決定！</p><button className="primary-button jumbo" onClick={() => { finished.current = false; answerLock.current = false; servedKinds.current = { risk: 0, support: 0 }; usedItems.current = { risk: [], support: [] }; setMistakes([]); setItem(makeItem()); setPhase("play"); }}>3、2、1，開始！</button></div></section>;

  return (
    <section className="reaction-play">
      <div className="reaction-stats"><button className="back-button" onClick={onExit}>× 離開</button><div><small>時間</small><strong>{time}</strong></div><div><small>分數</small><strong>{score}</strong></div></div>
      <div className="arena">
        <div className="arena-instruction">左：留低　·　右：拍走</div>
        {item && <div className={`target ${item.kind}`}>{item.image ? <img src={item.image} alt={item.name} /> : <span className={item.kind === "risk" ? "myth-icon" : "support-icon"}>{item.icon}</span>}<strong>{item.name}</strong>{item.note && <small>{item.note}</small>}</div>}
        {flash && <div className="flash-message">{flash}</div>}
        <div className="choice-buttons" aria-label="選擇處理方法">
          <button className="keep-button" onPointerDown={() => choose("keep")}><span>←</span> 留低</button>
          <button className="remove-button" onPointerDown={() => choose("remove")}>拍走 <span>→</span></button>
        </div>
      </div>
    </section>
  );
}
