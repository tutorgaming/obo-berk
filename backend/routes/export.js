const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');
const Expense = require('../models/Expense');

// Export project expenses as PDF
router.get('/project/:projectId/pdf', async (req, res) => {
  try {
    const { type } = req.query; // Optional: filter by expense type

    // Get project details
    const project = await Project.findById(req.params.projectId)
      .populate('userId', 'name email department');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get expenses
    const filter = { projectId: req.params.projectId };
    if (type) {
      filter.type = type;
    }

    const expenses = await Expense.find(filter).sort({ date: 1 });

    if (expenses.length === 0) {
      return res.status(404).json({ error: 'No expenses found for this project' });
    }

    // Create PDF document with proper font support
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=expenses-${project.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Register Thai fonts for entire document
    const thaiFont = path.join(__dirname, '../fonts/THSarabunNew.ttf');
    const thaiFontBold = path.join(__dirname, '../fonts/THSarabunNew Bold.ttf');

    if (fs.existsSync(thaiFont)) {
      try {
        doc.registerFont('ThaiFont', thaiFont);
        if (fs.existsSync(thaiFontBold)) {
          doc.registerFont('ThaiFontBold', thaiFontBold);
        } else {
          doc.registerFont('ThaiFontBold', thaiFont); // Use regular as fallback
        }
        console.log('Thai fonts loaded successfully');
      } catch (error) {
        console.error('Error loading Thai font:', error);
      }
    } else {
      console.error('Thai font file not found at:', thaiFont);
    }

    // Title - Use Thai font
    doc.font('ThaiFontBold').fontSize(22).text('OBO-Berk (โอโบ-เบิก)', { align: 'center' });
    doc.font('ThaiFont').fontSize(18).text('รายงานค่าใช้จ่าย / Expense Report', { align: 'center' });

    // Add category if filtered
    if (type) {
      const categoryMap = {
        'eating': 'อาหาร / Eating',
        'traveling': 'การเดินทาง / Traveling',
        'accommodation': 'ที่พัก / Accommodation',
        'equipment': 'อุปกรณ์ / Equipment',
        'other': 'อื่นๆ / Other'
      };
      const categoryLabel = categoryMap[type] || type;
      doc.font('ThaiFontBold').fontSize(14).text(`ประเภท / Category: ${categoryLabel}`, { align: 'center' });
    }

    doc.moveDown();

    // Project information
    doc.font('ThaiFont').fontSize(13);
    doc.text(`โครงการ / Project: ${project.name}`, { continued: false });
    if (project.description) {
      doc.text(`รายละเอียด / Description: ${project.description}`);
    }
    doc.text(`เจ้าของโครงการ / Owner: ${project.userId.name} (${project.userId.email})`);
    if (project.userId.department) {
      doc.text(`แผนก / Department: ${project.userId.department}`);
    }
    //doc.text(`สร้างรายงาน / Generated: ${new Date().toLocaleString('th-TH')}`);
    doc.moveDown();

    // Calculate total (will be used in table footer)
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Expense table with borders
    doc.font('ThaiFontBold').fontSize(10);
    const tableTop = doc.y;
    const tableLeft = 50;
    const tableWidth = 500;

    // Column positions and widths
    const col1X = tableLeft;        // ลำดับที่ (No)
    const col1W = 40;
    const col2X = col1X + col1W;    // วันที่ (Date)
    const col2W = 70;
    const col3X = col2X + col2W;    // รายการ (Name)
    const col3W = 180;
    const col4X = col3X + col3W;    // จำนวนเงิน (Amount)
    const col4W = 80;
    const col5X = col4X + col4W;    // หมายเหตุ (Note)
    const col5W = tableWidth - col1W - col2W - col3W - col4W;

    const rowHeight = 25;
    let currentY = tableTop;

    // Draw table header
    // Header background
    doc.rect(tableLeft, currentY, tableWidth, rowHeight).fill('#f0f0f0');

    // Header text
    doc.fillColor('#000000').font('ThaiFontBold').fontSize(10);
    doc.text('ลำดับที่', col1X + 5, currentY + 7, { width: col1W - 10, align: 'center' });
    doc.text('วันที่', col2X + 5, currentY + 7, { width: col2W - 10, align: 'center' });
    doc.text('รายการ', col3X + 5, currentY + 7, { width: col3W - 10, align: 'left' });
    doc.text('จำนวนเงิน', col4X + 5, currentY + 7, { width: col4W - 10, align: 'right' });
    doc.text('หมายเหตุ', col5X + 5, currentY + 7, { width: col5W - 10, align: 'left' });

    // Header borders
    doc.rect(tableLeft, currentY, tableWidth, rowHeight).stroke();
    doc.moveTo(col2X, currentY).lineTo(col2X, currentY + rowHeight).stroke();
    doc.moveTo(col3X, currentY).lineTo(col3X, currentY + rowHeight).stroke();
    doc.moveTo(col4X, currentY).lineTo(col4X, currentY + rowHeight).stroke();
    doc.moveTo(col5X, currentY).lineTo(col5X, currentY + rowHeight).stroke();

    currentY += rowHeight;

    // Expense rows
    doc.font('ThaiFont').fontSize(9);
    expenses.forEach((expense, index) => {
      // Check if we need a new page
      if (currentY > 720) {
        doc.addPage();
        currentY = 50;

        // Redraw header on new page
        doc.rect(tableLeft, currentY, tableWidth, rowHeight).fill('#f0f0f0');
        doc.fillColor('#000000').font('ThaiFontBold').fontSize(10);
        doc.text('ลำดับที่', col1X + 5, currentY + 7, { width: col1W - 10, align: 'center' });
        doc.text('วันที่', col2X + 5, currentY + 7, { width: col2W - 10, align: 'center' });
        doc.text('รายการ', col3X + 5, currentY + 7, { width: col3W - 10, align: 'left' });
        doc.text('จำนวนเงิน', col4X + 5, currentY + 7, { width: col4W - 10, align: 'right' });
        doc.text('หมายเหตุ', col5X + 5, currentY + 7, { width: col5W - 10, align: 'left' });

        doc.rect(tableLeft, currentY, tableWidth, rowHeight).stroke();
        doc.moveTo(col2X, currentY).lineTo(col2X, currentY + rowHeight).stroke();
        doc.moveTo(col3X, currentY).lineTo(col3X, currentY + rowHeight).stroke();
        doc.moveTo(col4X, currentY).lineTo(col4X, currentY + rowHeight).stroke();
        doc.moveTo(col5X, currentY).lineTo(col5X, currentY + rowHeight).stroke();

        currentY += rowHeight;
        doc.font('ThaiFont').fontSize(9);
      }

      const rowNum = (index + 1).toString();
      const expenseDate = new Date(expense.date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const expenseName = expense.name;
      const expenseAmount = expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
      const expenseNote = expense.notes || '-';

      // Row background (alternate colors)
      if (index % 2 === 0) {
        doc.rect(tableLeft, currentY, tableWidth, rowHeight).fillAndStroke('#ffffff', '#000000');
      } else {
        doc.rect(tableLeft, currentY, tableWidth, rowHeight).fillAndStroke('#f9f9f9', '#000000');
      }

      // Row text
      doc.fillColor('#000000');
      doc.text(rowNum, col1X + 5, currentY + 7, { width: col1W - 10, align: 'center' });
      doc.text(expenseDate, col2X + 5, currentY + 7, { width: col2W - 10, align: 'center' });
      doc.text(expenseName, col3X + 5, currentY + 7, { width: col3W - 10, align: 'left', ellipsis: true });
      doc.text(expenseAmount, col4X + 5, currentY + 7, { width: col4W - 10, align: 'right' });
      doc.text(expenseNote, col5X + 5, currentY + 7, { width: col5W - 10, align: 'left', ellipsis: true });

      // Column borders
      doc.moveTo(col2X, currentY).lineTo(col2X, currentY + rowHeight).stroke();
      doc.moveTo(col3X, currentY).lineTo(col3X, currentY + rowHeight).stroke();
      doc.moveTo(col4X, currentY).lineTo(col4X, currentY + rowHeight).stroke();
      doc.moveTo(col5X, currentY).lineTo(col5X, currentY + rowHeight).stroke();

      currentY += rowHeight;
    });

    // Add total row at the bottom of the table
    const formattedTotal = totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Total row background (highlighted)
    doc.rect(tableLeft, currentY, tableWidth, rowHeight).fillAndStroke('#e8f4f8', '#000000');

    // Total row text
    doc.fillColor('#000000').font('ThaiFontBold').fontSize(10);
    doc.text('รวมทั้งสิ้น', col3X + 5, currentY + 7, { width: col3W - 10, align: 'right' });
    doc.text(formattedTotal, col4X + 5, currentY + 7, { width: col4W - 10, align: 'right' });
    doc.text('บาท', col5X + 5, currentY + 7, { width: col5W - 10, align: 'left' });

    // Total row borders
    doc.moveTo(col2X, currentY).lineTo(col2X, currentY + rowHeight).stroke();
    doc.moveTo(col3X, currentY).lineTo(col3X, currentY + rowHeight).stroke();
    doc.moveTo(col4X, currentY).lineTo(col4X, currentY + rowHeight).stroke();
    doc.moveTo(col5X, currentY).lineTo(col5X, currentY + rowHeight).stroke();

    currentY += rowHeight;

    // Add certification paragraph and signature area
    currentY += 30; // Space after table

    // Check if we need a new page for certification
    if (currentY > 650) {
      doc.addPage();
      currentY = 50;
    }

    // Get date range from expenses
    const startDate = new Date(expenses[0].date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const endDate = new Date(expenses[expenses.length - 1].date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Total amount in words area
    doc.font('ThaiFont').fontSize(12);
    doc.text('รวมทั้งสิ้น ', tableLeft, currentY, { continued: true });
    doc.text('_'.repeat(40));
    currentY += 30;

    // Certification paragraph
    doc.font('ThaiFont').fontSize(12);
    const certText = `ข้าพเจ้า ${project.userId.name} ตำแหน่ง ${project.userId.department || '_______________'}
ขอรับรองว่า รายจ่ายขั้นต้นนี้ ไม่อาจเรียกเก็บใบเสร็จจากผู้รับได้ และข้าพเจ้าได้จ่ายไปในงานของทางบริษัท / ห้างหุ้นส่วนจำกัด โดยแท้ ตั้งแต่ ${startDate} จนถึงวันที่ ${endDate}`;

    doc.text(certText, tableLeft, currentY, {
      width: tableWidth,
      align: 'left',
      lineGap: 5
    });

    currentY += 80; // Space for paragraph

    // Signature line
    doc.font('ThaiFont').fontSize(12);
    doc.text('ลงชื่อ ', tableLeft + 300, currentY, { continued: true });
    doc.text('_'.repeat(25));

    currentY += 30;

    // Name line under signature
    doc.font('ThaiFont').fontSize(11);
    doc.text(`(${project.userId.name})`, tableLeft + 320, currentY, { align: 'center', width: 200 });

    // Add new page for expense details with receipts
    doc.addPage();
    doc.font('ThaiFontBold').fontSize(16).text('รายละเอียดค่าใช้จ่ายและใบเสร็จ / Expense Details with Receipts', 50, 50);
    doc.moveDown();

    let detailY = doc.y;
    let receiptsOnCurrentPage = 0;
    const maxReceiptsPerPage = 4;
    const receiptWidth = 250  // Slightly larger width for 2 columns
    const receiptHeight = 200 // Slightly larger height for 2 rows
    const leftColumnX = 50
    const rightColumnX = 310
    const verticalSpacing = 220 // Space between rows (increased for larger images)

    for (let i = 0; i < expenses.length; i++) {
      const expense = expenses[i];

      // Start a new page if we've placed 4 receipts
      if (receiptsOnCurrentPage >= maxReceiptsPerPage) {
        doc.addPage();
        detailY = 50;
        receiptsOnCurrentPage = 0;
      }

      // Calculate position based on receipt count
      const isLeftColumn = receiptsOnCurrentPage % 2 === 0;
      const isTopRow = receiptsOnCurrentPage < 2;
      const xPosition = isLeftColumn ? leftColumnX : rightColumnX;
      const yPosition = isTopRow ? detailY : detailY + verticalSpacing;

      // Add expense info with Thai font
      doc.font('ThaiFontBold').fontSize(11);
      doc.text(`${i + 1}. ${expense.name}`, xPosition, yPosition, { width: receiptWidth });

      doc.font('ThaiFont').fontSize(9);
      doc.text(`วันที่/Date: ${new Date(expense.date).toLocaleDateString('th-TH')}`, xPosition, yPosition + 14, { width: receiptWidth });
      doc.text(`ประเภท/Type: ${expense.type}`, xPosition, yPosition + 26, { width: receiptWidth });

      // Format amount properly for Thai display
      const formattedAmount = expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
      doc.text(`จำนวน/Amount: ${formattedAmount} บาท`, xPosition, yPosition + 38, { width: receiptWidth });      // Add receipt image if exists
      if (expense.receiptFile && expense.receiptFile.path) {
        const receiptPath = expense.receiptFile.path;

        if (fs.existsSync(receiptPath)) {
          try {
            // Check if it's an image (not PDF)
            const isImage = /\.(jpg|jpeg|png)$/i.test(receiptPath);

            if (isImage) {
              doc.fontSize(8).text('ใบเสร็จ/Receipt:', xPosition, yPosition + 50, { width: receiptWidth });

              // Add image with larger dimensions (increased from 230x110 to 240x130)
              doc.image(receiptPath, xPosition, yPosition + 62, {
                fit: [receiptWidth - 10, receiptHeight - 62],
                align: 'left'
              });
            } else {
              doc.fontSize(8).text('ใบเสร็จ/Receipt: PDF file', xPosition, yPosition + 50, { width: receiptWidth });
            }
          } catch (err) {
            console.error('Error adding image:', err);
            doc.fontSize(8).text('ใบเสร็จ/Receipt: Error loading', xPosition, yPosition + 50, { width: receiptWidth });
          }
        } else {
          doc.fontSize(8).text('ใบเสร็จ/Receipt: File not found', xPosition, yPosition + 50, { width: receiptWidth });
        }
      } else {
        doc.fontSize(8).text('ใบเสร็จ/Receipt: No receipt uploaded', xPosition, yPosition + 50, { width: receiptWidth });
      }

      if (expense.notes) {
        doc.fontSize(8).text(`หมายเหตุ/Note: ${expense.notes}`, xPosition, yPosition + receiptHeight - 15, {
          width: receiptWidth,
          ellipsis: true
        });
      }

      receiptsOnCurrentPage++;

      // Update Y position after processing 2 receipts (one row)
      if (receiptsOnCurrentPage % 2 === 0 && receiptsOnCurrentPage < maxReceiptsPerPage) {
        // Don't update yet, we'll use the spacing for the next row
      } else if (receiptsOnCurrentPage >= maxReceiptsPerPage) {
        // Reset for new page
        detailY = 50;
      }
    }

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
