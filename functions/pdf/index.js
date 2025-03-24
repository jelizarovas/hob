const { generateAgreementSheetPdf } = require("./generateAgreementSheetPdf.js");
exports.generateAgreementSheetPdf = generateAgreementSheetPdf;

//RUN THIS FROM FUNCTIONS FOLDER -
// npm run build:pdf
// firebase deploy --only functions:pdf:generateAgreementSheetPdf
