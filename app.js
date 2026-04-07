const PREFIX = "ps-pro-";
const CHUNK_SIZE = 16384;
let peer, conn, startTime;
let fileQueue = [],
  isProcessing = false;
let receivedChunks = [],
  incomingMeta = null;
let statsFiles = 0,
  statsBytes = 0;

// Resolve promise used for "Flow Control"
let resolveNextChunk = null;

peer = new Peer(PREFIX + Math.floor(1000 + Math.random() * 9000), {
  config: { iceServers: [{ url: "stun:stun.l.google.com:19302" }] },
});

peer.on(
  "open",
  (id) =>
    (document.getElementById("my-pin").innerText = id.replace(PREFIX, "")),
);
peer.on("connection", (c) => {
  conn = c;
  setupLink();
});

function connectToPeer() {
  const p = document.getElementById("peer-pin").value;
  if (p) {
    conn = peer.connect(PREFIX + p, { reliable: true });
    setupLink();
  }
}

function setupLink() {
  conn.on("open", () => {
    document.getElementById("setup-view").classList.add("hidden");
    document.getElementById("main-view").classList.remove("hidden");
  });

  conn.on("data", async (data) => {
    if (data.type === "TEXT") {
      if (data.content === "NEXT" && resolveNextChunk) {
        // PC said "I'm ready", let the phone send the next piece
        resolveNextChunk();
      } else if (confirm(`RECEIVED: ${data.content}`)) {
        navigator.clipboard.writeText(data.content);
      }
    } else if (data.type === "START") {
      receivedChunks = [];
      incomingMeta = data;
      document.getElementById("stats-panel").classList.remove("hidden");
      document.getElementById("file-status").innerText = "INCOMING...";
    } else if (data.type === "CHUNK") {
      receivedChunks.push(data.chunk);
      updateStats(receivedChunks.length, incomingMeta.total, incomingMeta.size);

      // CRITICAL: Tell the sender we received this chunk and are ready for the next
      conn.send({ type: "TEXT", content: "NEXT" });

      if (receivedChunks.length === incomingMeta.total) saveFile();
    }
  });
}

async function handleFiles(files) {
  if (!conn) return alert("Not connected!");
  for (let f of files) fileQueue.push({ file: f, status: "WAIT" });
  renderQueue();
  if (!isProcessing) processBatch();
}

async function processBatch() {
  if (fileQueue.length === 0) return (isProcessing = false);
  isProcessing = true;
  const current = fileQueue[0];
  current.status = "SENDING";
  renderQueue();

  await streamFile(current.file);

  await new Promise((r) => setTimeout(r, 1000));
  fileQueue.shift();
  processBatch();
}

async function streamFile(file) {
  document.getElementById("stats-panel").classList.remove("hidden");
  document.getElementById("file-status").innerText = "UPLOADING...";
  startTime = Date.now();
  const total = Math.ceil(file.size / CHUNK_SIZE);

  conn.send({ type: "START", name: file.name, total: total, size: file.size });

  for (let i = 0; i < total; i++) {
    // 1. Create a promise that waits for the "NEXT" message from the PC
    const waitPass = new Promise((resolve) => {
      resolveNextChunk = resolve;
    });

    const chunk = await file
      .slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      .arrayBuffer();
    conn.send({ type: "CHUNK", chunk: chunk });

    // 2. PAUSE here until the PC confirms receipt of the last chunk
    // This makes it impossible to overflow the buffer.
    await waitPass;

    if (i % 15 === 0) updateStats(i, total, file.size);
  }
  updateStats(total, total, file.size);
  updateGlobal(1, file.size);
}

function updateStats(curr, total, size) {
  const p = Math.round((curr / total) * 100);
  document.getElementById("bar").style.width = p + "%";
  document.getElementById("percent").innerText = p + "%";
  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed > 0) {
    const mbps = ((curr * CHUNK_SIZE) / elapsed / 1024 / 1024).toFixed(1);
    document.getElementById("speed").innerText = `${mbps} MB/s`;
  }
}

function updateGlobal(f, b) {
  statsFiles += f;
  statsBytes += b;
  document.getElementById("session-info").innerText =
    `${statsFiles} Files (${(statsBytes / 1024 / 1024).toFixed(1)} MB)`;
}

function saveFile() {
  const b = new Blob(receivedChunks);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(b);
  a.download = incomingMeta.name;
  a.click();
  updateGlobal(1, incomingMeta.size);
  document.getElementById("file-status").innerText = "FINISHED";
}

function renderQueue() {
  document.getElementById("file-queue").innerHTML = fileQueue
    .map(
      (i) => `
        <div class="q-item"><span>${i.file.name.slice(0, 20)}</span><span class="q-status">${i.status}</span></div>
    `,
    )
    .join("");
}

function switchTab(t) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.toggle("active", b.id.includes(t)));
  document
    .getElementById("pane-files")
    .classList.toggle("hidden", t !== "files");
  document.getElementById("pane-text").classList.toggle("hidden", t !== "text");
}
