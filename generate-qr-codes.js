const QRCode = require('qrcode')
const path = require('path')
const fs = require('fs').promises

// mission → container mapping from the database
const containers = [
  { mission: 'MIS-091', container: 'CTR-001', qr: 'CTR-QR-001' },
  { mission: 'MIS-090', container: 'CTR-002', qr: 'CTR-QR-002' },
  { mission: 'MIS-089', container: 'CTR-003', qr: 'CTR-QR-003' },
  { mission: 'MIS-088', container: 'CTR-004', qr: 'CTR-QR-004' },
  { mission: 'MIS-087', container: 'CTR-005', qr: 'CTR-QR-005' },
  { mission: 'MIS-086', container: 'CTR-006', qr: 'CTR-QR-006' },
  { mission: 'MIS-085', container: 'CTR-007', qr: 'CTR-QR-007' },
  { mission: 'MIS-084', container: 'CTR-008', qr: 'CTR-QR-008' },
  { mission: 'MIS-083', container: 'CTR-009', qr: 'CTR-QR-009' },
  { mission: 'MIS-082', container: 'CTR-010', qr: 'CTR-QR-010' },
]

async function main() {
  const outDir = path.resolve(__dirname, 'qr-codes')

  for (const c of containers) {
    // Encode the plain container QR code — the app scans this,
    // looks up the container, then finds the linked mission
    const filePath = path.join(outDir, `${c.mission}--${c.qr}.png`)
    await QRCode.toFile(filePath, c.qr, {
      type: 'png',
      width: 400,
      margin: 2,
      color: { dark: '#1d4ed8', light: '#ffffff' },
    })
    console.log(`✓ ${c.mission} → ${c.qr}`)
  }

  console.log(`\nDone — ${containers.length} driver QR codes in ${outDir}`)

  // ── Technician confirmation QR codes ──────────────────────────────────
  const techDir = path.resolve(outDir, 'technician')
  await fs.mkdir(techDir, { recursive: true })

  for (const c of containers) {
    // Encode the same container QR code — technician scans it,
    // app sends { qrCode }, backend resolves mission by container + technician
    const filePath = path.join(techDir, `${c.mission}--${c.qr}.png`)
    await QRCode.toFile(filePath, c.qr, {
      type: 'png',
      width: 400,
      margin: 2,
      color: { dark: '#059669', light: '#ffffff' },
    })
    console.log(`✓ tech/${c.mission} → ${c.qr}`)
  }

  console.log(`\nDone — ${containers.length} technician QR codes in ${techDir}`)
}

main().catch(console.error)
