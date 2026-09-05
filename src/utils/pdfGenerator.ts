import { jsPDF } from 'jspdf';
import { Student, SchoolInfo, PaymentReceipt } from '../types';
import { formatNumber } from './formatters';

export interface StudentFeeSummary {
  totalFee: number;
  totalPaid: number;
  pendingFee: number;
  receipts: PaymentReceipt[];
}

/**
 * Generates a formal Single Student Fee Statement / Demand Slip PDF
 */
export function generateStudentFeeSlipPdf(
  student: Student,
  school: SchoolInfo,
  summary: StudentFeeSummary,
  dueDate: string = 'Within 5 Days'
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  renderSingleSlipPage(doc, student, school, summary, dueDate);
  return doc;
}

/**
 * Generates a Multi-Page Bulk Fee Statement PDF for all selected students
 */
export function generateBulkFeeStatementsPdf(
  students: Student[],
  school: SchoolInfo,
  getSummary: (s: Student) => StudentFeeSummary,
  dueDate: string = 'Within 5 Days'
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  students.forEach((student, index) => {
    if (index > 0) {
      doc.addPage();
    }
    const summary = getSummary(student);
    renderSingleSlipPage(doc, student, school, summary, dueDate);
  });

  return doc;
}

/**
 * Generates Multi-Page Formal Fee Demand Notices / Overdue Reminders
 */
export function generateBulkDemandNoticesPdf(
  students: Student[],
  school: SchoolInfo,
  getSummary: (s: Student) => StudentFeeSummary,
  dueDate: string = 'Immediate Settlement'
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  students.forEach((student, index) => {
    if (index > 0) {
      doc.addPage();
    }
    const summary = getSummary(student);
    renderDemandNoticePage(doc, student, school, summary, dueDate);
  });

  return doc;
}

/**
 * Generates Bulk Student ID Cards (4 cards per A4 page)
 */
export function generateBulkIdCardsPdf(
  students: Student[],
  school: SchoolInfo
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const cardsPerPage = 4;
  students.forEach((student, index) => {
    const pageIndex = Math.floor(index / cardsPerPage);
    const cardPositionOnPage = index % cardsPerPage;

    if (index > 0 && cardPositionOnPage === 0) {
      doc.addPage();
    }

    // Positions for 2x2 grid on A4 (210mm x 297mm)
    // Card size: 88mm x 125mm
    const col = cardPositionOnPage % 2;
    const row = Math.floor(cardPositionOnPage / 2);
    const startX = 12 + col * 94;
    const startY = 15 + row * 132;

    renderIdCard(doc, student, school, startX, startY);
  });

  return doc;
}

// --------------------------------------------------------------------------
// INTERNAL PDF PAGE RENDERERS
// --------------------------------------------------------------------------

function renderSingleSlipPage(
  doc: jsPDF,
  student: Student,
  school: SchoolInfo,
  summary: StudentFeeSummary,
  dueDate: string
) {
  // Page Border
  doc.setDrawColor(79, 109, 122); // #4F6D7A Slate Blue
  doc.setLineWidth(0.8);
  doc.rect(8, 8, 194, 281);
  doc.setDrawColor(226, 232, 226);
  doc.setLineWidth(0.3);
  doc.rect(9.5, 9.5, 191, 278);

  // Top Header Banner
  doc.setFillColor(45, 49, 46); // #2D312E Dark Slate
  doc.rect(10, 10, 190, 26, 'F');

  // School Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(school.name.toUpperCase(), 105, 18, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(214, 138, 110); // #D68A6E Terracotta
  doc.text(`${school.address} | Phone: ${school.phone}`, 105, 24, { align: 'center' });
  doc.setTextColor(200, 200, 200);
  doc.text(`Official Fee Statement & Academic Dues Card | Academic Year 2024-2025`, 105, 30, { align: 'center' });

  // Document Title Bar
  doc.setFillColor(242, 244, 242);
  doc.rect(10, 37, 190, 8, 'F');
  doc.setDrawColor(200, 210, 200);
  doc.line(10, 45, 200, 45);

  doc.setTextColor(79, 109, 122);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('STUDENT CUM ACADEMIC FEE LEDGER', 14, 42.5);

  const issueDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Statement Date: ${issueDate}`, 196, 42.5, { align: 'right' });

  // Student Info Box
  doc.setFillColor(253, 253, 251);
  doc.roundedRect(12, 48, 186, 32, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Student Name:', 16, 55);
  doc.text('Admission No:', 16, 62);
  doc.text('Standard & Section:', 16, 69);
  doc.text('Roll Number:', 16, 76);

  doc.setTextColor(45, 49, 46);
  doc.setFont('helvetica', 'bold');
  doc.text(student.name.toUpperCase(), 50, 55);
  doc.setFont('courier', 'bold');
  doc.text(student.admissionNo, 50, 62);
  doc.setFont('helvetica', 'bold');
  doc.text(`Class ${student.standard} - Section ${student.section}`, 50, 69);
  doc.text(student.rollNo || 'N/A', 50, 76);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Parent / Guardian:', 110, 55);
  doc.text('Mobile Number:', 110, 62);
  doc.text('Residential Address:', 110, 69);
  doc.text('Student Category:', 110, 76);

  doc.setTextColor(45, 49, 46);
  doc.setFont('helvetica', 'bold');
  doc.text(student.parentName, 148, 55);
  doc.text(student.parentPhone, 148, 62);
  doc.setFont('helvetica', 'normal');
  doc.text((student.address || 'Essur').substring(0, 30), 148, 69);
  doc.setFont('helvetica', 'bold');
  if (student.isRte) {
    doc.setTextColor(79, 109, 122);
    doc.text(`RTE 25% Free Quota (${student.rteApplicationNo || 'Govt Approved'})`, 148, 76);
  } else {
    doc.setTextColor(45, 49, 46);
    doc.text('General Admission', 148, 76);
  }

  // 3-Box Financial Summary Tiles
  const boxY = 84;
  // Total Prescribed Fee
  doc.setFillColor(242, 244, 242);
  doc.roundedRect(12, boxY, 58, 18, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('TOTAL ANNUAL FEE', 41, boxY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(45, 49, 46);
  doc.text(`Rs. ${formatNumber(summary.totalFee)}`, 41, boxY + 13, { align: 'center' });

  // Total Paid
  doc.setFillColor(235, 245, 238);
  doc.roundedRect(76, boxY, 58, 18, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(79, 109, 122);
  doc.text('TOTAL PAID TILL DATE', 105, boxY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(40, 120, 70);
  doc.text(`Rs. ${formatNumber(summary.totalPaid)}`, 105, boxY + 13, { align: 'center' });

  // Current Pending Due
  const pendingColor = summary.pendingFee > 0 ? [214, 60, 60] : [40, 120, 70];
  doc.setFillColor(summary.pendingFee > 0 ? 255 : 235, summary.pendingFee > 0 ? 240 : 245, summary.pendingFee > 0 ? 240 : 238);
  doc.roundedRect(140, boxY, 58, 18, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(summary.pendingFee > 0 ? 180 : 79, summary.pendingFee > 0 ? 40 : 109, summary.pendingFee > 0 ? 40 : 122);
  doc.text('BALANCE PENDING DUE', 169, boxY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(pendingColor[0], pendingColor[1], pendingColor[2]);
  doc.text(`Rs. ${formatNumber(summary.pendingFee)}`, 169, boxY + 13.5, { align: 'center' });

  // Section: Prescribed Fee Breakdown Table
  let currentY = 108;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(45, 49, 46);
  doc.text('1. PRESCRIBED ANNUAL FEE COMPONENT BREAKDOWN', 12, currentY);

  currentY += 3;
  // Table Header
  doc.setFillColor(79, 109, 122);
  doc.rect(12, currentY, 186, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('Fee Component / Description', 16, currentY + 4.2);
  doc.text('Schedule / Applicable Type', 105, currentY + 4.2);
  doc.text('Amount (INR)', 194, currentY + 4.2, { align: 'right' });

  currentY += 6;
  const breakdownRows = [
    { name: `Annual Base Tuition Fee (Class ${student.standard})`, type: student.isRte ? 'RTE 25% Government Scheme Waiver' : 'Annual Academic Tuition', amt: student.tuitionFee },
    { name: 'School Transport / Van Facility', type: student.vanFacility ? `Route: ${student.vanRoute || 'Essur Route'}` : 'Not Enrolled', amt: student.vanFacility ? student.vanFee : 0 },
    { name: 'Sports, Kits & Physical Training Activities', type: student.sportsFacility ? 'Full Year Sports Subscription' : 'Not Enrolled', amt: student.sportsFacility ? student.sportsFee : 0 },
    { name: 'Special Materials / Activity & Exam Fees', type: 'Annual Materials / Lab & Library', amt: student.otherFee || 0 },
    { name: 'Special Concession / Scholarship Discount', type: student.discount > 0 ? 'Institutional Merit / Concession' : 'None', amt: student.discount > 0 ? -student.discount : 0 },
  ];

  breakdownRows.forEach((row, i) => {
    doc.setFillColor(i % 2 === 0 ? 253 : 246, i % 2 === 0 ? 253 : 248, i % 2 === 0 ? 251 : 246);
    doc.rect(12, currentY, 186, 5.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(45, 49, 46);
    doc.text(row.name, 16, currentY + 4);
    doc.setTextColor(100, 100, 100);
    doc.text(row.type, 105, currentY + 4);
    doc.setTextColor(row.amt < 0 ? 40 : 45, row.amt < 0 ? 120 : 49, row.amt < 0 ? 70 : 46);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${formatNumber(Math.abs(row.amt))}${row.amt < 0 ? ' (CR)' : ''}`, 194, currentY + 4, { align: 'right' });
    currentY += 5.5;
  });

  // Section: Payment Installment History
  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(45, 49, 46);
  doc.text('2. PAYMENT INSTALLMENTS & RECEIPTS ISSUED RECORD', 12, currentY);

  currentY += 3;
  // Receipts Table Header
  doc.setFillColor(79, 109, 122);
  doc.rect(12, currentY, 186, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('Receipt No', 16, currentY + 4.2);
  doc.text('Date', 52, currentY + 4.2);
  doc.text('Payment Mode', 85, currentY + 4.2);
  doc.text('Reference / Cheque', 125, currentY + 4.2);
  doc.text('Amount Paid (INR)', 194, currentY + 4.2, { align: 'right' });

  currentY += 6;
  if (summary.receipts.length === 0) {
    doc.setFillColor(253, 253, 251);
    doc.rect(12, currentY, 186, 6.5, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('No payments have been recorded for this student yet.', 105, currentY + 4.5, { align: 'center' });
    currentY += 6.5;
  } else {
    summary.receipts.forEach((rc, i) => {
      doc.setFillColor(i % 2 === 0 ? 253 : 246, i % 2 === 0 ? 253 : 248, i % 2 === 0 ? 251 : 246);
      doc.rect(12, currentY, 186, 5.5, 'F');
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(79, 109, 122);
      doc.text(rc.receiptNumber, 16, currentY + 4);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(45, 49, 46);
      doc.text(rc.date, 52, currentY + 4);
      doc.text(rc.paymentMode, 85, currentY + 4);
      doc.setTextColor(100, 100, 100);
      doc.text((rc.transactionReference || 'Cash Voucher').substring(0, 20), 125, currentY + 4);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 120, 70);
      doc.text(`Rs. ${formatNumber(rc.amountPaid)}`, 194, currentY + 4, { align: 'right' });
      currentY += 5.5;
    });
  }

  // Payment Options & Bank Box
  currentY += 6;
  doc.setFillColor(242, 244, 242);
  doc.roundedRect(12, currentY, 186, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(79, 109, 122);
  doc.text('OFFICIAL PAYMENT OPTIONS & INSTRUCTIONS', 16, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.text(`1. Google Pay / PhonePe / BHIM UPI: ${school.upiId}`, 16, currentY + 11);
  doc.text(`2. GPay Linked Mobile: ${school.gpayPhone} (Send transaction screenshot to this WhatsApp number)`, 16, currentY + 16);
  doc.text(`3. Cash Payment: Directly at School Office, Essur between 9:00 AM and 4:30 PM`, 16, currentY + 21);
  doc.text(`4. For queries or concessions, please contact Admin: ${school.adminName} (${school.phone})`, 16, currentY + 26);

  // Signatures Area
  currentY += 34;
  doc.setDrawColor(180, 190, 180);
  doc.setLineWidth(0.4);

  // Left Signature: Parent / Guardian
  doc.line(16, currentY + 12, 65, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Parent / Guardian Signature', 40.5, currentY + 16, { align: 'center' });

  // Center: School Seal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(79, 109, 122);
  doc.text('[ SCHOOL SEAL ]', 105, currentY + 12, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('Wisdom Primary School, Essur', 105, currentY + 16, { align: 'center' });

  // Right Signature: Headmaster / Office In-Charge
  doc.line(145, currentY + 12, 194, currentY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(45, 49, 46);
  doc.text(school.adminName, 169.5, currentY + 11, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Office Admin / Correspondent', 169.5, currentY + 16, { align: 'center' });

  // Footer Note
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text(
    `This is an authentic computer generated fee statement from Wisdom Nursery and Primary School. Document ID: WNS-ST-${student.admissionNo}`,
    105,
    284,
    { align: 'center' }
  );
}

function renderDemandNoticePage(
  doc: jsPDF,
  student: Student,
  school: SchoolInfo,
  summary: StudentFeeSummary,
  dueDate: string
) {
  // Border
  doc.setDrawColor(214, 138, 110);
  doc.setLineWidth(0.8);
  doc.rect(8, 8, 194, 281);
  doc.setDrawColor(226, 232, 226);
  doc.setLineWidth(0.3);
  doc.rect(9.5, 9.5, 191, 278);

  // Letterhead
  doc.setFillColor(45, 49, 46);
  doc.rect(10, 10, 190, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(school.name.toUpperCase(), 105, 19, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(214, 138, 110);
  doc.text(`${school.address} | Tel: ${school.phone} | Email: ${school.email}`, 105, 25, { align: 'center' });
  doc.setTextColor(200, 200, 200);
  doc.text(`Recognized by Government of Tamil Nadu | Office Admin: ${school.adminName}`, 105, 31, { align: 'center' });

  // Notice Bar
  doc.setFillColor(214, 60, 60);
  doc.rect(10, 41, 190, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('OFFICIAL DEMAND NOTICE: OUTSTANDING SCHOOL FEE SETTLEMENT', 105, 47, { align: 'center' });

  // Reference and Date
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Ref No: WNS/FEE-NOTICE/${new Date().getFullYear()}/${student.admissionNo}`, 14, 56);
  doc.text(`Date: ${dateStr}`, 196, 56, { align: 'right' });

  // Recipient Block
  let y = 64;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(45, 49, 46);
  doc.text('To:', 14, y);
  y += 5;
  doc.text(`Thiru / Tmt. ${student.parentName}`, 14, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Parent of: ${student.name} (Admission No: ${student.admissionNo})`, 14, y);
  y += 4.5;
  doc.text(`Standard: Class ${student.standard} - Sec ${student.section}`, 14, y);
  y += 4.5;
  doc.text(`Address: ${student.address || 'Essur, Tamil Nadu'}`, 14, y);
  y += 4.5;
  doc.text(`Mobile: ${student.parentPhone}`, 14, y);

  // Subject line
  y += 8;
  doc.setFillColor(242, 244, 242);
  doc.rect(14, y - 4, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 109, 122);
  doc.text(`Sub: Settlement of Pending Tuition & Facilities Dues for Academic Year 2024-2025 - Reg.`, 16, y + 1.5);

  // Formal Notice Body
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const para1 = `Dear Parent,\n\nWe appreciate your continued partnership in your ward's educational journey at ${school.name}. As per our institutional accounts ledger, there remains an unsettled pending balance against the prescribed fee structure for ${student.name}.`;
  doc.text(para1, 14, y, { maxWidth: 182, lineHeightFactor: 1.4 });

  y += 18;
  // Dues Highlight Callout
  doc.setFillColor(255, 245, 245);
  doc.setDrawColor(214, 60, 60);
  doc.roundedRect(14, y, 182, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(180, 40, 40);
  doc.text('FEE ACCOUNT AUDIT SUMMARY:', 20, y + 7);

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Total Prescribed Annual Fee: Rs. ${formatNumber(summary.totalFee)}`, 20, y + 14);
  doc.text(`Fee Collected / Paid Till Date: Rs. ${formatNumber(summary.totalPaid)}`, 20, y + 20);

  doc.setFontSize(11);
  doc.setTextColor(214, 40, 40);
  doc.text(`OUTSTANDING BALANCE DUE: Rs. ${formatNumber(summary.pendingFee)}`, 20, y + 26);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(45, 49, 46);
  doc.text(`Payment Deadline: ${dueDate}`, 120, y + 26);

  y += 36;
  const para2 = `In order to maintain the school's operational commitments, timely faculty salaries, and transportation maintenance, we kindly request you to remit the outstanding sum of Rs. ${formatNumber(summary.pendingFee)} on or before ${dueDate}.`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(para2, 14, y, { maxWidth: 182, lineHeightFactor: 1.4 });

  y += 16;
  // Payment instructions
  doc.setFillColor(242, 244, 242);
  doc.roundedRect(14, y, 182, 32, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(79, 109, 122);
  doc.text('MODES OF PAYMENT ACCEPTED:', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(`• Google Pay / PhonePe UPI ID: ${school.upiId}`, 18, y + 12);
  doc.text(`• Official GPay Registered Mobile: ${school.gpayPhone}`, 18, y + 17);
  doc.text(`• Office Cash Counter: Wisdom Primary School Office, Essur (Working Hours: 9:00 AM - 4:30 PM)`, 18, y + 22);
  doc.text(`• After remittance, please send UTR / payment screenshot to ${school.phone} for receipt generation.`, 18, y + 27);

  y += 38;
  // Tamil note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'குறிப்பு: தங்களின் குழந்தையின் கல்வி தடையின்றி தொடர பள்ளி கட்டண நிலுவையை குறிப்பிட்ட காலத்திற்குள் செலுத்தி ஒத்துழைக்குமாறு அன்புடன் கேட்டுக்கொள்கிறோம்.',
    14,
    y,
    { maxWidth: 182 }
  );

  // Signatures
  y += 20;
  doc.setDrawColor(180, 190, 180);
  doc.line(14, y + 10, 60, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Office Stamp & Seal', 37, y + 14, { align: 'center' });

  doc.line(135, y + 10, 194, y + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(45, 49, 46);
  doc.text(school.adminName, 164.5, y + 9, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Headmaster / Office Administrator', 164.5, y + 14, { align: 'center' });
}

function renderIdCard(
  doc: jsPDF,
  student: Student,
  school: SchoolInfo,
  startX: number,
  startY: number
) {
  // Card dimensions: 88mm wide x 125mm high (Standard portrait student badge)
  const w = 88;
  const h = 125;

  // Outer Border
  doc.setDrawColor(79, 109, 122);
  doc.setLineWidth(0.6);
  doc.roundedRect(startX, startY, w, h, 3, 3, 'S');

  // Header Banner
  doc.setFillColor(45, 49, 46);
  doc.roundedRect(startX, startY, w, 22, 3, 3, 'F');
  // Flat bottom for header
  doc.rect(startX, startY + 16, w, 6, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(school.name.toUpperCase(), startX + w / 2, startY + 7, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(214, 138, 110);
  doc.text('ESSUR - 603301 | ACADEMIC ID CARD', startX + w / 2, startY + 13, { align: 'center' });
  doc.setTextColor(200, 200, 200);
  doc.text(`Academic Year 2024-2025`, startX + w / 2, startY + 18, { align: 'center' });

  // Photo Frame
  const photoY = startY + 25;
  const photoSize = 25;
  const photoX = startX + (w - photoSize) / 2;

  doc.setFillColor(235, 240, 235);
  doc.setDrawColor(79, 109, 122);
  doc.setLineWidth(0.4);
  doc.rect(photoX, photoY, photoSize, photoSize, 'FD');

  if (student.photoUrl && student.photoUrl.startsWith('data:image')) {
    try {
      doc.addImage(student.photoUrl, 'JPEG', photoX, photoY, photoSize, photoSize);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text('PHOTO', startX + w / 2, photoY + 14, { align: 'center' });
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('STUDENT PHOTO', startX + w / 2, photoY + 14, { align: 'center' });
  }

  // Student Name
  let detailsY = photoY + photoSize + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(45, 49, 46);
  doc.text(student.name.toUpperCase(), startX + w / 2, detailsY, { align: 'center' });

  // Standard Pill
  detailsY += 5.5;
  doc.setFillColor(79, 109, 122);
  doc.roundedRect(startX + 18, detailsY - 3.5, w - 36, 5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(`CLASS: ${student.standard} - SEC: ${student.section} | ROLL: ${student.rollNo}`, startX + w / 2, detailsY, { align: 'center' });

  // Details Grid
  detailsY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);

  const leftX = startX + 6;
  const valueX = startX + 32;

  const fields = [
    { label: 'Admission No:', val: student.admissionNo },
    { label: 'Parent Name:', val: student.parentName },
    { label: 'Emergency Contact:', val: student.parentPhone },
    { label: 'Blood Group:', val: student.bloodGroup || 'O+ve' },
    { label: 'Van Transport:', val: student.vanFacility ? `Yes (${student.vanRoute || 'Essur Route'})` : 'No' },
    { label: 'Residential Area:', val: (student.address || 'Essur').substring(0, 24) },
  ];

  fields.forEach(f => {
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(f.label, leftX, detailsY);
    doc.setTextColor(45, 49, 46);
    doc.setFont('helvetica', 'bold');
    doc.text(f.val, valueX, detailsY);
    detailsY += 4.2;
  });

  // Bottom Signature & Seal
  const footerY = startY + h - 12;
  doc.setDrawColor(200, 200, 200);
  doc.line(startX + 4, footerY, startX + w - 4, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Parent Signature', startX + 16, footerY + 8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(45, 49, 46);
  doc.text(school.adminName, startX + w - 18, footerY + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Headmaster Seal', startX + w - 18, footerY + 9, { align: 'center' });
}
