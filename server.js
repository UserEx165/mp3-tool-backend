const express = require('express')
const multer = require('multer')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegStatic = require('ffmpeg-static')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 10000
const PUBLIC_URL = process.env.PUBLIC_URL || '' // e.g. https://your-service.onrender.com

// Allow your Vercel site by setting CORS_ORIGIN in Render env
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','), credentials: false }))

// Where uploads & outputs live (ephemeral on Render free)
const UPLOAD_DIR = path.join(__dirname, 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

ffmpeg.setFfmpegPath(ffmpegStatic)
const upload = multer({ dest: UPLOAD_DIR })

app.get('/health', (_req, res) => res.json({ ok: true }))

app.post('/convert', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'file missing' })

  const inputPath = req.file.path
  const outputName = `${req.file.filename}.mp3`
  const outputPath = path.join(UPLOAD_DIR, outputName)

  try {
    ffmpeg(inputPath)
      .toFormat('mp3')
      .on('error', (err) => {
        console.error('ffmpeg error', err)
        safeUnlink(inputPath)
        res.status(500).json({ success: false, error: err.message })
      })
      .on('end', () => {
        const base = PUBLIC_URL || `http://localhost:${PORT}`
        const url = `${base.replace(/\/$/,'')}/${outputName}`
        safeUnlink(inputPath)
        res.json({ success: true, downloadUrl: url })
        // Optional: auto-delete output after some time to save space
        setTimeout(() => safeUnlink(outputPath), 30 * 60 * 1000) // 30 minutes
      })
      .save(outputPath)
  } catch (e) {
    console.error(e)
    safeUnlink(inputPath)
    res.status(500).json({ success: false, error: e.message })
  }
})

app.use(express.static(UPLOAD_DIR))

app.listen(PORT, () => {
  console.log(`MP3 backend listening on :${PORT}`)
})

function safeUnlink(p) {
  try { fs.unlinkSync(p) } catch {}
}
