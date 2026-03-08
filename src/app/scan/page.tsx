"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, Camera, ScanLine, FileText, Edit3, CheckCircle, Loader2, X } from "lucide-react";
import { useNotification } from "@/lib/NotificationContext";
import AddTransactionModal from "@/components/AddTransactionModal";

interface ParsedItem {
  name: string;
  price: number;
}

function parseReceiptText(text: string): { items: ParsedItem[]; total: number; rawText: string } {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const items: ParsedItem[] = [];
  let total = 0;

  const priceRegex = /(\d[\d.,]+)/g;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    // Skip header-like lines
    if (lowerLine.includes("struk") || lowerLine.includes("kasir") || lowerLine.includes("telp") || lowerLine.includes("nota")) continue;

    const prices = [...line.matchAll(priceRegex)].map((m) => parseFloat(m[1].replace(/\./g, "").replace(",", ".")));
    if (prices.length > 0) {
      const price = prices[prices.length - 1];
      const name = line.replace(/[\d.,]+/g, "").trim().replace(/\s+/g, " ");
      if (price > 0 && name.length > 1) {
        if (lowerLine.includes("total") || lowerLine.includes("jumlah") || lowerLine.includes("grand")) {
          total = price;
        } else {
          items.push({ name: name || "Item", price });
        }
      }
    }
  }

  if (total === 0 && items.length > 0) {
    total = items.reduce((s, i) => s + i.price, 0);
  }

  return { items, total, rawText: text };
}

export default function ScanPage() {
  const { addNotification } = useNotification();
  const [mode, setMode] = useState<"idle" | "scanning" | "result" | "manual">("idle");
  const [rawText, setRawText] = useState("");
  const [editableText, setEditableText] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [parsedTotal, setParsedTotal] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setMode("scanning");
    setScanProgress(0);

    try {
      // Dynamic import to avoid SSR issues
      const Tesseract = (await import("tesseract.js")).default;
      const result = await Tesseract.recognize(file, "ind+eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setScanProgress(Math.round(m.progress * 100));
          }
        },
      });
      const text = result.data.text;
      setRawText(text);
      setEditableText(text);
      const parsed = parseReceiptText(text);
      setParsedItems(parsed.items);
      setParsedTotal(parsed.total);
      setMode("result");
      addNotification("Scan berhasil! Periksa hasilnya. ✅", "success");
    } catch {
      addNotification("Gagal scan gambar. Coba lagi atau masukkan manual.", "error");
      setMode("manual");
    }
  }, [addNotification]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const handleTextParse = () => {
    const parsed = parseReceiptText(editableText);
    setParsedItems(parsed.items);
    setParsedTotal(parsed.total);
    setMode("result");
  };

  const totalAmount = parsedItems.reduce((s, i) => s + i.price, 0) || parsedTotal;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">Scan Struk</h1>
        <p className="text-sm text-gray-500 mt-0.5">Scan atau ketik nota belanja Anda</p>
      </div>

      {mode === "idle" && (
        <>
          {/* Scan Options */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex flex-col items-center gap-3 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-2xl p-6 hover:bg-emerald-100 transition-colors"
            >
              <Camera className="w-10 h-10 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-700">Ambil Foto</span>
              <span className="text-xs text-emerald-500 text-center">Foto struk dengan kamera</span>
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl p-6 hover:bg-blue-100 transition-colors"
            >
              <Upload className="w-10 h-10 text-blue-500" />
              <span className="text-sm font-semibold text-blue-700">Upload Gambar</span>
              <span className="text-xs text-blue-500 text-center">Pilih dari galeri</span>
            </button>
          </div>

          <div className="relative flex items-center">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="px-3 text-xs text-gray-400 font-medium">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={() => setMode("manual")}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl p-4 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Edit3 className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Ketik Manual</span>
          </button>

          {/* Hidden inputs */}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        </>
      )}

      {mode === "scanning" && (
        <div className="flex flex-col items-center gap-4 py-12">
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="preview" className="w-48 h-48 object-cover rounded-2xl border-4 border-emerald-200" />
          )}
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <div className="text-center">
            <p className="font-semibold text-gray-800">Sedang memindai...</p>
            <p className="text-sm text-gray-500 mt-1">{scanProgress}% selesai</p>
          </div>
          <div className="w-48 bg-gray-200 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${scanProgress}%` }} />
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setMode("idle")} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="font-semibold text-gray-800">Ketik Teks Nota</h2>
          </div>
          <textarea
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            placeholder={"Ketik atau tempel teks struk di sini...\n\nContoh:\nNasi Goreng  15000\nEs Teh  5000\nTotal  20000"}
            rows={10}
            className="w-full p-4 border border-gray-200 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
          />
          <button
            onClick={handleTextParse}
            disabled={!editableText.trim()}
            className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ScanLine className="w-5 h-5" /> Proses Teks
          </button>
        </div>
      )}

      {mode === "result" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" /> Hasil Scan
            </h2>
            <button onClick={() => { setMode("idle"); setPreviewUrl(null); setParsedItems([]); }} className="text-xs text-gray-400 hover:text-gray-600">
              Scan Ulang
            </button>
          </div>

          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="struk" className="w-full max-h-40 object-cover rounded-2xl border border-gray-200" />
          )}

          {/* Editable text */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-600">Teks terdeteksi (bisa diedit)</span>
            </div>
            <textarea
              value={editableText}
              onChange={(e) => {
                setEditableText(e.target.value);
                const p = parseReceiptText(e.target.value);
                setParsedItems(p.items);
                setParsedTotal(p.total);
              }}
              rows={6}
              className="w-full p-3 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none bg-gray-50"
            />
          </div>

          {/* Parsed Items */}
          {parsedItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-600">Item Terdeteksi</p>
              </div>
              <div className="divide-y divide-gray-100">
                {parsedItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-gray-700 flex-1 pr-3 truncate">{item.name}</span>
                    <span className="text-sm font-medium text-gray-900 shrink-0">
                      Rp {item.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-emerald-50 border-t border-emerald-100 flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-800">Total</span>
                <span className="text-sm font-bold text-emerald-800">Rp {totalAmount.toLocaleString("id-ID")}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 flex items-center justify-center gap-2 shadow"
          >
            <CheckCircle className="w-5 h-5" /> Simpan sebagai Pengeluaran
          </button>
        </div>
      )}

      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType="expense"
        prefillDescription={parsedItems.length > 0 ? parsedItems.map(i => i.name).join(", ").slice(0, 100) : "Nota belanja"}
        prefillAmount={totalAmount || undefined}
      />
    </div>
  );
}
