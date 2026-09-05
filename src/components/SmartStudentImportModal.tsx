import React, { useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student } from '../types';
import { useSchool } from '../context/SchoolContext';

interface SmartStudentImportModalProps {
  onClose: () => void;
}

type ParsedRow = {
  rowNumber: number;
  student: Omit<Student, 'id'>;
  errors: string[];
};

const normalizeHeader = (value: unknown) => String(value ?? '')
  .trim()
  .toLowerCase()
  .replace(/[\s\-./]+/g, '_');

const text = (row: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return '';
};

const number = (row: Record<string, unknown>, ...keys: string[]) => {
  const value = text(row, ...keys).replace(/[^0-9.-]/g, '');
  return value ? Number(value) || 0 : 0;
};

const boolean = (row: Record<string, unknown>, ...keys: string[]) =>
  ['true', 'yes', 'y', '1', 'on'].includes(text(row, ...keys).toLowerCase());

const createStudent = (row: Record<string, unknown>, rowNumber: number, defaultTuition: number): ParsedRow => {
  const name = text(row, 'name', 'student_name', 'student');
  const parentPhone = text(row, 'parent_phone', 'phone', 'mobile', 'mobile_no', 'contact');
  const admissionNo = text(row, 'admission_no', 'admission_number', 'admission', 'adm_no') || `IMPORT-${rowNumber}`;
  const standard = text(row, 'standard', 'class', 'grade') || 'LKG';
  const vanFacility = boolean(row, 'van_facility', 'van', 'transport');
  const sportsFacility = boolean(row, 'sports_facility', 'sports');
  const isRte = boolean(row, 'is_rte', 'rte');
  const student: Omit<Student, 'id'> = {
    admissionNo,
    rollNo: text(row, 'roll_no', 'roll_number', 'roll') || String(rowNumber),
    name,
    standard,
    section: text(row, 'section') || 'A',
    gender: text(row, 'gender').toLowerCase() === 'girl' ? 'Girl' : 'Boy',
    parentName: text(row, 'parent_name', 'father_name', 'guardian_name', 'parent'),
    parentPhone,
    whatsappNumber: text(row, 'whatsapp_number', 'whatsapp', 'whatsapp_phone') || parentPhone,
    address: text(row, 'address') || 'Essur - 603301',
    isRte,
    rteApplicationNo: text(row, 'rte_application_no', 'rte_no') || undefined,
    rteGovtReimbursed: boolean(row, 'rte_govt_reimbursed', 'reimbursed'),
    vanFacility,
    vanRoute: text(row, 'van_route', 'route') || '',
    vanFee: vanFacility ? number(row, 'van_fee', 'transport_fee') : 0,
    sportsFacility,
    sportsFee: sportsFacility ? number(row, 'sports_fee') : 0,
    tuitionFee: number(row, 'tuition_fee', 'tuition', 'fee') || (isRte ? 0 : defaultTuition),
    otherFee: number(row, 'other_fee', 'other'),
    discount: number(row, 'discount'),
    lateFee: number(row, 'late_fee'),
    admissionDate: text(row, 'admission_date', 'date') || new Date().toISOString().split('T')[0],
    bloodGroup: text(row, 'blood_group', 'blood'),
    notes: text(row, 'notes', 'remarks'),
  };
  const errors: string[] = [];
  if (!name) errors.push('Student name is missing');
  if (!parentPhone) errors.push('Parent phone is missing');
  return { rowNumber, student, errors };
};

export const SmartStudentImportModal: React.FC<SmartStudentImportModalProps> = ({ onClose }) => {
  const { addStudent, feeStructure } = useSchool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [error, setError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [complete, setComplete] = useState(false);

  const validRows = useMemo(() => rows.filter(row => row.errors.length === 0), [rows]);

  const handleFile = async (file: File) => {
    setError('');
    setComplete(false);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!firstSheet) throw new Error('The file does not contain a worksheet.');
      const sourceRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
      if (!sourceRows.length) throw new Error('No data rows were found.');
      const normalizedRows = sourceRows.map(source => Object.fromEntries(
        Object.entries(source).map(([key, value]) => [normalizeHeader(key), value])
      ));
      setRows(normalizedRows.map((row, index) => createStudent(row, index + 2, feeStructure.LKG || 16500)));
      setFileName(file.name);
    } catch (fileError) {
      setRows([]);
      setFileName('');
      setError(fileError instanceof Error ? fileError.message : 'Unable to read this file.');
    }
  };

  const importStudents = () => {
    setIsImporting(true);
    validRows.forEach(row => addStudent(row.student));
    setIsImporting(false);
    setComplete(true);
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([{
      admission_no: 'WIS-2026-001',
      roll_no: '01',
      name: 'Sample Student',
      standard: 'LKG',
      section: 'A',
      gender: 'Boy',
      parent_name: 'Parent Name',
      parent_phone: '9876543210',
      whatsapp_number: '9876543210',
      address: 'Essur - 603301',
      tuition_fee: 16500,
      van_facility: 'No',
      van_fee: 0,
      sports_facility: 'Yes',
      sports_fee: 1200,
      discount: 0,
      is_rte: 'No',
    }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, 'wisdom-student-import-template.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D312E]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#E2E8E2]">
        <div className="bg-[#4F6D7A] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-[#D8E8DA]" />
            <div>
              <h3 className="font-bold">Smart Student Import</h3>
              <p className="text-xs text-white/80">Upload any CSV or Excel file and preview before importing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded" aria-label="Close import dialog"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex flex-wrap items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={event => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }} />
            <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#89A894] text-white text-xs font-bold hover:bg-[#789683]">
              <Upload className="w-4 h-4" /> Choose CSV / Excel
            </button>
            <button onClick={downloadTemplate} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E2E8E2] text-[#4F6D7A] text-xs font-bold hover:bg-[#F2F4F2]">
              <Download className="w-4 h-4" /> Download Template
            </button>
            {fileName && <span className="text-xs text-[#6B7280]">{fileName}</span>}
          </div>

          {error && <div className="flex items-center gap-2 text-xs text-[#B45309] bg-[#FFF7ED] border border-[#FED7AA] rounded-lg p-3"><AlertCircle className="w-4 h-4" />{error}</div>}
          {!rows.length && !error && <p className="text-xs text-[#6B7280]">Required columns: <strong>name</strong> and <strong>parent_phone</strong>. Other columns are optional.</p>}

          {rows.length > 0 && (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2D312E]">{rows.length} rows found • {validRows.length} ready to import</span>
                {rows.length - validRows.length > 0 && <span className="text-[#B45309]">{rows.length - validRows.length} rows need attention</span>}
              </div>
              <div className="overflow-auto border border-[#E2E8E2] rounded-lg max-h-80">
                <table className="w-full text-xs text-left">
                  <thead className="sticky top-0 bg-[#F2F4F2] text-[#4F6D7A]">
                    <tr><th className="p-2">Row</th><th className="p-2">Student</th><th className="p-2">Admission No.</th><th className="p-2">Class</th><th className="p-2">Parent Phone</th><th className="p-2">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8E2]">
                    {rows.map(row => <tr key={row.rowNumber}>
                      <td className="p-2">{row.rowNumber}</td><td className="p-2 font-medium">{row.student.name || '—'}</td><td className="p-2">{row.student.admissionNo}</td><td className="p-2">{row.student.standard}-{row.student.section}</td><td className="p-2">{row.student.parentPhone || '—'}</td>
                      <td className={`p-2 ${row.errors.length ? 'text-[#B45309]' : 'text-[#4F6D7A]'}`}>{row.errors.length ? row.errors.join(', ') : <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Ready</span>}</td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-[#E2E8E2] p-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#6B7280] hover:bg-[#F2F4F2] rounded-lg">Cancel</button>
          {complete ? <div className="px-4 py-2 text-xs font-bold text-[#4F6D7A]">Import complete.</div> : <button disabled={!validRows.length || isImporting} onClick={importStudents} className="px-4 py-2 text-xs font-bold text-white bg-[#4F6D7A] rounded-lg disabled:opacity-50">{isImporting ? 'Importing...' : `Import ${validRows.length} Students`}</button>}
        </div>
      </div>
    </div>
  );
};
