import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { PaymentReceipt, StandardClass, PaymentMode } from '../types';
import { formatCurrency, buildWhatsAppReceiptMessage, cleanPhoneNumber } from '../utils/formatters';
import { 
  Receipt, 
  Search, 
  Printer, 
  MessageSquare, 
  Trash2, 
  Plus, 
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  Edit
} from 'lucide-react';
import { EditReceiptModal } from './EditReceiptModal';

interface ReceiptsViewProps {
  onViewReceipt: (receipt: PaymentReceipt) => void;
  onNewPayment: () => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
  onViewReceipt,
  onNewPayment,
}) => {
  const { receipts, students, schoolInfo, classList, getStudentTotalFee, getStudentTotalPaid, deleteReceipt } = useSchool();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [receiptToEdit, setReceiptToEdit] = useState<PaymentReceipt | null>(null);

  const filteredReceipts = receipts.filter(r => {
    const matchesSearch = 
      r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.parentPhone.includes(searchQuery) ||
      (r.transactionReference && r.transactionReference.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass = selectedClass === 'all' || r.standard === selectedClass;
    const matchesMode = selectedMode === 'all' || r.paymentMode === selectedMode;

    return matchesSearch && matchesClass && matchesMode;
  });

  const handleDelete = (receipt: PaymentReceipt) => {
    if (window.confirm(`Delete receipt ${receipt.receiptNumber} (${formatCurrency(receipt.amountPaid)}) for ${receipt.studentName}? This will adjust the student balance.`)) {
      deleteReceipt(receipt.id);
    }
  };

  const handleWhatsApp = (receipt: PaymentReceipt) => {
    const student = students.find(s => s.id === receipt.studentId);
    const totalFee = student ? getStudentTotalFee(student) : receipt.amountPaid;
    const totalPaid = student ? getStudentTotalPaid(student.id) : receipt.amountPaid;
    const encoded = buildWhatsAppReceiptMessage(receipt, schoolInfo, totalFee, totalPaid);
    const phone = cleanPhoneNumber(receipt.parentPhone);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const totalCollectedInFilter = filteredReceipts.reduce((sum, r) => sum + (r.amountPaid || 0), 0);

  return (
    <div className="space-y-5">
      
      {/* Header and summary */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8E2] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#2D312E] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#4F6D7A]" />
              Fee Paid Slips & Receipt Register ({filteredReceipts.length})
            </h2>
            <p className="text-xs text-[#6B7280]">
              Search, print official PDF slips, and send WhatsApp payment acknowledgements
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-[#6B7280] block">Total In View</span>
              <span className="font-mono font-black text-[#89A894] text-sm">
                {formatCurrency(totalCollectedInFilter)}
              </span>
            </div>
            <button
              onClick={onNewPayment}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#89A894] hover:bg-[#789683] text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Payment</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E2E8E2]/70">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search by receipt no, student, UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8E2] rounded-lg bg-[#FDFDFB] text-[#2D312E] focus:bg-white focus:ring-2 focus:ring-[#89A894] outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-[#E2E8E2] rounded-lg bg-[#FDFDFB] text-[#2D312E] font-medium outline-hidden"
            >
              <option value="all">All Standards ({classList.join(', ')})</option>
              {classList.map(c => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-[#E2E8E2] rounded-lg bg-[#FDFDFB] text-[#2D312E] font-medium outline-hidden"
            >
              <option value="all">All Payment Modes</option>
              {(['GPay / UPI', 'Cash', 'Bank Transfer', 'Cheque'] as PaymentMode[]).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-[#E2E8E2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F4F2] text-[#4F6D7A] font-bold border-b border-[#E2E8E2] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Receipt # & Date</th>
                <th className="py-3 px-4">Student & Class</th>
                <th className="py-3 px-4">Fee Breakdown</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E2]/60">
              {filteredReceipts.length > 0 ? (
                filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-[#F7F8F6]/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-[#4F6D7A] text-xs">
                        {receipt.receiptNumber}
                      </div>
                      <div className="text-[#6B7280] text-[11px] mt-0.5">
                        {receipt.date}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#2D312E] text-xs">{receipt.studentName}</div>
                      <div className="text-[#6B7280] text-[11px] flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono bg-[#F2F4F2] px-1 py-0.2 rounded border border-[#E2E8E2]">{receipt.admissionNo}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#4F6D7A]">{receipt.standard}-{receipt.section}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[11px] text-[#2D312E] space-x-1.5">
                        {receipt.breakdown.tuition > 0 && <span>Tuition: ₹{receipt.breakdown.tuition}</span>}
                        {receipt.breakdown.van > 0 && <span className="text-[#4F6D7A] font-medium">Van: ₹{receipt.breakdown.van}</span>}
                        {receipt.breakdown.sports > 0 && <span className="text-[#4F6D7A] font-medium">Sports: ₹{receipt.breakdown.sports}</span>}
                        {receipt.breakdown.lateFee > 0 && <span className="text-[#D68A6E] font-medium">Late: ₹{receipt.breakdown.lateFee}</span>}
                      </div>
                      {receipt.notes && (
                        <div className="text-[10px] text-[#6B7280] italic mt-0.5">{receipt.notes}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                        receipt.paymentMode === 'GPay / UPI' 
                          ? 'bg-[#89A894]/15 text-[#4F6D7A] border border-[#89A894]/30' 
                          : 'bg-[#F2F4F2] text-[#2D312E] border border-[#E2E8E2]'
                      }`}>
                        {receipt.paymentMode === 'GPay / UPI' && <QrCode className="w-3 h-3 text-[#89A894]" />}
                        {receipt.paymentMode === 'Cash' && <Banknote className="w-3 h-3 text-[#6B7280]" />}
                        {receipt.paymentMode}
                      </span>
                      {receipt.transactionReference && (
                        <div className="text-[10px] font-mono text-[#6B7280] mt-0.5">
                          {receipt.transactionReference}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-extrabold text-[#89A894] text-sm">
                        {formatCurrency(receipt.amountPaid)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewReceipt(receipt)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-[#F2F4F2] hover:bg-[#E2E8E2] text-[#2D312E] font-bold rounded text-[11px] border border-[#E2E8E2] transition-colors"
                          title="View & Print Official PDF Slip"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#6B7280]" />
                          <span>Print Slip</span>
                        </button>

                        <button
                          onClick={() => handleWhatsApp(receipt)}
                          className="p-1.5 bg-[#89A894]/15 hover:bg-[#89A894]/25 text-[#4F6D7A] rounded border border-[#89A894]/30 transition-colors"
                          title="Send Receipt on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setReceiptToEdit(receipt)}
                          className="p-1.5 text-[#6B7280] hover:text-[#4F6D7A] hover:bg-[#F2F4F2] rounded transition-colors"
                          title="Edit Receipt Information & Amounts"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(receipt)}
                          className="p-1.5 text-[#6B7280] hover:text-[#D68A6E] hover:bg-[#D68A6E]/10 rounded transition-colors"
                          title="Delete Receipt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#6B7280]">
                    No fee receipts match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Receipt Modal */}
      {receiptToEdit && (
        <EditReceiptModal
          receipt={receiptToEdit}
          onClose={() => setReceiptToEdit(null)}
          onViewSlip={onViewReceipt}
        />
      )}

    </div>
  );
};
