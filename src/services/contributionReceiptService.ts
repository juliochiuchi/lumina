import { patchDocument, PatchType, TextRun } from "docx"
import { renderAsync } from "docx-preview"

import { formatContributionValue } from "@/lib/contributions"
import {
  type MonthlyContributionMemberRow,
  type MonthlyContributionOfferEntry,
  type MonthlyContributionSheet,
} from "@/services/monthlyContributionsService"

const RECEIPT_TEMPLATE_PATH = "/docs/recibo-dizimos-ofertas-por-domingo.docx"

function sumValues(values: Array<number | null | undefined>) {
  return Math.round(
    values.reduce<number>((sum, value) => sum + Number(value ?? 0), 0) * 100,
  ) / 100
}

function joinTextParts(parts: string[]) {
  if (parts.length === 0) {
    return ""
  }

  if (parts.length === 1) {
    return parts[0]
  }

  if (parts.length === 2) {
    return `${parts[0]} e ${parts[1]}`
  }

  return `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`
}

function joinHundredsTextParts(parts: string[]) {
  return parts.filter(Boolean).join(" e ")
}

function formatReceiptDate(dateSunday: string) {
  const [year, month, day] = dateSunday.split("-")
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const monthIndex = Number(month) - 1

  return `${Number(day)} de ${monthNames[monthIndex] ?? month} de ${year}`
}

function convertHundredsToWords(value: number) {
  const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"]
  const teens = [
    "dez",
    "onze",
    "doze",
    "treze",
    "quatorze",
    "quinze",
    "dezesseis",
    "dezessete",
    "dezoito",
    "dezenove",
  ]
  const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"]
  const hundreds = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"]

  if (value === 0) {
    return ""
  }

  if (value === 100) {
    return "cem"
  }

  const hundred = Math.floor(value / 100)
  const remainder = value % 100
  const ten = Math.floor(remainder / 10)
  const unit = remainder % 10

  const parts: string[] = []

  if (hundred > 0) {
    parts.push(hundreds[hundred])
  }

  if (remainder >= 10 && remainder < 20) {
    parts.push(teens[remainder - 10])
    return joinHundredsTextParts(parts)
  }

  if (ten > 0) {
    parts.push(tens[ten])
  }

  if (unit > 0) {
    parts.push(units[unit])
  }

  return joinHundredsTextParts(parts)
}

function convertIntegerToWords(value: number) {
  if (value === 0) {
    return "zero"
  }

  const scales = [
    { singular: "", plural: "", omitOne: false },
    { singular: "mil", plural: "mil", omitOne: true },
    { singular: "milhão", plural: "milhões", omitOne: false },
    { singular: "bilhão", plural: "bilhões", omitOne: false },
  ]

  const parts: string[] = []
  let remaining = value
  let scaleIndex = 0

  while (remaining > 0) {
    const chunk = remaining % 1000

    if (chunk > 0) {
      const scale = scales[scaleIndex]
      const chunkText = convertHundredsToWords(chunk)

      if (scaleIndex === 0) {
        parts.unshift(chunkText)
      } else if (scale?.omitOne && chunk === 1) {
        parts.unshift(scale.singular)
      } else {
        parts.unshift(`${chunkText} ${chunk === 1 ? scale.singular : scale.plural}`.trim())
      }
    }

    remaining = Math.floor(remaining / 1000)
    scaleIndex += 1
  }

  return joinTextParts(parts)
}

function convertCurrencyToWords(value: number) {
  const totalCents = Math.round(Number(value) * 100)
  const integerPart = Math.floor(totalCents / 100)
  const centsPart = totalCents % 100

  const integerText = integerPart > 0
    ? `${convertIntegerToWords(integerPart)} ${
      integerPart >= 1_000_000 && integerPart % 1_000_000 === 0
        ? "de reais"
        : integerPart === 1
          ? "real"
          : "reais"
    }`
    : ""

  const centsText = centsPart > 0
    ? `${convertIntegerToWords(centsPart)} ${centsPart === 1 ? "centavo" : "centavos"}`
    : ""

  if (!integerText && !centsText) {
    return "zero reais"
  }

  if (integerText && centsText) {
    return `${integerText} e ${centsText}`
  }

  return integerText || centsText
}

async function getTemplateArrayBuffer() {
  const response = await fetch(RECEIPT_TEMPLATE_PATH)

  if (!response.ok) {
    throw new Error("Não foi possível carregar o template de recibo")
  }

  return response.arrayBuffer()
}

function preparePrintWindow(printWindow: Window) {
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Impressão de recibo</title>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            height: auto;
          }

          body {
            display: block;
            font-family: Arial, sans-serif;
          }

          #print-root {
            width: auto;
            margin: 0 auto;
          }

          .print-loading {
            padding: 32px 24px;
            color: #111827;
            font-size: 16px;
          }

          .docx-wrapper {
            padding: 0 !important;
            background: #ffffff !important;
          }

          .docx-wrapper > section.docx {
            margin-bottom: 0 !important;
            box-shadow: none !important;
          }

          @page {
            margin: 0;
          }

          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              overflow: hidden !important;
            }

            #print-root {
              margin: 0 !important;
              padding: 0 !important;
            }

            .docx-wrapper {
              padding: 0 !important;
            }

            .docx-wrapper > section.docx {
              margin: 0 !important;
              break-after: auto !important;
              page-break-after: auto !important;
            }
          }
        </style>
      </head>
      <body>
        <div id="print-root">
          <div class="print-loading">Preparando recibo para impressão...</div>
        </div>
      </body>
    </html>
  `)
  printWindow.document.close()
}

function renderPrintWindowError(printWindow: Window, message: string) {
  const container = printWindow.document.getElementById("print-root")

  if (!container) {
    printWindow.close()
    return
  }

  container.innerHTML = `
    <div class="print-loading">
      ${message}
    </div>
  `
}

function buildTextRun(text: string, options?: { bold?: boolean; size?: number }) {
  return new TextRun({
    text,
    font: "Times New Roman",
    size: options?.size ?? 24,
    bold: options?.bold,
  })
}

function buildDateRun(text: string) {
  return new TextRun({
    text,
    font: "Times New Roman",
    size: 32,
    bold: true,
  })
}

function getSundayReceiptTotals(
  rows: MonthlyContributionMemberRow[],
  offers: MonthlyContributionOfferEntry[],
  dateSunday: string,
) {
  const totalTithe = sumValues(rows.map((row) => row.valuesBySunday[dateSunday] ?? null))
  const totalOffer = sumValues(offers.map((entry) => entry.amount))
  const totalGeneral = sumValues([totalTithe, totalOffer])

  return {
    totalTithe,
    totalOffer,
    totalGeneral,
  }
}

async function openGeneratedReceiptForPrint(blob: Blob, printWindow: Window) {
  const container = printWindow.document.getElementById("print-root")

  if (!container) {
    printWindow.close()
    throw new Error("Não foi possível preparar a visualização de impressão do recibo")
  }

  await renderAsync(blob, container, container, {
    ignoreWidth: false,
    ignoreHeight: false,
    inWrapper: true,
    hideWrapperOnPrint: true,
    breakPages: true,
    useBase64URL: true,
  })

  printWindow.focus()

  window.setTimeout(() => {
    printWindow.print()
  }, 300)
}

export const contributionReceiptService = {
  openPrintWindow() {
    const printWindow = window.open("", "_blank")

    if (!printWindow) {
      throw new Error("O navegador bloqueou a janela de impressão do recibo")
    }

    preparePrintWindow(printWindow)

    return printWindow
  },

  getSundayOptions(sheet: MonthlyContributionSheet | null) {
    if (!sheet) {
      return []
    }

    return sheet.sundays.map((sunday) => {
      const { totalTithe, totalOffer, totalGeneral } = getSundayReceiptTotals(
        sheet.rows,
        sheet.offersBySunday[sunday.date] ?? [],
        sunday.date,
      )

      return {
        sunday,
        totalTithe,
        totalOffer,
        totalGeneral,
      }
    })
  },

  async printReceipt(params: {
    sheet: MonthlyContributionSheet
    dateSunday: string
    namePersonHelping: string
    rolePersonHelping: string
    printWindow: Window
  }) {
    const { sheet, dateSunday, namePersonHelping, rolePersonHelping, printWindow } = params
    const sunday = sheet.sundays.find((item) => item.date === dateSunday)

    if (!sunday) {
      printWindow.close()
      throw new Error("Domingo inválido para impressão do recibo")
    }

    const { totalTithe, totalOffer, totalGeneral } = getSundayReceiptTotals(
      sheet.rows,
      sheet.offersBySunday[dateSunday] ?? [],
      dateSunday,
    )

    try {
      const template = await getTemplateArrayBuffer()
      const patchedDocument = await patchDocument({
        outputType: "blob",
        data: template,
        keepOriginalStyles: true,
        placeholderDelimiters: {
          start: "{",
          end: "}",
        },
        patches: {
          dateSunday: {
            type: PatchType.PARAGRAPH,
            children: [buildDateRun(formatReceiptDate(dateSunday))],
          },
          amountTotalTitheNumber: {
            type: PatchType.PARAGRAPH,
            children: [buildTextRun(formatContributionValue(totalTithe))],
          },
          amountTotalTitheText: {
            type: PatchType.PARAGRAPH,
            children: [buildTextRun(convertCurrencyToWords(totalTithe))],
          },
          amountTotalOfferNumber: {
            type: PatchType.PARAGRAPH,
            children: [buildTextRun(formatContributionValue(totalOffer))],
          },
          amountTotalOfferText: {
            type: PatchType.PARAGRAPH,
            children: [buildTextRun(convertCurrencyToWords(totalOffer))],
          },
          amountTotalGeneralNumber: {
            type: PatchType.PARAGRAPH,
            children: [buildTextRun(formatContributionValue(totalGeneral), { bold: true })],
          },
          amountTotalGeneralText: {
            type: PatchType.PARAGRAPH,
            children: [buildTextRun(convertCurrencyToWords(totalGeneral), { bold: true })],
          },
          namePersonHelping: {
            type: PatchType.PARAGRAPH,
            children: [buildTextRun(namePersonHelping)],
          },
          rolePersonHelping: {
            type: PatchType.PARAGRAPH,
            children: [buildTextRun(rolePersonHelping)],
          },
        },
      })

      await openGeneratedReceiptForPrint(patchedDocument, printWindow)
    } catch (error) {
      renderPrintWindowError(printWindow, "Não foi possível preparar o recibo para impressão.")
      throw error
    }
  },
}
