import Link from "next/link";

export default function Sidebar() {
    return (
        <div className="drawer-side z-20 lg:h-auto">
            <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
            <ul className="menu p-4 w-64 min-h-full bg-base-100 text-base-content flex flex-col justify-between border-r border-base-300">
                {/* Top Section */}
                <div>
                    <li className="mb-4">
                        <div className="px-4 py-2">
                            <span className="text-sm font-semibold uppercase opacity-50">Menu</span>
                        </div>
                    </li>
                    <li>
                        <Link href="/dashboard" className="active">Overview</Link>
                    </li>
                    <li>
                        <Link href="/dashboard/patients">Patients</Link>
                    </li>
                    <li>
                        <Link href="/dashboard/pages">Pages</Link>
                    </li>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-base-300 pt-4">
                    <li>
                        <Link href="/auth/login" className="text-error">Logout</Link>
                    </li>
                </div>
            </ul>
        </div>
    );
}
