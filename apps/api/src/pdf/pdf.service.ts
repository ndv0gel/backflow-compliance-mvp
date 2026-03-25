import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { TestResult } from '@prisma/client';

interface TestReportPdfInput {
  testId: string;
  timestamp: Date;
  device: {
    deviceId: string;
    serialNumber: string;
    deviceType: string;
    manufacturer: string;
    model: string;
    locationAddress: string;
    city: string;
    state: string;
    zip: string;
  };
  tester: {
    name: string;
    certificationNumber: string;
    certificationExpiration: Date;
  };
  readings: {
    checkValve1: number;
    checkValve2: number;
    reliefValve: number;
  };
  result: TestResult;
  notes?: string;
  signatureUrl?: string;
}

@Injectable()
export class PdfService {
  async generateTestReportPdf(input: TestReportPdfInput): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([612, 792]);
    const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);

    let y = 760;
    const left = 50;

    page.drawText('Backflow Test Report', {
      x: left,
      y,
      size: 20,
      font: titleFont,
      color: rgb(0.1, 0.2, 0.35),
    });

    y -= 28;
    page.drawText(`Test ID: ${input.testId}`, {
      x: left,
      y,
      size: 11,
      font: bodyFont,
    });
    y -= 16;
    page.drawText(`Timestamp: ${input.timestamp.toISOString()}`, {
      x: left,
      y,
      size: 11,
      font: bodyFont,
    });

    y -= 26;
    page.drawText('Device Details', { x: left, y, size: 13, font: titleFont });
    y -= 18;
    page.drawText(`Device ID: ${input.device.deviceId}`, {
      x: left,
      y,
      size: 11,
      font: bodyFont,
    });
    y -= 14;
    page.drawText(`Serial: ${input.device.serialNumber}`, {
      x: left,
      y,
      size: 11,
      font: bodyFont,
    });
    y -= 14;
    page.drawText(`Type: ${input.device.deviceType}`, {
      x: left,
      y,
      size: 11,
      font: bodyFont,
    });
    y -= 14;
    page.drawText(
      `Manufacturer/Model: ${input.device.manufacturer} ${input.device.model}`,
      {
        x: left,
        y,
        size: 11,
        font: bodyFont,
      },
    );
    y -= 14;
    page.drawText(
      `Location: ${input.device.locationAddress}, ${input.device.city}, ${input.device.state} ${input.device.zip}`,
      { x: left, y, size: 10, font: bodyFont },
    );

    y -= 24;
    page.drawText('Tester Information', {
      x: left,
      y,
      size: 13,
      font: titleFont,
    });
    y -= 18;
    page.drawText(`Name: ${input.tester.name}`, {
      x: left,
      y,
      size: 11,
      font: bodyFont,
    });
    y -= 14;
    page.drawText(`Certification #: ${input.tester.certificationNumber}`, {
      x: left,
      y,
      size: 11,
      font: bodyFont,
    });
    y -= 14;
    page.drawText(
      `Certification Expiration: ${input.tester.certificationExpiration.toISOString().slice(0, 10)}`,
      {
        x: left,
        y,
        size: 11,
        font: bodyFont,
      },
    );

    y -= 24;
    page.drawText('Readings', { x: left, y, size: 13, font: titleFont });
    y -= 18;
    page.drawText(`Check Valve 1: ${input.readings.checkValve1.toFixed(2)}`, {
      x: left,
      y,
      size: 11,
      font: bodyFont,
    });
    y -= 14;
    page.drawText(`Check Valve 2: ${input.readings.checkValve2.toFixed(2)}`, {
      x: left,
      y,
      size: 11,
      font: bodyFont,
    });
    y -= 14;
    page.drawText(`Relief Valve: ${input.readings.reliefValve.toFixed(2)}`, {
      x: left,
      y,
      size: 11,
      font: bodyFont,
    });

    y -= 24;
    page.drawText(`Result: ${input.result}`, {
      x: left,
      y,
      size: 13,
      font: titleFont,
    });

    if (input.notes) {
      y -= 24;
      page.drawText('Notes:', { x: left, y, size: 12, font: titleFont });
      y -= 16;
      page.drawText(input.notes.slice(0, 450), {
        x: left,
        y,
        size: 10,
        font: bodyFont,
        maxWidth: 500,
      });
    }

    if (input.signatureUrl) {
      y -= 40;
      page.drawText(`Signature File: ${input.signatureUrl}`, {
        x: left,
        y,
        size: 9,
        font: bodyFont,
      });
    }

    return pdf.save();
  }
}
