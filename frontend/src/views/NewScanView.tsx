import React, { useEffect, useState } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Trash2, 
  Building2, 
  Tag, 
  MapPin, 
  Hash, 
  Package, 
  Check, 
  FileUp, 
  ArrowRight,
  Info,
  Cpu,
  Ruler,
  Server
} from 'lucide-react';
import { sampleImages } from '../data/mockData';
import { checkHealth, HealthStatus, ScanFormData } from '../api/nirikshak';

interface NewScanViewProps {
  onStartAnalysis: (formData: ScanFormData) => void;
  /** Values to restore, e.g. after a failed scan. */
  initialData?: ScanFormData | null;
}

export const NewScanView: React.FC<NewScanViewProps> = ({ onStartAnalysis, initialData }) => {
  // Uploaded images state
  const [frontImage, setFrontImage] = useState<string>(initialData?.images.front ?? sampleImages.basmatiRiceFront);
  const [backImage, setBackImage] = useState<string>(initialData ? initialData.images.back ?? '' : sampleImages.basmatiRiceBack);
  const [sideImage, setSideImage] = useState<string | null>(initialData?.images.side ?? null);

  // Form Fields
  const [productName, setProductName] = useState(initialData?.productName ?? 'FreshHarvest Premium Basmati Rice (5kg)');
  const [category, setCategory] = useState(initialData?.category ?? 'Food Grain');
  const [manufacturer, setManufacturer] = useState(initialData?.manufacturer ?? 'FreshHarvest Foods Pvt. Ltd.');
  const [batchLot, setBatchLot] = useState(initialData?.batchLot ?? 'B-9942 / Aug 2026');
  const [location, setLocation] = useState(initialData?.location ?? 'Sub-Market Yard Zone 4, Azadpur, New Delhi');

  // OCR settings (same options as the Streamlit sidebar)
  const [useCalibration, setUseCalibration] = useState(!!initialData?.mmPerPx);
  const [mmPerPx, setMmPerPx] = useState<string>(initialData?.mmPerPx ? String(initialData.mmPerPx) : '0.01');
  const [useGpu, setUseGpu] = useState(!!initialData?.useGpu);

  const [activePreset, setActivePreset] = useState<'basmati' | 'oil' | 'spices' | null>(initialData ? null : 'basmati');

  // Poll the OCR server so the officer knows whether a scan can run.
  const [health, setHealth] = useState<HealthStatus | null>(null);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      const h = await checkHealth();
      if (cancelled) return;
      setHealth(h);
      if (!(h.online && h.model === 'ready')) timer = setTimeout(poll, 4000);
    };
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const handleSelectPreset = (preset: 'basmati' | 'oil' | 'spices') => {
    setActivePreset(preset);
    if (preset === 'basmati') {
      setFrontImage(sampleImages.basmatiRiceFront);
      setBackImage(sampleImages.basmatiRiceBack);
      setProductName('FreshHarvest Premium Basmati Rice (5kg)');
      setCategory('Food Grain');
      setManufacturer('FreshHarvest Foods Pvt. Ltd.');
      setBatchLot('B-9942 / Aug 2026');
    } else if (preset === 'oil') {
      setFrontImage(sampleImages.groundnutOil);
      setBackImage('');
      setProductName('Fortune VIVO Filtered Groundnut Oil (1L)');
      setCategory('Edible Oil');
      setManufacturer('Adani Wilmar Limited');
      setBatchLot('AW-2026-08');
    } else if (preset === 'spices') {
      setFrontImage(sampleImages.turmericPowder);
      setBackImage('');
      setProductName('Royal Spices Agmark Turmeric Powder (200g)');
      setCategory('Spices & Condiments');
      setManufacturer('Royal Spices India Ltd.');
      setBatchLot('RS-901');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 'front' | 'back' | 'side') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          if (slot === 'front') {
            setFrontImage(resultStr);
            setActivePreset(null);
          }
          if (slot === 'back') setBackImage(resultStr);
          if (slot === 'side') setSideImage(resultStr);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartAnalysis({
      productName,
      category,
      manufacturer,
      batchLot,
      location,
      images: {
        front: frontImage || sampleImages.basmatiRiceFront,
        back: backImage || undefined,
        side: sideImage || undefined,
      },
      mmPerPx: useCalibration && parseFloat(mmPerPx) > 0 ? parseFloat(mmPerPx) : null,
      useGpu,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-900 text-white rounded font-mono">NEW COMPLIANCE SCAN</span>
            <span className="text-xs text-slate-500 font-medium">Rule 6 & Rule 7 Inspection Workflow</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Upload Product Package Images for Analysis</h1>
          <p className="text-xs text-slate-600 mt-1">
            Upload clear photographs of the package principal display panel (PDP) and mandatory declaration labels.
          </p>
          <ServerStatusChip health={health} />
        </div>

        {/* Quick Sample Package Presets */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 block mb-1.5 font-mono uppercase">Quick Test Drive Presets:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectPreset('basmati')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${activePreset === 'basmati' ? 'bg-blue-900 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'}`}
            >
              Basmati Rice (5kg)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('oil')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${activePreset === 'oil' ? 'bg-blue-900 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'}`}
            >
              Groundnut Oil (1L)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('spices')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${activePreset === 'spices' ? 'bg-blue-900 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'}`}
            >
              Turmeric Powder
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Upload Zone */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Upload size={18} className="text-blue-900" />
              Package Image Upload Slot (Multiple Angles)
            </h2>
            <span className="text-xs text-slate-500 font-medium">Supports JPG, PNG, WEBP</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Front Panel Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Front Display Panel (Required) *
              </label>
              {frontImage ? (
                <div className="relative border-2 border-blue-900/30 rounded-xl overflow-hidden bg-slate-50 h-52 group">
                  <img src={frontImage} alt="Front Panel" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="px-3 py-1.5 bg-white text-slate-900 rounded font-bold text-xs cursor-pointer hover:bg-slate-100">
                      Change
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'front')} className="hidden" />
                    </label>
                  </div>
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-blue-900 text-white rounded">FRONT</span>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-700 rounded-xl h-52 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors p-4 text-center">
                  <FileUp size={32} className="text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Browse Front Image</span>
                  <span className="text-[10px] text-slate-400 mt-1">Drag and drop or click</span>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'front')} className="hidden" />
                </label>
              )}
            </div>

            {/* Back Panel Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Back / Information Label (Optional)
              </label>
              {backImage ? (
                <div className="relative border-2 border-slate-300 rounded-xl overflow-hidden bg-slate-50 h-52 group">
                  <img src={backImage} alt="Back Panel" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setBackImage('')} className="p-1.5 bg-rose-600 text-white rounded hover:bg-rose-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-white rounded">BACK</span>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-700 rounded-xl h-52 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors p-4 text-center">
                  <FileUp size={32} className="text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Browse Back Image</span>
                  <span className="text-[10px] text-slate-400 mt-1">Nutrition & Care label</span>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'back')} className="hidden" />
                </label>
              )}
            </div>

            {/* Side / Batch Label */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Side / MRP Stamp (Optional)
              </label>
              {sideImage ? (
                <div className="relative border-2 border-slate-300 rounded-xl overflow-hidden bg-slate-50 h-52 group">
                  <img src={sideImage} alt="Side Panel" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setSideImage(null)} className="p-1.5 bg-rose-600 text-white rounded hover:bg-rose-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-white rounded">SIDE</span>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-blue-700 rounded-xl h-52 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors p-4 text-center">
                  <FileUp size={32} className="text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Browse Side Image</span>
                  <span className="text-[10px] text-slate-400 mt-1">Batch or MRP stamp</span>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'side')} className="hidden" />
                </label>
              )}
            </div>

          </div>
        </div>

        {/* Optional Inspection Metadata Fields */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Tag size={18} className="text-blue-900" />
            Inspection & Product Metadata (Auto-Extractable)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Package size={14} className="text-slate-400" />
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. FreshHarvest Premium Basmati Rice"
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag size={14} className="text-slate-400" />
                Commodity Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:bg-white text-slate-900"
              >
                <option value="Food Grain">Food Grain & Cereals</option>
                <option value="Edible Oil">Edible Oil & Fats</option>
                <option value="Spices & Condiments">Spices & Condiments</option>
                <option value="Dairy Products">Dairy & Milk Products</option>
                <option value="Cosmetics & Personal Care">Cosmetics & Personal Care</option>
                <option value="Beverages">Beverages & Packaged Water</option>
                <option value="Sweets & Confectionery">Sweets & Confectionery</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 size={14} className="text-slate-400" />
                Manufacturer / Packer Name
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. FreshHarvest Foods Pvt. Ltd."
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash size={14} className="text-slate-400" />
                Batch / Lot Number
              </label>
              <input
                type="text"
                value={batchLot}
                onChange={(e) => setBatchLot(e.target.value)}
                placeholder="e.g. B-9942 / Aug 2026"
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:bg-white text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" />
                Inspection Location / Retail Premises
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sub-Market Yard Zone 4, Azadpur, New Delhi"
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:bg-white text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* OCR Settings */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Ruler size={18} className="text-blue-900" />
            OCR & Font-Height Calibration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCalibration}
                  onChange={(e) => setUseCalibration(e.target.checked)}
                  className="rounded border-slate-300 text-blue-900 focus:ring-blue-800"
                />
                I have a mm-per-pixel calibration for these photos
              </label>
              {useCalibration ? (
                <input
                  type="number"
                  min="0.000001"
                  step="0.000001"
                  value={mmPerPx}
                  onChange={(e) => setMmPerPx(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:bg-white text-slate-900"
                  aria-label="Millimetres per pixel"
                />
              ) : (
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Without calibration, font-height checks are marked <strong>Requires Review</strong> because text size in millimetres cannot be measured.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useGpu}
                  onChange={(e) => setUseGpu(e.target.checked)}
                  className="rounded border-slate-300 text-blue-900 focus:ring-blue-800"
                />
                <Cpu size={14} className="text-slate-400" />
                Use GPU for OCR
              </label>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Keep this off unless the server has a working CUDA/cuDNN setup.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            className="px-5 py-2.5 border border-slate-300 rounded-lg font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Save Draft Inspection
          </button>
          
          <button
            type="submit"
            disabled={health !== null && !health.online}
            title={health !== null && !health.online ? 'Start the OCR server first' : undefined}
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold text-xs shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-blue-900"
          >
            <Sparkles size={16} className="text-amber-400" />
            Analyze Product Package
            <ArrowRight size={16} />
          </button>
        </div>

      </form>

    </div>
  );
};

const ServerStatusChip: React.FC<{ health: HealthStatus | null }> = ({ health }) => {
  if (!health) {
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
        <Server size={13} /> Checking OCR server…
      </div>
    );
  }
  if (!health.online) {
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-rose-50 border border-rose-200 text-[11px] font-semibold text-rose-800">
        <Server size={13} /> OCR server offline. Run <code className="font-mono">uvicorn api:app --port 8000</code> in the backend folder.
      </div>
    );
  }
  if (health.model === 'error') {
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-rose-50 border border-rose-200 text-[11px] font-semibold text-rose-800" title={health.modelError ?? ''}>
        <Server size={13} /> OCR model failed to load: {health.modelError}
      </div>
    );
  }
  if (health.model === 'ready') {
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800">
        <Check size={13} /> OCR model ready
      </div>
    );
  }
  return (
    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800">
      <Server size={13} /> OCR server online. Model loads on first scan{health.model === 'loading' ? ' (loading now)' : ''}.
    </div>
  );
};
