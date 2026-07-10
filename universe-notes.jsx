import { useState, useMemo } from "react";

const GMAIL_MCP = "https://gmailmcp.googleapis.com/mcp/v1";

function trimToSignature(body) {
  const lines = body.split('\n');
  let cutAt = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*[-–—]?\s*the universe\s*$/i.test(lines[i])) {
      cutAt = i + 1;
      break;
    }
  }
  return lines.slice(0, cutAt).join('\n').trim();
}

export default function UniverseNotes() {
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const stars = useMemo(() => Array.from({ length: 130 }, (_, i) => {
    const brightness = Math.random();
    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.3 + 0.3,
      animName: brightness > 0.62 ? 'twBright' : brightness > 0.32 ? 'twMid' : 'twDim',
      dur: 2.2 + Math.random() * 4.5,
      delay: Math.random() * 9,
      blueish: Math.random() > 0.70,
    };
  }), []);

  const receive = async () => {
    setLoading(true);
    setError(null);
    setMsg(null);

    const year = 2017 + Math.floor(Math.random() * 9); // 2017–2025

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          system: `You have access to Gmail via MCP tools.
Search for an email from "Notes from the Universe" by Mike Dooley (tut.com).
Use a Gmail search like: from:tut.com after:${year}/01/01 before:${year}/12/31
If no results for ${year}, try a nearby year, or search "Notes from the Universe" in subject.
Select one email. Return ONLY a raw JSON object — no markdown, no backticks, no explanation, no preamble, nothing before the opening brace:
{"subject":"email subject","date":"Month DD, YYYY","body":"full plain-text body, HTML stripped, paragraph breaks preserved as newlines"}`,
          messages: [{ role: "user", content: `Find a Notes from the Universe email from around ${year} in my Gmail. Return only JSON.` }],
          mcp_servers: [{ type: "url", url: GMAIL_MCP, name: "gmail" }]
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "API error");

      const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON in response");

      const parsed = JSON.parse(match[0]);
      if (!parsed.body) throw new Error("No message body");
      parsed.body = trimToSignature(parsed.body);
      setMsg(parsed);
    } catch (e) {
      console.error(e);
      setError("The Universe is momentarily silent. Try again ✦");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 28% 18%, #1a0a32 0%, #070918 45%, #030710 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '3rem 1.5rem 5rem',
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#e0d4bf',
    }}>
      <style>{`
        @keyframes twBright { 0%,100%{opacity:.76} 50%{opacity:.05} }
        @keyframes twMid    { 0%,100%{opacity:.40} 50%{opacity:.03} }
        @keyframes twDim    { 0%,100%{opacity:.15} 50%{opacity:.01} }
        @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nebula   { 0%,100%{opacity:.48;transform:translate(-50%,-50%) scale(1)} 50%{opacity:.78;transform:translate(-50%,-50%) scale(1.07)} }
        @keyframes shimmer  { 0%,100%{opacity:.35} 50%{opacity:.60} }
        .u-btn { transition: transform .25s ease, box-shadow .25s ease; cursor: pointer; }
        .u-btn:not([disabled]):hover { transform: scale(1.06); box-shadow: 0 0 42px rgba(165,95,255,.58) !important; }
        .u-btn:not([disabled]):active { transform: scale(.97); }
        .u-btn[disabled] { cursor: default; opacity: .62; }
        .fadeup { animation: fadeUp .9s ease-out forwards; }
      `}</style>

      {/* Stars */}
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute', pointerEvents: 'none',
          width: s.size + 'px', height: s.size + 'px',
          borderRadius: '50%',
          background: s.blueish ? '#b5d2ff' : '#ffffff',
          top: s.y + '%', left: s.x + '%',
          opacity: 0,
          animationName: s.animName,
          animationDuration: s.dur + 's',
          animationDelay: s.delay + 's',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
        }} />
      ))}

      {/* Nebula glow */}
      <div style={{
        position: 'absolute', pointerEvents: 'none',
        width: '780px', height: '780px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(80,28,165,.14) 0%, transparent 68%)',
        top: '50%', left: '50%',
        animation: 'nebula 8s ease-in-out infinite',
      }} />

      {/* Second, offset nebula for depth */}
      <div style={{
        position: 'absolute', pointerEvents: 'none',
        width: '500px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(30,80,160,.08) 0%, transparent 70%)',
        top: '20%', right: '-10%',
        animation: 'shimmer 10s ease-in-out infinite',
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '2.3rem', marginBottom: '.45rem' }}>🌌</div>
        <p style={{
          margin: '0 0 .1rem',
          fontSize: '.74rem', letterSpacing: '.42em', textTransform: 'uppercase',
          color: '#665890',
        }}>notes from</p>
        <h1 style={{
          margin: '0 0 .55rem',
          fontSize: 'clamp(1.9rem, 6vw, 3.1rem)',
          fontWeight: 700,
          letterSpacing: '.24em',
          textTransform: 'uppercase',
          background: 'linear-gradient(130deg, #dfc858 0%, #c280f5 42%, #65c2f0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>The Universe</h1>
        <p style={{ margin: 0, fontSize: '.76rem', color: '#485068', letterSpacing: '.08em' }}>
          {msg ? 'a message has found you' : 'a message is waiting for you'}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          position: 'relative', zIndex: 1,
          textAlign: 'center', marginBottom: '2.5rem',
          color: '#a07ccc', fontSize: '.86rem', letterSpacing: '.1em',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            margin: '0 auto 1rem',
            border: '2px solid rgba(145,85,230,.14)',
            borderTopColor: 'rgba(145,85,230,.72)',
            animation: 'spin 1.1s linear infinite',
          }} />
          Listening to the Universe…
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 640, width: '100%', marginBottom: '1.5rem',
          background: 'rgba(80,10,28,.52)',
          border: '1px solid rgba(220,70,90,.2)',
          borderRadius: 12,
          padding: '1rem 1.4rem',
          color: '#df8c98',
          textAlign: 'center', fontSize: '.84rem',
        }}>
          {error}
        </div>
      )}

      {/* Message Card */}
      {msg && !loading && (
        <div className="fadeup" style={{
          position: 'relative', zIndex: 1,
          maxWidth: 660, width: '100%', marginBottom: '2rem',
          background: 'rgba(9,5,25,.82)',
          border: '1px solid rgba(140,90,228,.2)',
          borderRadius: 18,
          padding: 'clamp(1.4rem, 4vw, 2.5rem)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 55px rgba(90,35,180,.12)',
        }}>
          {/* Meta row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '.4rem',
            marginBottom: '1.2rem', paddingBottom: '1rem',
            borderBottom: '1px solid rgba(140,90,228,.14)',
          }}>
            <span style={{ fontSize: '.7rem', color: '#546080', letterSpacing: '.15em', textTransform: 'uppercase' }}>
              {msg.date}
            </span>
            {msg.subject && (
              <span style={{ fontSize: '.76rem', color: '#9878d0', fontStyle: 'italic' }}>
                {msg.subject}
              </span>
            )}
          </div>

          {/* Body */}
          <div style={{
            fontSize: 'clamp(.93rem, 2.3vw, 1.05rem)',
            lineHeight: 1.95,
            color: '#ddd0be',
            whiteSpace: 'pre-wrap',
          }}>
            {msg.body}
          </div>

          {/* Signature */}
          <div style={{
            marginTop: '1.4rem',
            textAlign: 'right',
            fontSize: '.7rem',
            color: '#4a5268',
            letterSpacing: '.14em',
          }}>
            — The Universe
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button
        className="u-btn"
        onClick={receive}
        disabled={loading}
        style={{
          position: 'relative', zIndex: 1,
          background: loading
            ? 'rgba(52,25,100,.3)'
            : 'linear-gradient(135deg, rgba(82,34,158,.58) 0%, rgba(42,102,192,.58) 100%)',
          border: '1px solid rgba(145,92,238,.36)',
          borderRadius: 50,
          padding: '.84rem 2.4rem',
          color: '#d5bcf5',
          fontSize: '.84rem',
          letterSpacing: '.2em',
          textTransform: 'uppercase',
          fontFamily: 'Georgia, serif',
          boxShadow: '0 0 24px rgba(100,40,185,.28)',
          outline: 'none',
        }}
      >
        {loading ? '✦  Listening…' : msg ? '✦  Receive Another' : '✦  Receive a Message'}
      </button>

      <p style={{
        position: 'relative', zIndex: 1,
        marginTop: '1.8rem', fontSize: '.67rem', color: '#2a2e44',
        textAlign: 'center', letterSpacing: '.06em', lineHeight: 1.6,
      }}>
        Pulling from your Gmail archive · Notes from the Universe by Mike Dooley
      </p>
    </div>
  );
}
