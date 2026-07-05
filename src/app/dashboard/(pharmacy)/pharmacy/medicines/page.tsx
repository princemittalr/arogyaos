'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/features/shared';
import { Search, ShieldAlert } from 'lucide-react';

const medicineCatalog = [
  { id: 'med_para', name: 'Paracetamol 650mg', category: 'Analgesics', strength: '650mg', desc: 'Used for fever reduction and mild-to-moderate pain management.', warnings: 'Do not exceed 4g/day to avoid hepatic injury.' },
  { id: 'med_amox', name: 'Amoxicillin 500mg', category: 'Antibiotics', strength: '500mg', desc: 'Broad-spectrum penicillin antibiotic used for bacterial infections.', warnings: 'Complete full course to prevent bacterial resistance.' },
  { id: 'med_ator', name: 'Atorvastatin 10mg', category: 'Cardiovascular', strength: '10mg', desc: 'HMG-CoA reductase inhibitor used to lower cholesterol levels.', warnings: 'Monitor muscle tenderness or weakness.' },
  { id: 'med_metf', name: 'Metformin 500mg', category: 'Antidiabetics', strength: '500mg', desc: 'First-line medication for type 2 diabetes management.', warnings: 'Administer with meals to avoid gastrointestinal discomfort.' },
  { id: 'med_pant', name: 'Pantoprazole 40mg', category: 'Gastrointestinal', strength: '40mg', desc: 'Proton pump inhibitor (PPI) that decreases stomach acid.', warnings: 'Take 30 minutes before breakfast.' },
  { id: 'med_ibu', name: 'Ibuprofen 400mg', category: 'Analgesics', strength: '400mg', desc: 'Nonsteroidal anti-inflammatory drug (NSAID) for pain & swelling.', warnings: 'Take with food to prevent gastric lining erosion.' },
  { id: 'med_azi', name: 'Azithromycin 500mg', category: 'Antibiotics', strength: '500mg', desc: 'Macrolide antibiotic for respiratory and skin infections.', warnings: 'May prolong QT intervals in cardiac patients.' },
];

export default function MedicinesCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCatalog = medicineCatalog.filter((med) => {
    const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          med.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || med.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(medicineCatalog.map((m) => m.category)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicine Formulation Catalog"
        description="Search active compound descriptions, strength variants, and safety contraindications."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-transparent dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-transparent px-3.5 py-2 text-xs font-bold text-slate-650 dark:border-slate-800 dark:text-slate-350 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {filteredCatalog.map((med) => (
          <div key={med.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-50">{med.name}</h4>
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md inline-block mt-1">
                    Strength: {med.strength}
                  </span>
                </div>
                <span className="rounded-md bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 text-[9px] font-bold">
                  {med.category}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {med.desc}
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-850 pt-3 text-[10px] text-red-650 dark:text-red-400 font-bold flex items-start gap-1.5 bg-red-50/20 dark:bg-red-950/5 p-2 rounded-lg">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Contraindication: {med.warnings}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
