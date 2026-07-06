'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, Search, Loader2, FileText, MoreVertical, Copy, ExternalLink, 
  Trash2, Edit, Check, Globe, CheckCircle, Archive, CopyPlus, 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, 
  TrendingUp, Eye, EyeOff, Building2, User 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export default function MicrositesPage() {
  const { data: session } = useSession() || {};
  const router = useRouter();
  
  const [microsites, setMicrosites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filters
  const [selectedBuilder, setSelectedBuilder] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCreator, setSelectedCreator] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  
  // Sorting
  const [sortKey, setSortKey] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchMicrosites = () => {
    fetch('/api/microsites')
      .then((r) => r.json())
      .then((d) => setMicrosites(d?.microsites ?? []))
      .catch(() => toast.error('Failed to load microsites'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMicrosites();
  }, []);

  // Compute dynamic lists for filters based on full list
  const builders = Array.from(new Set(microsites.map((m) => m.builderName).filter(Boolean))).sort();
  const cities = Array.from(new Set(microsites.map((m) => m.city).filter(Boolean))).sort();
  const locations = Array.from(new Set(microsites.map((m) => m.location).filter(Boolean))).sort();
  const creators = Array.from(new Set(microsites.map((m) => m.createdBy?.name).filter(Boolean))).sort();

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedBuilder) count++;
    if (selectedCity) count++;
    if (selectedArea) count++;
    if (selectedStatus) count++;
    if (selectedCreator) count++;
    return count;
  };

  const resetFilters = () => {
    setSelectedBuilder('');
    setSelectedCity('');
    setSelectedArea('');
    setSelectedStatus('');
    setSelectedCreator('');
    setSearch('');
    setCurrentPage(1);
  };

  // Row and bulk handlers
  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    const pageIds = paginatedItems.map((item) => item.id);
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleCopyUrl = (slug: string) => {
    const fullUrl = `https://11estates.in/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Public URL copied to clipboard');
  };

  const handlePreview = (slug: string) => {
    window.open(`/${slug}?preview=true`, '_blank');
  };

  const handleDuplicate = async (id: string) => {
    const duplicatingToast = toast.loading('Duplicating microsite...');
    try {
      const res = await fetch(`/api/microsites/${id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success('Microsite duplicated successfully!', { id: duplicatingToast });
        fetchMicrosites();
      } else {
        toast.error(data?.error ?? 'Failed to duplicate microsite', { id: duplicatingToast });
      }
    } catch (e) {
      toast.error('Failed to duplicate microsite', { id: duplicatingToast });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/microsites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
        fetchMicrosites();
      } else {
        const data = await res.json();
        toast.error(data?.error ?? 'Failed to update status');
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this microsite?')) return;
    try {
      const res = await fetch(`/api/microsites/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Microsite deleted');
        fetchMicrosites();
      } else {
        toast.error('Failed to delete');
      }
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  // Bulk Actions
  const executeBulkAction = async (action: 'publish' | 'archive' | 'delete') => {
    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedIds.length} microsites?`)) return;
    if (action === 'archive' && !confirm(`Are you sure you want to archive ${selectedIds.length} microsites?`)) return;

    const actionToast = toast.loading(`Executing bulk ${action}...`);
    try {
      const res = await fetch('/api/microsites/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data?.message ?? 'Bulk action completed', { id: actionToast });
        setSelectedIds([]);
        fetchMicrosites();
      } else {
        toast.error(data?.error ?? 'Failed to execute bulk action', { id: actionToast });
      }
    } catch (e) {
      toast.error('Something went wrong', { id: actionToast });
    }
  };

  const handleBulkCopyUrls = () => {
    const urls = microsites
      .filter((m) => selectedIds.includes(m.id))
      .map((m) => `https://11estates.in/${m.slug}`)
      .join('\n');
    navigator.clipboard.writeText(urls);
    toast.success(`${selectedIds.length} URLs copied to clipboard`);
  };

  // Sorting
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filter application
  const filtered = (microsites ?? []).filter((m: any) => {
    const matchesSearch = !search || 
      (m?.projectName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (m?.builderName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (m?.city ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (m?.location ?? '').toLowerCase().includes(search.toLowerCase());

    const matchesBuilder = !selectedBuilder || m.builderName === selectedBuilder;
    const matchesCity = !selectedCity || m.city === selectedCity;
    const matchesArea = !selectedArea || m.location === selectedArea;
    const matchesStatus = !selectedStatus || m.status === selectedStatus;
    const matchesCreator = !selectedCreator || m.createdBy?.name === selectedCreator;

    return matchesSearch && matchesBuilder && matchesCity && matchesArea && matchesStatus && matchesCreator;
  });

  // Sort application
  const sortedItems = [...filtered].sort((a: any, b: any) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    
    if (sortKey === 'leads') {
      aVal = a._count?.leads ?? 0;
      bVal = b._count?.leads ?? 0;
    } else if (sortKey === 'updatedAt') {
      aVal = new Date(a.updatedAt).getTime();
      bVal = new Date(b.updatedAt).getTime();
    }
    
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination application
  const totalPages = Math.ceil(sortedItems.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + rowsPerPage);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium text-xs';
      case 'DRAFT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20 px-2.5 py-0.5 rounded-full font-medium text-xs';
      case 'ARCHIVED':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 px-2.5 py-0.5 rounded-full font-medium text-xs';
      default:
        return 'bg-white/5 text-white/60 border-white/10 px-2.5 py-0.5 rounded-full font-medium text-xs';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Published';
      case 'DRAFT':
        return 'Draft';
      case 'ARCHIVED':
        return 'Archived';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(dateString));
    } catch (e) {
      return '—';
    }
  };

  return (
    <div className="pb-24">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Microsites</h1>
          <p className="text-white/50 mt-1">Redesigned dense table for managing hundreds of projects.</p>
        </div>
        <Link href="/dashboard/microsites/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c8a45e] text-black rounded-lg text-sm font-semibold hover:bg-[#d4b06a] transition shadow-sm self-start md:self-auto">
          <PlusCircle className="w-4 h-4" /> New Microsite
        </Link>
      </div>

      {/* Summary Statistics */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#141414] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Total Microsites</p>
              <p className="text-2xl font-bold text-white mt-1 font-mono">{microsites.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-white/5 text-[#c8a45e]">
              <Globe className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Published</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                {microsites.filter((m) => m.status === 'PUBLISHED').length}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Draft</p>
              <p className="text-2xl font-bold text-amber-400 mt-1 font-mono">
                {microsites.filter((m) => m.status === 'DRAFT').length}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Archived</p>
              <p className="text-2xl font-bold text-zinc-400 mt-1 font-mono">
                {microsites.filter((m) => m.status === 'ARCHIVED').length}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-zinc-500/10 text-zinc-400">
              <Archive className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-sm col-span-2 md:col-span-1">
            <div>
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Total Leads</p>
              <p className="text-2xl font-bold text-[#c8a45e] mt-1 font-mono">
                {microsites.reduce((sum, m) => sum + (m?._count?.leads ?? 0), 0)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#c8a45e]/10 text-[#c8a45e]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Global Search and Filter Toggles */}
      <div className="bg-[#141414] border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search project name, builder, city, or area..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-[#c8a45e]/50 focus:border-[#c8a45e]/50 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/5 transition w-full md:w-auto justify-center select-none"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="ml-1 bg-[#c8a45e] text-black text-xs font-semibold px-2 py-0.5 rounded-full font-mono">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
            {getActiveFiltersCount() > 0 && (
              <button 
                onClick={resetFilters}
                className="text-xs text-[#c8a45e] hover:text-[#d4b06a] hover:underline px-2 py-1 select-none"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filters Grid */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3"
            >
              {/* Builder Filter */}
              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1 uppercase tracking-wider">Builder</label>
                <select
                  value={selectedBuilder}
                  onChange={(e) => { setSelectedBuilder(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#c8a45e]/50 cursor-pointer"
                >
                  <option value="">All Builders</option>
                  {builders.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1 uppercase tracking-wider">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#c8a45e]/50 cursor-pointer"
                >
                  <option value="">All Cities</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Area Filter */}
              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1 uppercase tracking-wider">Area</label>
                <select
                  value={selectedArea}
                  onChange={(e) => { setSelectedArea(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#c8a45e]/50 cursor-pointer"
                >
                  <option value="">All Areas</option>
                  {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1 uppercase tracking-wider">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#c8a45e]/50 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              {/* Created By Filter */}
              <div>
                <label className="block text-[11px] font-medium text-white/40 mb-1 uppercase tracking-wider">Created By</label>
                <select
                  value={selectedCreator}
                  onChange={(e) => { setSelectedCreator(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#c8a45e]/50 cursor-pointer"
                >
                  <option value="">All Creators</option>
                  {creators.map((cr) => <option key={cr} value={cr}>{cr}</option>)}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#c8a45e]" />
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/5 border-b border-white/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12 py-3 px-4">
                    <Checkbox 
                      checked={paginatedItems.length > 0 && paginatedItems.every((item) => selectedIds.includes(item.id))}
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      className="border-white/20 bg-white/5 data-[state=checked]:bg-[#c8a45e] data-[state=checked]:text-black"
                    />
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('projectName')}>
                    <div className="flex items-center gap-1.5">
                      Project Name
                      {sortKey === 'projectName' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#c8a45e]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#c8a45e]" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('builderName')}>
                    <div className="flex items-center gap-1.5">
                      Builder
                      {sortKey === 'builderName' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#c8a45e]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#c8a45e]" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('city')}>
                    <div className="flex items-center gap-1.5">
                      City
                      {sortKey === 'city' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#c8a45e]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#c8a45e]" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('location')}>
                    <div className="flex items-center gap-1.5">
                      Area
                      {sortKey === 'location' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#c8a45e]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#c8a45e]" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      Status
                      {sortKey === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#c8a45e]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#c8a45e]" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider cursor-pointer select-none animate-none" onClick={() => handleSort('leads')}>
                    <div className="flex items-center gap-1.5">
                      Leads
                      {sortKey === 'leads' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#c8a45e]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#c8a45e]" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('updatedAt')}>
                    <div className="flex items-center gap-1.5">
                      Last Updated
                      {sortKey === 'updatedAt' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#c8a45e]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#c8a45e]" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="py-3 px-4 text-xs font-semibold text-white/50 uppercase tracking-wider select-none">
                    Public URL
                  </TableHead>
                  <TableHead className="py-3 px-4 text-right text-xs font-semibold text-white/50 uppercase tracking-wider select-none">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((m) => (
                  <TableRow key={m.id} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-fast">
                    <TableCell className="py-1 px-4">
                      <Checkbox
                        checked={selectedIds.includes(m.id)}
                        onCheckedChange={(checked) => handleSelectItem(m.id, !!checked)}
                        className="border-white/20 bg-white/5 data-[state=checked]:bg-[#c8a45e] data-[state=checked]:text-black"
                      />
                    </TableCell>
                    <TableCell className="py-1 px-4 font-medium text-white max-w-[240px] truncate">
                      <div className="flex items-center gap-3">
                        {m.thumbnailUrl ? (
                          <Image src={m.thumbnailUrl} alt={m.projectName} width={40} height={40} className="w-10 h-10 object-cover rounded-lg border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white/30">
                            <Building2 className="w-5 h-5 text-[#c8a45e]/80" />
                          </div>
                        )}
                        <div className="truncate">
                          <span className="font-semibold block truncate">{m.projectName || 'Untitled'}</span>
                          <span className="text-[10px] text-white/35 block truncate">by {m.createdBy?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-1 px-4 text-white/70 max-w-[120px] truncate text-sm">{m.builderName}</TableCell>
                    <TableCell className="py-1 px-4 text-white/70 max-w-[100px] truncate text-sm">{m.city || '—'}</TableCell>
                    <TableCell className="py-1 px-4 text-white/70 max-w-[120px] truncate text-sm">{m.location || '—'}</TableCell>
                    <TableCell className="py-1 px-4">
                      <Badge variant="outline" className={getStatusBadgeClass(m.status)}>
                        {getStatusLabel(m.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-1 px-4 text-white/75 font-mono text-xs">{m._count?.leads ?? 0}</TableCell>
                    <TableCell className="py-1 px-4 text-white/40 text-xs">
                      {formatDate(m.updatedAt)}
                    </TableCell>
                    <TableCell className="py-1 px-4">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleCopyUrl(m.slug)} 
                          className="inline-flex items-center justify-center p-1.5 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition"
                          title="Copy URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <a 
                          href={`https://11estates.in/${m.slug}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center justify-center p-1.5 text-white/40 hover:text-[#c8a45e] bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition"
                          title="Open Website"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="py-1 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 text-white/40 hover:text-white bg-transparent hover:bg-white/5 rounded-md transition select-none">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#141414] border border-white/10 text-white min-w-[140px]">
                          <DropdownMenuItem className="focus:bg-white/5 focus:text-[#c8a45e] cursor-pointer gap-2" onClick={() => router.push(`/dashboard/microsites/${m.id}/edit`)}>
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-white/5 focus:text-[#c8a45e] cursor-pointer gap-2" onClick={() => handlePreview(m.slug)}>
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-white/5 focus:text-[#c8a45e] cursor-pointer gap-2" onClick={() => window.open(`https://11estates.in/${m.slug}`, '_blank')}>
                            <ExternalLink className="w-3.5 h-3.5" /> Open Website
                          </DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-white/5 focus:text-[#c8a45e] cursor-pointer gap-2" onClick={() => handleCopyUrl(m.slug)}>
                            <Copy className="w-3.5 h-3.5" /> Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-white/5 focus:text-[#c8a45e] cursor-pointer gap-2" onClick={() => handleDuplicate(m.id)}>
                            <CopyPlus className="w-3.5 h-3.5" /> Duplicate
                          </DropdownMenuItem>
                          {m.status !== 'ARCHIVED' && (
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-[#c8a45e] cursor-pointer gap-2" onClick={() => handleUpdateStatus(m.id, 'ARCHIVED')}>
                              <Archive className="w-3.5 h-3.5" /> Archive
                            </DropdownMenuItem>
                          )}
                          {m.status !== 'PUBLISHED' && (
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-emerald-400 cursor-pointer gap-2" onClick={() => handleUpdateStatus(m.id, 'PUBLISHED')}>
                              <Eye className="w-3.5 h-3.5" /> Publish
                            </DropdownMenuItem>
                          )}
                          {m.status === 'PUBLISHED' && (
                            <DropdownMenuItem className="focus:bg-white/5 focus:text-amber-400 cursor-pointer gap-2" onClick={() => handleUpdateStatus(m.id, 'DRAFT')}>
                              <EyeOff className="w-3.5 h-3.5" /> Unpublish (Draft)
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-white/5" />
                          <DropdownMenuItem className="focus:bg-red-500/10 focus:text-red-400 text-red-400 cursor-pointer gap-2" onClick={() => handleDelete(m.id)}>
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {paginatedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-16 text-center text-white/40">
                      <FileText className="w-10 h-10 mx-auto mb-3 text-white/20" />
                      No project microsites found matching current criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {sortedItems.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-white/5 bg-white/5 text-xs text-white/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-[#0a0a0a] border border-white/10 rounded px-2 py-1 outline-none text-white focus:border-[#c8a45e]/50 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div>
                  Showing {startIndex + 1}–{Math.min(startIndex + rowsPerPage, sortedItems.length)} of {sortedItems.length} projects
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="p-1.5 rounded border border-white/10 hover:bg-white/5 transition disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 font-medium text-white/70">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded border border-white/10 hover:bg-white/5 transition disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#141414] border border-white/10 rounded-full px-6 py-3 shadow-xl flex items-center gap-4 text-sm text-white"
          >
            <span className="font-semibold text-[#c8a45e]">
              {selectedIds.length} selected
            </span>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkCopyUrls}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/5 text-white/80 transition"
              >
                <Copy className="w-3.5 h-3.5" /> Copy URLs
              </button>
              <button
                onClick={() => executeBulkAction('publish')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-emerald-500/10 text-emerald-400 transition"
              >
                <Eye className="w-3.5 h-3.5" /> Publish
              </button>
              <button
                onClick={() => executeBulkAction('archive')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-zinc-500/10 text-zinc-400 transition"
              >
                <Archive className="w-3.5 h-3.5" /> Archive
              </button>
              <button
                onClick={() => executeBulkAction('delete')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-500/10 text-red-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-white/40 hover:text-white transition"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
