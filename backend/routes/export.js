const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const bahttext = require('bahttext');
const Project = require('../models/Project');
const Expense = require('../models/Expense');

// Export project expenses as PDF
router.get('/project/:projectId/pdf', async (req, res) => {
  try {
    const { type } = req.query; // Optional: filter by expense type

    // Get project details
    const project = await Project.findById(req.params.projectId)
      .populate('userId', 'name email department')
      .populate('supervisorId', 'name email department');

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
    // doc.font('ThaiFontBold').fontSize(22).text('OBO-Berk (โอโบ-เบิก)', { align: 'center' });
    // doc.font('ThaiFont').fontSize(18).text('รายงานค่าใช้จ่าย / Expense Report', { align: 'center' });

    // Proper Title for this form generation
    doc.font('ThaiFont').fontSize(12).text(
      '(กรณีไม่สามารถเรียกใบเสร็จรับเงินจากผู้ขายหรือผู้ให้บริการได้)',
      { align: 'center' }
    );
    doc.font('ThaiFontBold').fontSize(22).text(
      'ใบรับรองแทนใบเสร็จรับเงิน',
      { align: 'center' }
    );

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

    // Date Generated
    doc.font('ThaiFont').fontSize(13);
    doc.text(
      `วันที่: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`,
      { align: 'right' }
    );

    doc.text(
      'บจ./หจก.  โอโบดรอยด์ คอร์ปอเรชั่น  (ผู้ซื้อ/ผู้รับบริการ)',
      { align: 'center' }
    )

    // Project information
    // doc.font('ThaiFont').fontSize(13);
    // doc.text(`โครงการ / Project: ${project.name}`, { continued: false });
    // if (project.description) {
    //   doc.text(`รายละเอียด / Description: ${project.description}`);
    // }
    // doc.text(`เจ้าของโครงการ / Owner: ${project.userId.name} (${project.userId.email})`);
    // if (project.userId.department) {
    //   doc.text(`แผนก / Department: ${project.userId.department}`);
    // }
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
    const col1W = 30;
    const col2X = col1X + col1W;    // วันที่ (Date)
    const col2W = 60;
    const col3X = col2X + col2W;    // ร้านค้า (Shop Name)
    const col3W = 110;
    const col4X = col3X + col3W;    // รายละเอียด (Detail)
    const col4W = 120;
    const col5X = col4X + col4W;    // จำนวนเงิน (Amount)
    const col5W = 70;
    const col6X = col5X + col5W;    // หมายเหตุ (Note)
    const col6W = tableWidth - col1W - col2W - col3W - col4W - col5W;

    const rowHeight = 22;
    let currentY = tableTop;

    // Draw table header
    // Header background
    doc.rect(tableLeft, currentY, tableWidth, rowHeight).fill('#f0f0f0');

    // Header text
    doc.fillColor('#000000').font('ThaiFontBold').fontSize(12);
    doc.text('ลำดับ', col1X + 2, currentY + 7, { width: col1W - 4, align: 'center' });
    doc.text('วันที่', col2X + 2, currentY + 7, { width: col2W - 4, align: 'center' });
    doc.text('ร้านค้า', col3X + 2, currentY + 7, { width: col3W - 4, align: 'center' });
    doc.text('รายละเอียด', col4X + 2, currentY + 7, { width: col4W - 4, align: 'center' });
    doc.text('จำนวนเงิน', col5X + 2, currentY + 7, { width: col5W - 4, align: 'right' });
    doc.text('หมายเหตุ', col6X + 2, currentY + 7, { width: col6W - 4, align: 'left' });

    // Header borders
    doc.rect(tableLeft, currentY, tableWidth, rowHeight).stroke();
    doc.moveTo(col2X, currentY).lineTo(col2X, currentY + rowHeight).stroke();
    doc.moveTo(col3X, currentY).lineTo(col3X, currentY + rowHeight).stroke();
    doc.moveTo(col4X, currentY).lineTo(col4X, currentY + rowHeight).stroke();
    doc.moveTo(col5X, currentY).lineTo(col5X, currentY + rowHeight).stroke();
    doc.moveTo(col6X, currentY).lineTo(col6X, currentY + rowHeight).stroke();

    currentY += rowHeight;

    // Expense rows
    doc.font('ThaiFont').fontSize(12);
    expenses.forEach((expense, index) => {
      // Check if we need a new page
      if (currentY > 720) {
        doc.addPage();
        currentY = 50;

        // Redraw header on new page
        doc.rect(tableLeft, currentY, tableWidth, rowHeight).fill('#f0f0f0');
        doc.fillColor('#000000').font('ThaiFontBold').fontSize(9);
        doc.text('ลำดับ', col1X + 2, currentY + 7, { width: col1W - 4, align: 'center' });
        doc.text('วันที่', col2X + 2, currentY + 7, { width: col2W - 4, align: 'center' });
        doc.text('ร้านค้า', col3X + 2, currentY + 7, { width: col3W - 4, align: 'center' });
        doc.text('รายละเอียด', col4X + 2, currentY + 7, { width: col4W - 4, align: 'center' });
        doc.text('จำนวนเงิน', col5X + 2, currentY + 7, { width: col5W - 4, align: 'right' });
        doc.text('หมายเหตุ', col6X + 2, currentY + 7, { width: col6W - 4, align: 'left' });

        doc.rect(tableLeft, currentY, tableWidth, rowHeight).stroke();
        doc.moveTo(col2X, currentY).lineTo(col2X, currentY + rowHeight).stroke();
        doc.moveTo(col3X, currentY).lineTo(col3X, currentY + rowHeight).stroke();
        doc.moveTo(col4X, currentY).lineTo(col4X, currentY + rowHeight).stroke();
        doc.moveTo(col5X, currentY).lineTo(col5X, currentY + rowHeight).stroke();
        doc.moveTo(col6X, currentY).lineTo(col6X, currentY + rowHeight).stroke();

        currentY += rowHeight;
        doc.font('ThaiFont').fontSize(9);
      }

      const rowNum = (index + 1).toString();
      const expenseDate = new Date(expense.date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Asia/Bangkok'
      });
      const shopName = expense.shop_name || expense.name || '-';
      const expenseDetail = expense.detail || '-';
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
      doc.text(rowNum, col1X + 2, currentY + 7, { width: col1W - 4, align: 'center' });
      doc.text(expenseDate, col2X + 2, currentY + 7, { width: col2W - 4, align: 'center' });
      doc.text(shopName, col3X + 2, currentY + 7, { width: col3W - 4, align: 'left', ellipsis: true });
      doc.text(expenseDetail, col4X + 2, currentY + 7, { width: col4W - 4, align: 'left', ellipsis: true });
      doc.text(expenseAmount, col5X + 2, currentY + 7, { width: col5W - 4, align: 'right' });
      doc.text(expenseNote, col6X + 2, currentY + 7, { width: col6W - 4, align: 'left', ellipsis: true });

      // Column borders
      doc.moveTo(col2X, currentY).lineTo(col2X, currentY + rowHeight).stroke();
      doc.moveTo(col3X, currentY).lineTo(col3X, currentY + rowHeight).stroke();
      doc.moveTo(col4X, currentY).lineTo(col4X, currentY + rowHeight).stroke();
      doc.moveTo(col5X, currentY).lineTo(col5X, currentY + rowHeight).stroke();
      doc.moveTo(col6X, currentY).lineTo(col6X, currentY + rowHeight).stroke();

      currentY += rowHeight;
    });

    // Add total row at the bottom of the table
    const formattedTotal = totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 });

    // Total row background (highlighted)
    doc.rect(tableLeft, currentY, tableWidth, rowHeight).fillAndStroke('#e8f4f8', '#000000');

    // Total row text
    doc.fillColor('#000000').font('ThaiFontBold').fontSize(10);
    doc.text('รวมทั้งสิ้น', col4X + 2, currentY + 7, { width: col4W - 4, align: 'right' });
    doc.text(formattedTotal, col5X + 2, currentY + 7, { width: col5W - 4, align: 'right' });
    doc.text('บาท', col6X + 2, currentY + 7, { width: col6W - 4, align: 'left' });

    // Total row borders
    doc.moveTo(col2X, currentY).lineTo(col2X, currentY + rowHeight).stroke();
    doc.moveTo(col3X, currentY).lineTo(col3X, currentY + rowHeight).stroke();
    doc.moveTo(col4X, currentY).lineTo(col4X, currentY + rowHeight).stroke();
    doc.moveTo(col5X, currentY).lineTo(col5X, currentY + rowHeight).stroke();
    doc.moveTo(col6X, currentY).lineTo(col6X, currentY + rowHeight).stroke();

    currentY += rowHeight;

    // Add certification paragraph and signature area
    currentY += 30; // Space after table

    // Check if we need a new page for certification and signatures
    // Certification paragraph: ~100px, Signatures: ~150px (employee + supervisor)
    // Total needed: ~250px to be safe
    const spaceNeeded = project.supervisorId ? 280 : 200; // More space if supervisor exists

    if (currentY + spaceNeeded > 750) { // 750 is safer than 650 for page height
      doc.addPage();
      currentY = 50;
    }

    // Get date range from expenses
    const startDate = new Date(expenses[0].date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Bangkok'
    });
    const endDate = new Date(expenses[expenses.length - 1].date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Bangkok'
    });

    // Total amount in words area
    doc.font('ThaiFont').fontSize(12);
    const totalInWords = bahttext.bahttext(totalAmount);
    doc.text('รวมทั้งสิ้น ', tableLeft, currentY, { continued: true });
    doc.font('ThaiFontBold').text(`${totalInWords}`, { continued: false });
    currentY += 30;

    // Certification paragraph
    doc.font('ThaiFont').fontSize(14);
    const certText = `ข้าพเจ้า ${project.userId.name} ตำแหน่ง ${project.userId.department || '_______________'} ขอรับรองว่า รายจ่ายขั้นต้นนี้ ไม่อาจเรียกเก็บใบเสร็จจากผู้รับได้ และข้าพเจ้าได้จ่ายไปในงานของทางบริษัท / ห้างหุ้นส่วนจำกัด โดยแท้ ตั้งแต่ ${startDate} จนถึงวันที่ ${endDate}`;

    doc.text(certText, tableLeft, currentY, {
      width: tableWidth,
      align: 'left',
      lineGap: 5
    });

    currentY += 80; // Space for paragraph

    // Signature lines - Employee signature first, then Supervisor on next line (both aligned right)
    doc.font('ThaiFont').fontSize(12);

    // Employee signature (right aligned)
    doc.text('ลงชื่อ ________________________________________ (ผู้เบิกจ่าย)', { align: 'right'});
    currentY = doc.y + 5;

    // Employee name (centered within signature area)
    doc.font('ThaiFont').fontSize(14);
    const employeeNameWidth = 200; // Width for centering
    const rightMargin = 30; // Right margin
    doc.text(`${project.userId.name}`, tableWidth + tableLeft - employeeNameWidth - rightMargin, currentY, {
      width: employeeNameWidth,
      align: 'center'
    });

    doc.moveDown();

    // Supervisor signature (right aligned, on next line) if exists
    if (project.supervisorId) {
      currentY = doc.y + 40;

      doc.font('ThaiFont').fontSize(12);
      doc.text('ลงชื่อ ________________________________ (หัวหน้างาน/ผู้อนุมัติ)', { align: 'right'});

      currentY = doc.y + 5;

      // Supervisor name (centered within signature area)
      doc.font('ThaiFont').fontSize(14);
      doc.text(`${project.supervisorId.name}`, tableWidth + tableLeft - employeeNameWidth - rightMargin, currentY, {
        width: employeeNameWidth,
        align: 'center'
      });
    }

    currentY += 50;

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
      const displayName = expense.shop_name || expense.name || 'ไม่ระบุ';
      doc.font('ThaiFontBold').fontSize(11);
      doc.text(`${i + 1}. ${displayName}`, xPosition, yPosition, { width: receiptWidth });

      doc.font('ThaiFont').fontSize(9);
      doc.text(`วันที่/Date: ${new Date(expense.date).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })}`, xPosition, yPosition + 14, { width: receiptWidth });
      if (expense.detail) {
        doc.text(`รายละเอียด/Detail: ${expense.detail}`, xPosition, yPosition + 26, { width: receiptWidth });
      }
      doc.text(`ประเภท/Type: ${expense.type}`, xPosition, yPosition + (expense.detail ? 38 : 26), { width: receiptWidth });

      // Format amount properly for Thai display
      const formattedAmount = expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
      doc.text(`จำนวน/Amount: ${formattedAmount} บาท`, xPosition, yPosition + (expense.detail ? 50 : 38), { width: receiptWidth });

      // Add receipt image if exists
      if (expense.receiptFile && expense.receiptFile.path) {
        const receiptPath = expense.receiptFile.path;

        if (fs.existsSync(receiptPath)) {
          try {
            // Check if it's an image (not PDF)
            const isImage = /\.(jpg|jpeg|png)$/i.test(receiptPath);

            if (isImage) {
              doc.fontSize(8).text('ใบเสร็จ/Receipt:', xPosition, yPosition + (expense.detail ? 62 : 50), { width: receiptWidth });

              // Add image with larger dimensions (increased from 230x110 to 240x130)
              doc.image(receiptPath, xPosition, yPosition + (expense.detail ? 74 : 62), {
                fit: [receiptWidth - 10, receiptHeight - 62],
                align: 'left'
              });
            } else {
              doc.fontSize(8).text('ใบเสร็จ/Receipt: PDF file', xPosition, yPosition + (expense.detail ? 62 : 50), { width: receiptWidth });
            }
          } catch (err) {
            console.error('Error adding image:', err);
            doc.fontSize(8).text('ใบเสร็จ/Receipt: Error loading', xPosition, yPosition + (expense.detail ? 62 : 50), { width: receiptWidth });
          }
        } else {
          doc.fontSize(8).text('ใบเสร็จ/Receipt: File not found', xPosition, yPosition + (expense.detail ? 62 : 50), { width: receiptWidth });
        }
      } else {
        doc.fontSize(8).text('ใบเสร็จ/Receipt: No receipt uploaded', xPosition, yPosition + (expense.detail ? 62 : 50), { width: receiptWidth });
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
