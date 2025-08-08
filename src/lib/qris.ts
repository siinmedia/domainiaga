import QRCode from 'qrcode'

export function pad(number: number): string {
  return number < 10 ? '0' + number : number.toString()
}

export function toCRC16(input: string): string {
  let crc = 0xFFFF
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }
  const hex = (crc & 0xFFFF).toString(16).toUpperCase()
  return hex.length === 3 ? "0" + hex : hex
}

export function makeQRISString(baseQRIS: string, nominal: number): string {
  let qrisModified = baseQRIS.slice(0, -4).replace("010211", "010212")
  const qrisParts = qrisModified.split("5802ID")

  let amount = "54" + pad(nominal.toString().length) + nominal
  amount += "5802ID"

  const output = qrisParts[0].trim() + amount + qrisParts[1].trim()
  return output + toCRC16(output)
}

export async function generateQRCode(qrisString: string): Promise<string> {
  try {
    return await QRCode.toDataURL(qrisString, {
      margin: 1,
      width: 300,
      color: {
        dark: '#1976d2',
        light: '#ffffff'
      }
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

export const QRIS_BASE = "00020101021126610014COM.GO-JEK.WWW01189360091432840999140210G2840999140303UMI51440014ID.CO.QRIS.WWW0215ID10253780771980303UMI5204549953033605802ID5916SIINMEDIA, PCNGN6006JEPARA61055946262070703A01630456FE"