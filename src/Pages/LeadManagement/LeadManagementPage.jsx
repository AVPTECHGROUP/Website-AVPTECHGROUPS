import { useCallback, useEffect, useState } from "react";
import { Users, Sparkles, PhoneCall, CalendarClock, CheckCircle2, XCircle } from "lucide-react";
import StatCard from "../../Components/Leads/StatCards.jsx";
import LeadsFilterBar from "../../Components/Leads/LeadsFilterbar.jsx";
import LeadsTable from "../../Components/Leads/LeadsTable.jsx";
import LeadViewModal from "../../Components/Leads/LeadViewModal.jsx";
import LeadEditModal from "../../Components/Leads/LeadEditModal.jsx";
import { LEAD_STAT_CARDS, DEFAULT_PAGE_SIZE } from "../../Constants/StringConstants/LeadsConstants.js";
import { getLeadStats, getLeads } from "../../Api/Demoleads/Demoleads.js";

const STAT_ICONS = {
    total: Users,
    newCount: Sparkles,
    contacted: PhoneCall,
    demoScheduled: CalendarClock,
    converted: CheckCircle2,
    lost: XCircle,
};

const LeadManagementPage = () => {
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    const [leads, setLeads] = useState([]);
    const [pageData, setPageData] = useState({ totalElements: 0, totalPages: 0 });
    const [leadsLoading, setLeadsLoading] = useState(true);
    const [leadsError, setLeadsError] = useState("");

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    // Separate state for the two modals — view is read-only, edit is the
    // only place that talks to the update API.
    const [viewLead, setViewLead] = useState(null);
    const [editLead, setEditLead] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Debounce free-text search so we don't fire a request per keystroke.
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    // Reset to page 0 whenever filters change.
    useEffect(() => {
        setPage(0);
    }, [debouncedSearch, status, pageSize]);

    const loadStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await getLeadStats();
            setStats(data);
        } catch {
            // Stats failing shouldn't block the table — cards just show 0/blank.
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const loadLeads = useCallback(async () => {
        setLeadsLoading(true);
        setLeadsError("");
        try {
            const data = await getLeads({
                status: status || undefined,
                search: debouncedSearch || undefined,
                page,
                size: pageSize,
            });
            setLeads(data?.content ?? []);
            setPageData({
                totalElements: data?.totalElements ?? 0,
                totalPages: data?.totalPages ?? 0,
            });
        } catch (err) {
            setLeadsError(err.message || "Unable to reach the server.");
            setLeads([]);
        } finally {
            setLeadsLoading(false);
        }
    }, [status, debouncedSearch, page, pageSize]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        loadLeads();
    }, [loadLeads]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadStats(), loadLeads()]);
        setRefreshing(false);
    };

    const handleUpdated = () => {
        // Re-sync the list + stats after a status change so counts stay accurate.
        loadStats();
        loadLeads();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Demo Request Leads</h1>
                    <p className="text-sm text-slate-500">
                        Internal lead management — track, assign, and convert inbound demo requests.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {LEAD_STAT_CARDS.map((card) => (
                        <StatCard
                            key={card.key}
                            label={card.label}
                            value={stats?.[card.key]}
                            accent={card.accent}
                            icon={STAT_ICONS[card.key]}
                            loading={statsLoading}
                        />
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <LeadsFilterBar
                        search={search}
                        onSearchChange={setSearch}
                        status={status}
                        onStatusChange={setStatus}
                        onRefresh={handleRefresh}
                        refreshing={refreshing}
                    />
                    <LeadsTable
                        leads={leads}
                        loading={leadsLoading}
                        error={leadsError}
                        onView={setViewLead}
                        onEdit={setEditLead}
                        page={page}
                        totalPages={pageData.totalPages}
                        totalElements={pageData.totalElements}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                    />
                </div>
            </div>

            {viewLead && (
                <LeadViewModal
                    lead={viewLead}
                    onClose={() => setViewLead(null)}
                    onEdit={(lead) => {
                        setViewLead(null);
                        setEditLead(lead);
                    }}
                />
            )}

            {editLead && (
                <LeadEditModal
                    lead={editLead}
                    onClose={() => setEditLead(null)}
                    onUpdated={(updated) => {
                        setEditLead(updated);
                        handleUpdated();
                    }}
                />
            )}
        </div>
    );
};

export default LeadManagementPage;