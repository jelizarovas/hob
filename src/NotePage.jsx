import React, { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import download from "downloadjs";

// Helper: build month calendar array (weeks of Mon-Sun)
function getMonthCalendar(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks = [];
  let week = Array(7).fill(0);
  let day = 1;

  // Fill first week
  for (let i = 1; i < 7; i++) {
    if (i >= (firstDay === 0 ? 7 : firstDay)) {
      week[i] = day++;
    }
  }
  weeks.push(week.slice());

  // Fill remaining weeks
  while (day <= daysInMonth) {
    week = Array(7).fill(0);
    for (let i = 1; i < 7 && day <= daysInMonth; i++) {
      week[i] = day++;
    }
    weeks.push(week.slice());
  }
  return weeks;
}

// Generates a two-page PDF with schedule, Day line, current month calendar, and notes
export async function generateNotePagePDF(includeDay) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // US Letter
  const { width, height } = page.getSize();
  const margin = 36; // 0.5"

  // Embed fonts
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Layout constants
  const cellW = 20;
  const cellH = 18;
  const slotH = 14;

  // Starting y position
  let yPos = height - margin;

  // Calendar region at top-right
  const calWidth = cellW * 7;
  const xCal = width - margin - calWidth;

  // Optional Day line above calendar
  if (includeDay) {
    page.drawText("Day _________________________", {
      x: xCal,
      y: yPos,
      size: 10,
      font,
    });
    yPos -= slotH;
  }

  // Draw current month title
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  page.drawText(`${now.toLocaleString("default", { month: "long" })} ${year}`, {
    x: xCal,
    y: yPos,
    size: 12,
    font: fontBold,
  });
  yPos -= slotH;

  // Weekday labels
  ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].forEach((d, i) => {
    page.drawText(d, { x: xCal + i * cellW + 5, y: yPos, size: 8, font });
  });
  yPos -= cellH;

  // Calendar grid with prev/next month days in gray
  const calData = getMonthCalendar(year, month);
  let nextDay = 1;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevLast = new Date(prevYear, prevMonth, 0).getDate();
  calData.forEach((weekArr, r) => {
    weekArr.forEach((d, c) => {
      const x = xCal + c * cellW;
      const y = yPos - r * cellH;
      page.drawRectangle({ x, y, width: cellW, height: cellH, borderWidth: 1 });
      let dayNum = d;
      let color = rgb(0, 0, 0);
      if (!d) {
        dayNum =
          r === 0
            ? prevLast -
              weekArr.filter((v) => v === 0).length +
              weekArr.indexOf(0) +
              1
            : nextDay++;
        color = rgb(0.6, 0.6, 0.6);
      }
      page.drawText(String(dayNum), {
        x: x + 2,
        y: y + 2,
        size: 8,
        font,
        color,
      });
    });
  });

  // Draw schedule (9AM–7:30PM) at top-left, 20% narrower width
  const xSched = margin + 40;
  const fullSchedWidth = width - margin - xSched;
  const xEndSched = xSched + fullSchedWidth * 0.65;
  let ySched = height - margin;
  for (let i = 0; i <= (19 - 9) * 2 + 1; i++) {
    const hr = 9 + Math.floor(i / 2);
    const mn = i % 2 ? "30" : "00";
    const label = `${hr <= 12 ? hr : hr - 12}:${mn}${hr < 12 ? "AM" : "PM"}`;
    const y = ySched - i * slotH;
    page.drawText(label, { x: xSched - 35, y: y + 2, size: 8, font });
    page.drawLine({
      start: { x: xSched, y },
      end: { x: xEndSched, y },
      thickness: 1,
    });
  }

  // Note lines under schedule/calendar
  const notesStart = ySched - ((19 - 9) * 2 + 1) * slotH - slotH;
  let yLine = notesStart;
  while (yLine > margin) {
    page.drawLine({
      start: { x: margin, y: yLine },
      end: { x: width - margin, y: yLine },
      thickness: 1,
    });
    yLine -= slotH;
  }

  // Page 2: full note lines
  const page2 = doc.addPage([612, 792]);
  let y2 = height - margin;
  while (y2 > margin) {
    page2.drawLine({
      start: { x: margin, y: y2 },
      end: { x: width - margin, y: y2 },
      thickness: 1,
    });
    y2 -= slotH;
  }

  // Save and download
  const pdfBytes = await doc.save();
  download(pdfBytes, "NotePage.pdf", "application/pdf");
}

// React component using named export and Tailwind (no dark mode on calendar)
export function NotePage() {
  const [includeDay, setIncludeDay] = useState(true);

  return (
    <div className="p-4 bg-white text-gray-900">
      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          className="form-checkbox h-5 w-5 text-blue-600"
          checked={includeDay}
          onChange={(e) => setIncludeDay(e.target.checked)}
        />
        <span className="ml-2">Include Day Line</span>
      </label>
      <button
        onClick={() => generateNotePagePDF(includeDay)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Generate PDF
      </button>
    </div>
  );
}
