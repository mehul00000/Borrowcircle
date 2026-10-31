'use client';

import { useEffect, useState } from 'react';
import * as api from '@borrowcircle/shared';
import { formatDate, initials } from '@borrowcircle/shared';
import { AppHeader, Button, EmptyState, Spinner } from '@/components/ui';
import { PageHead, RequireAuth } from '@/components/RequireAuth';

export default function AdminPage() {
  return (
    <RequireAuth>
      <AdminInner />
    </RequireAuth>
  );
}

function AdminInner() {
  const [stats, setStats] = useState<api.AdminStats | null>(null);
  const [users, setUsers] = useState<api.AdminUserRow[]>([]);
  const [reports, setReports] = useState<api.UserReport[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    void (async () => {
      const admin = await api.isAdmin();
      setIsAdmin(admin);
      setChecked(true);
      if (!admin) return;
      const [s, u, r] = await Promise.all([api.getAdminStats(), api.adminListUsers(), api.adminListReports()]);
      setStats(s);
      setUsers(u);
      setReports(r);
    })();
  }, []);

  if (!checked) return <><AppHeader /><main className="shell page"><Spinner /></main></>;
  if (!isAdmin) {
    return (
      <div className="discover-page">
        <AppHeader />
        <main className="shell page">
          <EmptyState icon="shield" title="Administrators only" text="Your account does not have admin permissions. Ask an existing administrator to grant access via the user_roles table." />
        </main>
      </div>
    );
  }

  return (
    <div className="discover-page">
      <AppHeader />
      <main className="shell page">
        <PageHead kicker="Platform oversight" title="Admin dashboard" text="Users, listings, reports and disputes across BorrowCircle." />

        {stats && (
          <div className="admin-stats">
            <div className="stat-card"><strong>{stats.total_users}</strong><small>Total users</small></div>
            <div className="stat-card"><strong>{stats.active_listings}</strong><small>Active listings</small></div>
            <div className="stat-card"><strong>{stats.borrow_requests}</strong><small>Borrow requests</small></div>
            <div className="stat-card"><strong>{stats.completed_transactions}</strong><small>Completed transactions</small></div>
            <div className="stat-card"><strong>{stats.open_disputes}</strong><small>Open disputes</small></div>
          </div>
        )}

        <div className="panel">
          <h3>Users</h3>
          <input
            className="field"
            style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '11px 14px', width: 'min(360px, 100%)', font: 'inherit', marginBottom: 14 }}
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              void api.adminListUsers(e.target.value).then(setUsers);
            }}
          />
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Locality</th>
                <th>Joined</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.full_name}</strong>
                    <div style={{ color: 'var(--faint)', fontSize: 10 }}>{initials(u.full_name)} · {u.username ?? '—'}</div>
                  </td>
                  <td>{u.locality ?? '—'}</td>
                  <td>{u.created_at ? formatDate(u.created_at) : '—'}</td>
                  <td><span className={`badge badge--${u.account_status === 'ACTIVE' ? 'active' : 'overdue'}`}>{u.account_status.toLowerCase()}</span></td>
                  <td>
                    <Button
                      variant="secondary"
                      disabled={busy === u.id}
                      onClick={async () => {
                        setBusy(u.id);
                        const next = u.account_status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                        await api.adminSetUserStatus(u.id, next);
                        setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, account_status: next } : x)));
                        setBusy('');
                      }}
                    >
                      {u.account_status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel" style={{ marginTop: 18 }}>
          <h3>Reports &amp; disputes</h3>
          {reports.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Reason</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Opened</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.reason}</strong></td>
                    <td>{r.description ?? '—'}</td>
                    <td><span className="badge badge--pending">{r.status.toLowerCase()}</span></td>
                    <td>{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: 12 }}>No reports have been filed. Disputed transactions appear here when a party reports an issue.</p>
          )}
        </div>
      </main>
    </div>
  );
}
