import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const closeMenu = () => setIsOpen(false);

	return (
		<header className="border-b border-[#e1eceb] bg-white">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
				<Link to="/" onClick={closeMenu} className="text-base font-black tracking-[-0.04em] text-[#007d7b]">MoveMate</Link>
				<button type="button" aria-label="Toggle navigation" aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d7e7e5] text-lg text-[#173c41] md:hidden">{isOpen ? "×" : "☰"}</button>
				<nav aria-label="Public navigation" className={`${isOpen ? "flex" : "hidden"} absolute left-0 right-0 top-[57px] z-10 flex-col border-b border-[#e1eceb] bg-white px-6 py-4 shadow-lg md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:p-0 md:shadow-none`}>
					<a href="/#features" onClick={closeMenu} className="py-3 text-xs font-semibold text-[#526d70] transition hover:text-[#007d7b] md:py-0">Features</a>
					<a href="/#how-it-works" onClick={closeMenu} className="py-3 text-xs font-semibold text-[#526d70] transition hover:text-[#007d7b] md:py-0">How It Works</a>
					<NavLink to="/dashboard" onClick={closeMenu} className="py-3 text-xs font-semibold text-[#526d70] transition hover:text-[#007d7b] md:py-0">Routes</NavLink>
					<Link to="/signup" onClick={closeMenu} className="mt-2 rounded-lg bg-[#007d7b] px-4 py-2.5 text-center text-xs font-bold text-white transition hover:bg-[#006966] md:mt-0">Get the App</Link>
				</nav>
			</div>
		</header>
	);
}

export default Navbar;
