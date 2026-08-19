import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import * as XLSX from 'xlsx';

export interface VoterRecord {
  studentId: string;
  fullName: string;
  email: string;
  faculty: string;
  department: string;
}

export interface ParseResult {
  records: VoterRecord[];
  errors: string[];
  totalRows: number;
}

const normalizeHeader = (header: string): string => {
  const h = header.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (['studentid', 'sid', 'id', 'matricno', 'matricnumber', 'studentnumber'].includes(h)) return 'studentId';
  if (['fullname', 'name', 'studentname', 'full_name'].includes(h)) return 'fullName';
  if (['email', 'emailaddress', 'studentemail', 'mail'].includes(h)) return 'email';
  if (['faculty', 'school', 'college'].includes(h)) return 'faculty';
  if (['department', 'dept', 'program', 'programme'].includes(h)) return 'department';
  return h;
};

export const parseCSV = (filePath: string): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    const records: VoterRecord[] = [];
    const errors: string[] = [];
    let rowIndex = 0;

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row: any) => {
        rowIndex++;
        const normalized: any = {};
        for (const [key, value] of Object.entries(row)) {
          normalized[normalizeHeader(key)] = (value as string)?.toString().trim();
        }

        if (!normalized.studentId) {
          errors.push(`Row ${rowIndex}: Missing Student ID`);
          return;
        }
        if (!normalized.fullName) {
          errors.push(`Row ${rowIndex}: Missing Full Name`);
          return;
        }
        if (!normalized.email) {
          errors.push(`Row ${rowIndex}: Missing Email`);
          return;
        }
        if (!normalized.faculty) {
          errors.push(`Row ${rowIndex}: Missing Faculty`);
          return;
        }
        if (!normalized.department) {
          errors.push(`Row ${rowIndex}: Missing Department`);
          return;
        }

        records.push({
          studentId: normalized.studentId.toUpperCase(),
          fullName: normalized.fullName,
          email: normalized.email.toLowerCase(),
          faculty: normalized.faculty,
          department: normalized.department,
        });
      })
      .on('end', () => resolve({ records, errors, totalRows: rowIndex }))
      .on('error', reject);
  });
};

export const parseXLSX = (filePath: string): ParseResult => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json<any>(worksheet);

  const records: VoterRecord[] = [];
  const errors: string[] = [];

  rawData.forEach((row: any, index: number) => {
    const normalized: any = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[normalizeHeader(key)] = (value as string)?.toString().trim();
    }

    if (!normalized.studentId) {
      errors.push(`Row ${index + 1}: Missing Student ID`);
      return;
    }
    if (!normalized.fullName) {
      errors.push(`Row ${index + 1}: Missing Full Name`);
      return;
    }
    if (!normalized.email) {
      errors.push(`Row ${index + 1}: Missing Email`);
      return;
    }
    if (!normalized.faculty) {
      errors.push(`Row ${index + 1}: Missing Faculty`);
      return;
    }
    if (!normalized.department) {
      errors.push(`Row ${index + 1}: Missing Department`);
      return;
    }

    records.push({
      studentId: normalized.studentId.toUpperCase(),
      fullName: normalized.fullName,
      email: normalized.email.toLowerCase(),
      faculty: normalized.faculty,
      department: normalized.department,
    });
  });

  return { records, errors, totalRows: rawData.length };
};

export const parseVoterFile = async (filePath: string): Promise<ParseResult> => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.csv') {
    return parseCSV(filePath);
  } else if (ext === '.xlsx' || ext === '.xls') {
    return parseXLSX(filePath);
  }
  throw new Error('Unsupported file format. Use CSV or XLSX.');
};
