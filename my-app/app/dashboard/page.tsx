export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-title">Total Patients</div>
                    <div className="stat-value text-primary">89</div>
                    <div className="stat-desc">21% more than last month</div>
                </div>

                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-title">New Registrations</div>
                    <div className="stat-value text-secondary">12</div>
                    <div className="stat-desc">This week</div>
                </div>

                <div className="stat bg-base-100 shadow rounded-box">
                    <div className="stat-title">Pending Appointments</div>
                    <div className="stat-value">5</div>
                    <div className="stat-desc">For today</div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <p>No recent activity to display.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
