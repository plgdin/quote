import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Download, Plus, Trash2, FileText, Hash, User, MapPin, Calendar, CheckCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- CONFIG ---
const supabase = createClient('https://ztlmzbdrqasxwhgsrqkz.supabase.co', 'sb_publishable_jXirwBOyoyfESoLsECzNxA_st8al81a');

const COMPANY_DETAILS = {
  name: "Plgdin Innovations LLP",
  address: "Trivandrum, Kerala, India",
  city: "Thiruvananthapuram",
};

// --- TYPES ---
interface Item {
  id: string;
  description: string;
  qty: number;
  rate: number;
}

const QuotationMaker: React.FC = () => {
  const [docType, setDocType] = useState<'QUOTATION' | 'INVOICE' | 'RECEIPT'>('QUOTATION');
  const [docNumber, setDocNumber] = useState<string>(`QT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [docDate, setDocDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState<string>('Scrap Baba');
  const [clientAddress, setClientAddress] = useState<string>('Trivandrum, Kerala, India');
  const [items, setItems] = useState<Item[]>([{ id: '1', description: 'Web Development', qty: 1, rate: 5000 }]);
  
  const pdfExportComponent = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- LOGIC ---
  const addItem = (): void => {
    setItems([...items, { id: Date.now().toString(), description: '', qty: 1, rate: 0 }]);
  };

  const removeItem = (id: string): void => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof Item, value: string | number): void => {
    setItems((prevItems) => 
      prevItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const calculateSubtotal = (): number => 
    items.reduce((acc, item) => acc + (item.qty * item.rate), 0);

  const downloadPDF = async (): Promise<void> => {
    const element = pdfExportComponent.current;
    const container = containerRef.current;
    if (!element || !container) return;

    // Temporarily reset transform for clean capture
    const originalStyle = container.style.transform;
    container.style.transform = 'none';

    try {
        const canvas = await html2canvas(element, {
            scale: 2, 
            useCORS: true, // Crucial for images
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
            width: element.offsetWidth,
            height: element.offsetHeight
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${docType}_${docNumber}.pdf`);

        await supabase.from('documents').insert([{
            doc_type: docType,
            doc_number: docNumber,
            client_name: clientName,
            client_address: clientAddress,
            items: items,
            total: calculateSubtotal()
        }]);
    } catch (err) {
        console.error("PDF Generation failed", err);
    } finally {
        container.style.transform = originalStyle;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT: EDITOR PANEL --- */}
        <div className="lg:col-span-5 bg-[#1E293B] p-6 rounded-2xl shadow-2xl border border-slate-700 h-fit">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#C5A059] p-2 rounded-lg text-black">
                <FileText size={24} />
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase italic">Quote<span className="text-[#C5A059]">Master</span></h2>
          </div>
          
          <div className="flex bg-[#0F172A] p-1.5 rounded-xl mb-8 border border-slate-700">
            {(['QUOTATION', 'INVOICE', 'RECEIPT'] as const).map((type) => (
              <button 
                key={type}
                onClick={() => setDocType(type)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${docType === type ? 'bg-[#C5A059] text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Client Name</label>
                    <input className="w-full bg-[#0F172A] border border-slate-700 p-2.5 rounded-xl outline-none focus:border-[#C5A059] text-white" 
                    value={clientName} onChange={(e) => setClientName(e.target.value)} />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Document No.</label>
                    <input className="w-full bg-[#0F172A] border border-slate-700 p-2.5 rounded-xl outline-none focus:border-[#C5A059] text-white" 
                    value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Client Address</label>
                <textarea className="w-full bg-[#0F172A] border border-slate-700 p-2.5 rounded-xl outline-none focus:border-[#C5A059] h-20 text-sm text-white" 
                value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
            </div>
            
            <div className="pt-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-4 block ml-1">Line Items</label>
                <div className="space-y-3">
                    {items.map((item) => (
                    <div key={item.id} className="flex gap-2 items-center bg-[#0F172A] p-3 rounded-xl border border-slate-700">
                        <input className="flex-1 bg-transparent text-sm outline-none text-white min-w-0" 
                          placeholder="Item description" value={item.description} 
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                        <input type="number" className="w-16 bg-slate-800 border-none rounded p-1 text-center text-xs text-white" 
                          value={item.qty} onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)} />
                        <input type="number" className="w-24 bg-slate-800 border-none rounded p-1 text-right text-xs text-white" 
                          value={item.rate} onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                        <button onClick={() => removeItem(item.id)} className="text-slate-500 hover:text-red-400 p-1 shrink-0">
                          <Trash2 size={18} />
                        </button>
                    </div>
                    ))}
                    {items.length === 0 && (
                      <p className="text-center text-slate-500 text-xs py-4 border border-dashed border-slate-700 rounded-xl italic">No items added. Click below to add.</p>
                    )}
                </div>
                <button onClick={addItem} className="mt-4 flex items-center gap-2 text-xs font-black text-[#C5A059] hover:text-white uppercase tracking-widest">
                    <Plus size={14} /> Add Line Item
                </button>
            </div>
          </div>

          <button onClick={downloadPDF} className="w-full mt-10 bg-[#C5A059] text-black py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Download size={20} /> GENERATE PDF
          </button>
        </div>

        {/* --- RIGHT: LIVE PREVIEW (PDF TEMPLATE) --- */}
        <div className="lg:col-span-7 flex justify-center bg-slate-900/50 rounded-3xl p-4 md:p-8 border border-slate-800 overflow-hidden">
            <div ref={containerRef} className="scale-[0.45] md:scale-[0.65] xl:scale-[0.8] origin-top transition-all">
                <div 
                    ref={pdfExportComponent} 
                    className="bg-white text-black" 
                    style={{ width: '210mm', height: '297mm', position: 'relative' }}
                >
                    <div className="bg-black h-4 w-full" />
                    
                    <div className="p-14 h-full flex flex-col">
                        <div className="flex justify-between items-start mb-16">
                            <div className="relative">
                                {/* FIXED LOGO SECTION */}
                                <div className="mb-6 h-24 w-24 rounded-2xl bg-black border border-gray-100 overflow-hidden">
                                  <img 
                                    src="/logo.jpg" 
                                    alt="Logo" 
                                    crossOrigin="anonymous"
                                    className="w-full h-full object-cover scale-[1.5]" 
                                  />
                                </div>
                                <h3 className="font-black text-xl text-gray-900 tracking-tighter uppercase leading-none">{COMPANY_DETAILS.name}</h3>
                                <p className="text-sm text-gray-500 font-medium mt-1">{COMPANY_DETAILS.address}</p>
                            </div>

                            <div className="text-right">
                                <h1 className="text-7xl font-black text-gray-100 mb-4 uppercase tracking-tighter italic leading-none">{docType}</h1>
                                <div className="space-y-1 inline-block">
                                    <div className="flex justify-between gap-8 border-b pb-1 text-[11px]">
                                        <span className="text-gray-400 uppercase font-bold">Ref No.</span>
                                        <span className="font-black">{docNumber}</span>
                                    </div>
                                    <div className="flex justify-between gap-8 border-b pb-1 text-[11px]">
                                        <span className="text-gray-400 uppercase font-bold">Date</span>
                                        <span className="font-black">{docDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-14">
                            <h4 className="text-[#C5A059] font-black uppercase text-[10px] mb-2 tracking-[0.2em]">Billed To:</h4>
                            <p className="font-black text-2xl text-gray-900 leading-none mb-2">{clientName || "Client Name"}</p>
                            <p className="text-gray-500 font-medium text-sm whitespace-pre-line leading-snug max-w-xs">{clientAddress || "Address"}</p>
                        </div>

                        <div className="flex-grow">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-black text-[#C5A059] uppercase text-[10px] font-black tracking-widest">
                                        <th className="p-4 text-left rounded-tl-xl">Description</th>
                                        <th className="p-4 text-center w-24">Qty</th>
                                        <th className="p-4 text-right w-32">Rate</th>
                                        <th className="p-4 text-right rounded-tr-xl w-32">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length > 0 ? items.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100">
                                            <td className="p-5 font-bold text-gray-800">{item.description || 'Service description...'}</td>
                                            <td className="p-5 text-center font-medium text-gray-500">{item.qty}</td>
                                            <td className="p-5 text-right font-medium text-gray-500">₹{item.rate.toLocaleString()}</td>
                                            <td className="p-5 text-right font-black text-gray-900">₹{(item.qty * item.rate).toLocaleString()}</td>
                                        </tr>
                                    )) : (
                                      <tr>
                                        <td colSpan={4} className="p-10 text-center text-gray-300 italic">No line items specified</td>
                                      </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* BOTTOM SECTION WITH STAMP */}
                        <div className="mt-auto flex justify-between items-end pb-10 relative">
                            <div className="text-[11px] text-gray-400 max-w-[300px]">
                                <p className="font-black text-gray-800 mb-1 uppercase tracking-widest">Terms and Conditions</p>
                                <p className="italic leading-relaxed">Please make payments within 15 days. Terms and Conditions apply, For more information or Inquiries visit plgdinn.com</p>
                            </div>
                            
                            <div className="w-80 flex flex-col items-end gap-4">
                                {docType === 'RECEIPT' && (
                                  <div className="border-4 border-green-600 text-green-600 px-6 py-2 rounded-xl rotate-[-12deg] flex items-center gap-2 opacity-80 self-center mb-4">
                                    <CheckCircle size={24} />
                                    <span className="font-black text-2xl tracking-tighter">PAID IN FULL</span>
                                  </div>
                                )}

                                <div className="w-full flex justify-between p-4 bg-black text-[#C5A059] rounded-2xl border-b-4 border-[#C5A059]">
                                    <span className="font-black text-xs uppercase self-center">Grand Total</span>
                                    <span className="font-black text-3xl">₹{calculateSubtotal().toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-8 border-t border-gray-100 flex justify-between items-center opacity-30">
                             <span className="text-[10px] font-bold uppercase tracking-[0.3em]">www.plgdinn.com</span>
                             <span className="text-[10px] font-medium italic">Digitally Signed Document</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationMaker;