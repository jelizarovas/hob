import { PDFDocument, rgb } from "pdf-lib";
import download from "downloadjs";

export function getFormattedDate(date, separator = "/") {
  const year = date.getFullYear();
  const month = (1 + date.getMonth()).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return [month, day, year].join(separator);
}

export async function modifyPdf(data, images) {
  const baseUrl = window.location.origin + import.meta.env.BASE_URL;
  const pdfPath = "pdf/CHECK REQUEST.pdf";
  const url = baseUrl + pdfPath;
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const helveticaFont = await pdfDoc.embedFont("Helvetica");
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  firstPage.drawText(`${data.amount}`, {
    x: 170,
    y: 652,
    size: 16,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(data.name, {
    x: 170,
    y: 620,
    size: 16,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  const parseAddress = (address) => {
    const index = address.indexOf(",");
    return index === -1
      ? [address, ""]
      : [address.substring(0, index).trim(), address.substring(index + 1).trim()];
  };
  const [add1, add2] = parseAddress(data.address);
  firstPage.drawText(add1, {
    x: 255,
    y: 582,
    size: 16,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(add2, {
    x: 220,
    y: 545,
    size: 16,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(data.explanation, {
    x: 95,
    y: 345,
    size: 16,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  if (images.length > 0) {
    const { width: pageWidth, height: pageHeight } = firstPage.getSize();
    const margin = 20;
    const availableWidth = pageWidth - 2 * margin;
    const availableHeight = pageHeight / 2 - 2 * margin;
    for (let i = 0; i < images.length; i += 2) {
      const newPage = pdfDoc.addPage([pageWidth, pageHeight]);
      const imageFile1 = images[i];
      const imageBytes1 = await imageFile1.arrayBuffer();
      const embeddedImage1 = imageFile1.type.includes("png")
        ? await pdfDoc.embedPng(imageBytes1)
        : await pdfDoc.embedJpg(imageBytes1);
      const scaleFactor1 = Math.min(
        availableWidth / embeddedImage1.width,
        availableHeight / embeddedImage1.height
      );
      const imgWidth1 = embeddedImage1.width * scaleFactor1;
      const imgHeight1 = embeddedImage1.height * scaleFactor1;
      newPage.drawImage(embeddedImage1, {
        x: margin + (availableWidth - imgWidth1) / 2,
        y: pageHeight - margin - imgHeight1,
        width: imgWidth1,
        height: imgHeight1,
      });

      if (i + 1 < images.length) {
        const imageFile2 = images[i + 1];
        const imageBytes2 = await imageFile2.arrayBuffer();
        const embeddedImage2 = imageFile2.type.includes("png")
          ? await pdfDoc.embedPng(imageBytes2)
          : await pdfDoc.embedJpg(imageBytes2);
        const scaleFactor2 = Math.min(
          availableWidth / embeddedImage2.width,
          availableHeight / embeddedImage2.height
        );
        const imgWidth2 = embeddedImage2.width * scaleFactor2;
        const imgHeight2 = embeddedImage2.height * scaleFactor2;
        newPage.drawImage(embeddedImage2, {
          x: margin + (availableWidth - imgWidth2) / 2,
          y: pageHeight / 2 - margin - imgHeight2,
          width: imgWidth2,
          height: imgHeight2,
        });
      }
    }
  }
  return await pdfDoc.save();
}

export async function mergePdfRequests(pdfBytesArray) {
  const mergedPdf = await PDFDocument.create();
  for (let i = 0; i < pdfBytesArray.length; i++) {
    const pdfDoc = await PDFDocument.load(pdfBytesArray[i]);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
    if (i < pdfBytesArray.length - 1) {
      const { width, height } = copiedPages[0].getSize();
      mergedPdf.addPage([width, height]);
    }
  }
  return await mergedPdf.save();
}

export async function downloadPdf(pdfBytes, data, fileName) {
  if (!fileName) {
    const now = new Date();
    fileName = `Check Request ${data.name} ${data.amount} ${getFormattedDate(now, " ")}.pdf`;
  }
  download(pdfBytes, fileName, "application/pdf");
}
