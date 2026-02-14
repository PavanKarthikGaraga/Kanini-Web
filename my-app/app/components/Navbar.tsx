export default function Navbar() {
    return (
        <div className="navbar bg-base-100 shadow-sm border-b border-base-300 z-30">
            <div className="flex-none lg:hidden">
                <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost drawer-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </label>
            </div>
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">Admin Dashboard</a>
            </div>
        </div>
    );
}
