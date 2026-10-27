const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const outputDir = path.resolve(__dirname, "../demo-media");
const outputFile = path.join(outputDir, "kijani-solar-tour.webm");
const html = `<!doctype html>
<meta charset="utf-8"><title>Investor Mtaani demo video fixture</title>
<style>body{font:16px system-ui;background:#08111f;color:#e7edf5;margin:32px}canvas{width:min(100%,800px);border-radius:12px}#status{color:#83e6d1}</style>
<h1>Synthetic demo video</h1><p id="status">Preparing a short, fictional business update…</p><canvas id="c" width="960" height="540"></canvas>
<script>
const c=document.querySelector('#c'),x=c.getContext('2d'),status=document.querySelector('#status');
function frame(t){
  const sky=x.createLinearGradient(0,0,0,540);sky.addColorStop(0,'#0c2034');sky.addColorStop(1,'#1d7770');x.fillStyle=sky;x.fillRect(0,0,960,540);
  const sunX=740+Math.sin(t/1300)*45;x.fillStyle='#f7c36b';x.beginPath();x.arc(sunX,145,54,0,Math.PI*2);x.fill();
  x.fillStyle='rgba(107,220,196,.12)';x.beginPath();x.arc(sunX,145,92,0,Math.PI*2);x.fill();
  x.fillStyle='#174c4d';x.beginPath();x.ellipse(490,470,650,155,0,0,Math.PI*2);x.fill();
  x.fillStyle='#102335';x.fillRect(185,292,585,164);
  x.fillStyle='#4bd6bc';x.beginPath();x.moveTo(150,295);x.lineTo(480,208);x.lineTo(805,295);x.closePath();x.fill();
  for(let r=0;r<2;r++)for(let col=0;col<5;col++){const px=280+col*91,py=300+r*39;x.fillStyle='#143c55';x.fillRect(px,py,76,26);x.strokeStyle='#a3f4e6';x.lineWidth=2;x.strokeRect(px,py,76,26)}
  x.fillStyle='#f7c36b';x.fillRect(225,358,49,98);x.fillStyle='#b6e1d9';x.fillRect(674,365,48,91);
  x.fillStyle='rgba(8,17,31,.8)';x.fillRect(38,36,500,96);x.fillStyle='#6ce6d1';x.font='bold 18px system-ui';x.fillText('INVESTOR MTAANI  ·  SYNTHETIC TEST VIDEO',58,70);x.fillStyle='#f3f7f6';x.font='bold 29px system-ui';x.fillText('A closer look at community solar',58,111);
  x.fillStyle='#d6e9e6';x.font='18px system-ui';x.fillText('Kijani Sun Co-op  ·  Demo story  ·  Kitui',44,510);
}
function start(){
  const preferred=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
  const type=preferred.find((value)=>MediaRecorder.isTypeSupported(value));
  if(!type){status.textContent='This browser cannot create the WebM demo fixture.';return}
  const recorder=new MediaRecorder(c.captureStream(24),{mimeType:type,videoBitsPerSecond:900000});
  const chunks=[];recorder.ondataavailable=(event)=>{if(event.data.size)chunks.push(event.data)};
  recorder.onstop=async()=>{
    status.textContent='Saving the generated video fixture…';
    const blob=new Blob(chunks,{type:'video/webm'});
    const response=await fetch('/video',{method:'POST',headers:{'Content-Type':'video/webm'},body:blob});
    status.textContent=response.ok?'Saved the synthetic video fixture to backend/demo-media.':'Save failed: '+response.status;
  };
  recorder.start();let began=performance.now();
  function animate(now){frame(now-began);if(now-began<5200)requestAnimationFrame(animate);else recorder.stop()}
  requestAnimationFrame(animate);
}
start();
</script>`;

fs.mkdirSync(outputDir, { recursive: true });
const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    return res.end(html);
  }
  if (req.method === "POST" && req.url === "/video") {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 20 * 1024 * 1024) {
        res.writeHead(413).end("Video fixture exceeds 20 MB");
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (res.headersSent) return;
      const buffer = Buffer.concat(chunks);
      if (!buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) {
        return res.writeHead(400).end("Payload is not a WebM file");
      }
      fs.writeFileSync(outputFile, buffer, { flag: "w" });
      res.writeHead(201, { "Content-Type": "text/plain" }).end("Video fixture saved");
      console.log(`Saved ${buffer.length} byte WebM demo fixture.`);
      setTimeout(() => server.close(), 500);
    });
    return;
  }
  res.writeHead(404).end("Not found");
});

server.listen(4587, "127.0.0.1", () => console.log("Open http://127.0.0.1:4587 to create the local demo video."));
