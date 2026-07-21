import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';

/**
 * Bridges DOCX <-> PDF by calling Gotenberg (a small Docker container
 * that wraps a real LibreOffice install behind an HTTP API).
 *
 * Why this matters for fidelity: LibreOffice is the exact engine that
 * would render the DOCX if you opened it yourself, so the resulting PDF
 * matches the template's fonts, spacing, and table layout precisely —
 * this is not a re-implementation/approximation of DOCX layout rules.
 *
 * Run `docker compose up -d` in the project root before using this
 * service (see docker-compose.yml).
 */
@Injectable()
export class ConversionService {
  private readonly logger = new Logger(ConversionService.name);
  private readonly gotenbergUrl = process.env.GOTENBERG_URL || 'http://localhost:3001';

  async docxToPdf(docxBuffer: Buffer, filename = 'file.docx'): Promise<Buffer> {
    const form = new FormData();
    form.append('files', docxBuffer, filename);

    try {
      const res = await axios.post(
        `${this.gotenbergUrl}/forms/libreoffice/convert`,
        form,
        { headers: form.getHeaders(), responseType: 'arraybuffer' },
      );
      return Buffer.from(res.data);
    } catch (err) {
      this.logger.error('Gotenberg docxToPdf failed', err?.message);
      throw new ServiceUnavailableException(
        'PDF conversion service unavailable. Is Gotenberg running? ' +
          '(docker compose up -d in the project root)',
      );
    }
  }

  async pdfToDocx(pdfBuffer: Buffer, filename = 'file.pdf'): Promise<Buffer> {
    const form = new FormData();
    form.append('files', pdfBuffer, filename);
    form.append('convertTo', 'docx');

    try {
      const res = await axios.post(
        `${this.gotenbergUrl}/forms/libreoffice/convert`,
        form,
        { headers: form.getHeaders(), responseType: 'arraybuffer' },
      );
      return Buffer.from(res.data);
    } catch (err) {
      this.logger.error('Gotenberg pdfToDocx failed', err?.message);
      throw new ServiceUnavailableException(
        'PDF->DOCX conversion service unavailable. Is Gotenberg running? ' +
          '(docker compose up -d in the project root)',
      );
    }
  }
}
